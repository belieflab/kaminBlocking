"use strict";

const calibrationPoints = [
    [10, 10],
    [50, 10],
    [90, 10],
    [10, 50],
    [50, 50],
    [90, 50],
    [10, 90],
    [50, 90],
    [90, 90],
];
const driftValidationPoints = [
    [10, 10],
    [90, 10],
    [50, 50],
    [10, 90],
    [90, 90],
];
// Source (Spec): https://www.jspsych.org/v7/overview/eye-tracking/
// Source (Paper): Van der Cruyssen et al. 2024 (QC burden/attrition context) https://pmc.ncbi.nlm.nih.gov/articles/PMC11289066/
// Note: Drift validation points are repo-defined policy for periodic quality checks.
const calibRepsByAttempt = [2, 3];
const maxCalibrationAttempts = calibRepsByAttempt.length;
// POLICY: Validation pass/fail cutoffs are project thresholds and should be pilot-justified.
// REPO: mean_in_roi and avg_offset are compared against these constants in isValidationPass().
// LINK: https://www.jspsych.org/v7/plugins/webgazer-validate/
// Source (Spec): https://www.jspsych.org/v7/plugins/webgazer-validate/
// Source (Paper): Papoutsaki et al. 2016 (WebGazer foundation) https://cs.brown.edu/people/apapouts/papers/ijcai2016webgazer.pdf
// Source (Paper): Yang & Krajbich 2021 (ROI/threshold protocol precedent) https://ideas.repec.org/a/cup/judgdm/v16y2021i6p1485-1505_7.html
// Note: Threshold values here are repo-defined policy, not claimed as fixed paper defaults.
const meanInRoiThreshold = 70;
const avgOffsetPassPx = 200;
const avgOffsetStrongPassPx = 150;
// POLICY: Minimum per-point sample count for weighted mean_in_roi aggregation.
// REPO: Applied in computeValidationMetrics() candidate filtering.
// LINK: https://www.jspsych.org/v7/plugins/webgazer-validate/
// Source (Spec): https://www.jspsych.org/v7/plugins/webgazer-validate/
// Source (Paper): Van der Cruyssen et al. 2024 (online webcam ET QC/attrition burden) https://pmc.ncbi.nlm.nih.gov/articles/PMC11289066/
const validationMinSamplesPerPoint = 20;
// SPEC: ROI radius sets acceptable distance around each validation target (pixels).
// REPO: Shared by validation trial params and summary/report fields.
// LINK: https://www.jspsych.org/v7/plugins/webgazer-validate/
const roiRadius = 200;
// SPEC: Calibrate plugin positions calibration_points via CSS percent left/top; no coordinate-mode param is exposed.
// REPO: calibrationPoints are percent pairs and this constant is logged for contract clarity.
// LINK: https://www.jspsych.org/v7/plugins/webgazer-calibrate/
const calibrationPointCoordinates = "percent";
let calibrationAttempt = 0;
let calibrationTerminalFail = false;
let currentCalibRepsPerPoint = calibRepsByAttempt[0];
let calibrationStartTs = null;
let validationStartTs = null;
let lastValidationSummary = null;
let cameraGateFailed = false;
let cameraGateTimedOut = false;
let cameraGateHardFail = false;
let cameraGateDurationMs = null;
let cameraGateFailureReason = null;
const runtimeDebugLog = (...args) => {
    if (typeof debug !== "undefined" && debug) {
        console.log(...args);
    }
};
let cameraGateLatestQuality = {
    face_box_w: null,
    face_box_h: null,
    center_jitter: null,
    brightness: null,
};

const cameraGateCore =
    typeof KaminCameraGateCore !== "undefined" ? KaminCameraGateCore : null;
const cameraGatePolicy = cameraGateCore
    ? cameraGateCore.normalizePolicy(runtimeConf && runtimeConf.cameraGatePolicy)
    : runtimeConf && runtimeConf.cameraGatePolicy
      ? runtimeConf.cameraGatePolicy
      : "fail_open_but_exclude";

function getDisplayMetrics() {
    return {
        screen_w: window.screen && Number.isFinite(window.screen.width) ? window.screen.width : null,
        screen_h: window.screen && Number.isFinite(window.screen.height) ? window.screen.height : null,
        window_w: window.innerWidth,
        window_h: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        // compatibility aliases retained for downstream consumers
        display_width_px: window.innerWidth,
        display_height_px: window.innerHeight,
        device_pixel_ratio: window.devicePixelRatio || 1,
    };
}

function getCameraFps() {
    try {
        const video = document.getElementById("webgazerVideoFeed");
        if (
            video &&
            video.srcObject &&
            video.srcObject.getVideoTracks &&
            video.srcObject.getVideoTracks().length > 0
        ) {
            const track = video.srcObject.getVideoTracks()[0];
            if (track.getSettings) {
                const settings = track.getSettings();
                if (settings && Number.isFinite(settings.frameRate)) {
                    return settings.frameRate;
                }
            }
        }
    } catch (error) {
        console.warn("Could not read camera FPS", error);
    }
    return null;
}

function getCurrentCalibRepsPerPoint() {
    return calibRepsByAttempt[Math.min(calibrationAttempt, maxCalibrationAttempts - 1)];
}

function normalizePercentInRoi(percentInRoi) {
    if (!Array.isArray(percentInRoi)) {
        return [];
    }
    return percentInRoi.map((value) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    });
}

function isValidPercent(value) {
    return Number.isFinite(value) && value >= 0 && value <= 100;
}

function computePointSampleCounts(webgazerData, expectedPointCount) {
    const counts = new Array(expectedPointCount).fill(0);
    if (!Array.isArray(webgazerData)) {
        return counts;
    }
    // SPEC: validate payload raw_gaze is grouped by validation point.
    // REPO: per-point counts use raw_gaze[i].length without interpolation/guessing.
    // LINK: https://www.jspsych.org/v7/plugins/webgazer-validate/
    for (let i = 0; i < counts.length; i++) {
        counts[i] = Array.isArray(webgazerData[i]) ? webgazerData[i].length : 0;
    }
    return counts;
}

function sanitizeRawGazeByPoint(rawGaze) {
    if (!Array.isArray(rawGaze)) {
        return [];
    }
    const sanitized = [];
    for (let i = 0; i < rawGaze.length; i++) {
        const pointSamples = Array.isArray(rawGaze[i]) ? rawGaze[i] : [];
        const cleanSamples = pointSamples.filter((sample) => {
            if (!sample || typeof sample !== "object") {
                return false;
            }
            const x = Number(sample.x);
            const y = Number(sample.y);
            const dx = Number(sample.dx);
            const dy = Number(sample.dy);
            const t = Number(sample.t);
            return (
                Number.isFinite(x) &&
                Number.isFinite(y) &&
                Number.isFinite(dx) &&
                Number.isFinite(dy) &&
                Number.isFinite(t)
            );
        });
        sanitized.push(cleanSamples);
    }
    return sanitized;
}

function computeSamplesPerSec(samples, durationMs) {
    if (!Array.isArray(samples) || samples.length === 0) {
        return null;
    }

    const normalizedSamples =
        Array.isArray(samples[0]) ? samples.flat().filter((sample) => sample && typeof sample === "object") : samples;
    if (normalizedSamples.length === 0) {
        return null;
    }

    const firstSample = normalizedSamples[0];
    const lastSample = normalizedSamples[normalizedSamples.length - 1];
    const firstTs = Number(
        (firstSample && (firstSample.t || firstSample.ts || firstSample.timestamp || firstSample.time)) ||
            NaN,
    );
    const lastTs = Number(
        (lastSample && (lastSample.t || lastSample.ts || lastSample.timestamp || lastSample.time)) || NaN,
    );

    if (Number.isFinite(firstTs) && Number.isFinite(lastTs) && lastTs > firstTs) {
        return normalizedSamples.length / ((lastTs - firstTs) / 1000);
    }
    if (Number.isFinite(durationMs) && durationMs > 0) {
        return normalizedSamples.length / (durationMs / 1000);
    }
    return null;
}

function resolveAvgOffset(validationData) {
    const perPoint = Array.isArray(validationData.average_offset)
        ? validationData.average_offset
        : null;
    if (!perPoint || perPoint.length === 0) {
        return null;
    }
    const radii = perPoint
        .map((entry) => (entry && typeof entry === "object" ? Number(entry.r) : null))
        .filter((value) => Number.isFinite(value));
    if (radii.length === 0) {
        return null;
    }
    // SPEC: average_offset contains per-point offset summaries from validate.
    // REPO: average_offset shape assumed as Array<{x:number,y:number,r:number}>; scalar avgOffset is mean(r).
    // WHY: one deterministic scalar is needed for pass/fail and logging.
    // LINK: https://www.jspsych.org/v7/plugins/webgazer-validate/
    return radii.reduce((sum, value) => sum + value, 0) / radii.length;
}

function resolveValidationRawGaze(validationData) {
    const keys = ["raw_gaze", "webgazer_data", "rawGaze"];
    for (let i = 0; i < keys.length; i++) {
        if (Array.isArray(validationData[keys[i]])) {
            // SPEC: raw gaze traces are emitted per validation point.
            // REPO: canonical key is raw_gaze, with webgazer_data alias accepted for compatibility.
            // LINK: https://www.jspsych.org/v7/plugins/webgazer-validate/
            return validationData[keys[i]];
        }
    }
    return [];
}

function computeValidationMetrics(validationData, expectedPointCount) {
    // SPEC: percent_in_roi is per-point validation accuracy (% inside ROI).
    // REPO: normalized then aggregated with sample-count weights.
    // LINK: https://www.jspsych.org/v7/plugins/webgazer-validate/
    const percentInRoi = normalizePercentInRoi(validationData.percent_in_roi);
    const pointCount = expectedPointCount || percentInRoi.length;
    const rawGaze = sanitizeRawGazeByPoint(resolveValidationRawGaze(validationData));
    const pointSamples = computePointSampleCounts(rawGaze, pointCount);
    const candidates = [];
    const fallbackCandidates = [];

    for (let i = 0; i < percentInRoi.length; i++) {
        const percent = percentInRoi[i];
        const sampleCount = pointSamples[i] || 0;
        if (!isValidPercent(percent)) {
            continue;
        }
        const point = { percent: percent, samples: sampleCount };
        fallbackCandidates.push(point);
        if (sampleCount >= validationMinSamplesPerPoint) {
            candidates.push(point);
        }
    }

    const primary = candidates.length > 0 ? candidates : fallbackCandidates;
    const totalWeight = primary.reduce((sum, point) => sum + Math.max(1, point.samples), 0);
    // POLICY: weighted mean_in_roi prioritizes points with more valid gaze samples.
    const weightedSum = primary.reduce(
        (sum, point) => sum + point.percent * Math.max(1, point.samples),
        0,
    );
    const meanInRoi = totalWeight > 0 ? weightedSum / totalWeight : null;
    const avgOffset = resolveAvgOffset(validationData);

    return {
        avgOffset: avgOffset,
        meanInRoi: meanInRoi,
        pointsIncluded: primary.length,
        pointsTotal: pointCount,
        pointsDropped: Math.max(0, pointCount - primary.length),
        percentInRoiUsed: primary.map((point) => point.percent),
        pointSamples: pointSamples,
        // SPEC: validate may emit samples_per_sec; fallback derives rate from raw gaze timestamps/duration.
        // REPO: plugin value is used when finite, else computeSamplesPerSec().
        // LINK: https://www.jspsych.org/v7/plugins/webgazer-validate/
        samplesPerSec: Number.isFinite(Number(validationData.samples_per_sec))
            ? Number(validationData.samples_per_sec)
            : computeSamplesPerSec(rawGaze, validationData.validation_duration),
    };
}

function isValidationPass(summary) {
    // POLICY: pass requires bounded offset and minimum weighted mean_in_roi.
    // REPO: this gate drives retry loop decisions in calibrationProcedure.loop_function().
    return (
        summary.avgOffset !== null &&
        summary.meanInRoi !== null &&
        summary.avgOffset <= avgOffsetPassPx &&
        summary.meanInRoi >= meanInRoiThreshold
    );
}

function isValidationStrongPass(summary) {
    // POLICY: strong-pass tracks stricter offset-only quality tier.
    // REPO: stored for reporting; does not alter retry branching.
    return summary.avgOffset !== null && summary.avgOffset <= avgOffsetStrongPassPx;
}

function applyCameraGateFailure() {
    if (cameraGateCore && cameraGateCore.applyCameraGateFailure) {
        const next = cameraGateCore.applyCameraGateFailure(
            {
                cameraGateFailed: cameraGateFailed,
                cameraGateTimedOut: cameraGateTimedOut,
                cameraGateHardFail: cameraGateHardFail,
                cameraGateFailureReason: cameraGateFailureReason,
            },
            cameraGatePolicy,
        );
        cameraGateFailed = !!next.cameraGateFailed;
        cameraGateTimedOut = !!next.cameraGateTimedOut;
        cameraGateHardFail = !!next.cameraGateHardFail;
        cameraGateFailureReason = next.cameraGateFailureReason || "camera_quality_timeout";
        jsPsych.data.addProperties({
            camera_gate_failed: cameraGateFailed,
            camera_gate_timeout: cameraGateTimedOut,
            camera_gate_policy: cameraGatePolicy,
        });
        if (next.exclusionRecommended) {
            jsPsych.data.addProperties({
                exclusion_recommended: true,
                exclusion_reason: next.exclusionReason || "camera_gate_failed",
            });
        }
        return;
    }

    cameraGateFailed = true;
    cameraGateTimedOut = true;
    cameraGateHardFail = cameraGatePolicy === "fail_closed";
    cameraGateFailureReason = "camera_quality_timeout";
    jsPsych.data.addProperties({
        camera_gate_failed: true,
        camera_gate_timeout: true,
        camera_gate_policy: cameraGatePolicy,
        exclusion_recommended: true,
        exclusion_reason: "camera_gate_failed",
    });
}

function computeFaceCenterJitter(samples) {
    if (!Array.isArray(samples) || samples.length < 2) {
        return null;
    }
    let total = 0;
    for (let i = 1; i < samples.length; i++) {
        const dx = samples[i].x - samples[i - 1].x;
        const dy = samples[i].y - samples[i - 1].y;
        total += Math.sqrt(dx * dx + dy * dy);
    }
    return total / (samples.length - 1);
}

function hideWebgazerUi() {
    if (typeof webgazer === "undefined") {
        return;
    }
    webgazer.showVideo(false);
    webgazer.showFaceOverlay(false);
    webgazer.showFaceFeedbackBox(false);
    webgazer.showPredictionPoints(false);
}

/* define welcome message trial */
const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[0],
    choices: "ALL_KEYS", //ascii spacebar
};

const chinrestCore = typeof KaminChinrestCore !== "undefined" ? KaminChinrestCore : null;
const chinrestConfig =
    runtimeConf && runtimeConf.virtualChinrest ? runtimeConf.virtualChinrest : {};

const chinrestStateFallback = {
    chinrestEnabled: !!chinrestConfig.enabled,
    chinrestUsed: false,
    chinrestPassed: false,
    chinrestFailed: false,
    chinrestFailureReason: null,
    chinrestMetrics: null,
};
const chinrestRuntime = {
    preflightStatus: "skipped",
    shouldRunTrial: false,
};

const chinrestDataPort = {
    addGlobal: function (props) {
        jsPsych.data.addProperties(props);
    },
    annotateTrial: function (_stageIdOrTrialId, props, trialData) {
        if (trialData && typeof trialData === "object") {
            Object.assign(trialData, props);
        }
    },
    writeFinalSummary: function (summaryProps) {
        jsPsych.data.addProperties(summaryProps);
    },
};

const chinrestPluginPort = {
    isAvailable: function () {
        return typeof globalThis.jsPsychVirtualChinrest !== "undefined";
    },
    run: function (config) {
        return {
            type: globalThis.jsPsychVirtualChinrest,
            blindspot_reps: config.blindspot_reps,
            resize_units: config.resize_units,
            pixels_per_unit: config.pixels_per_unit,
            item_path: config.item_path,
        };
    },
};

const chinrestScaleGuardPort = {
    getGuard: function () {
        return document.documentElement.hasAttribute("data-chinrest-scale-applied");
    },
    setGuard: function (enabled) {
        if (enabled) {
            document.documentElement.setAttribute("data-chinrest-scale-applied", "1");
            return;
        }
        document.documentElement.removeAttribute("data-chinrest-scale-applied");
    },
    getCachedMetrics: function () {
        return window.__virtualChinrestMetrics || null;
    },
    setCachedMetrics: function (metrics) {
        window.__virtualChinrestMetrics = metrics;
    },
};

const chinrestTerminationPort = {
    persistAndExit: function (reason, payload) {
        jsPsych.data.addProperties(
            Object.assign(
                {
                    termination_reason: reason,
                },
                payload || {},
            ),
        );
        writeCsvRedirect();
        experimentComplete = true;
        if (typeof webgazer !== "undefined") {
            webgazer.showVideo(false);
            webgazer.showFaceOverlay(false);
            webgazer.showFaceFeedbackBox(false);
            webgazer.showPredictionPoints(false);
        }
    },
};

let chinrestController = null;
let chinrestFlowController = {
    shouldRunChinrestStage: function () {
        return false;
    },
    shouldRunCalibration: function () {
        return true;
    },
    shouldRunMainTask: function () {
        return true;
    },
    shouldRunFailureExit: function () {
        return false;
    },
};

if (chinrestCore) {
    chinrestController = chinrestCore.createChinrestController({
        chinrestConfig: chinrestConfig,
        pluginPort: chinrestPluginPort,
        dataPort: chinrestDataPort,
        scaleGuardPort: chinrestScaleGuardPort,
        terminationPort: chinrestTerminationPort,
        taskIdentifier: "chinrest_failure_exit",
    });
    chinrestFlowController = chinrestCore.createChinrestFlowController(function () {
        return chinrestController.getState();
    }, {
        isHardCameraGateFailed: function () {
            return cameraGateHardFail === true;
        },
    });
} else {
    console.error("Chinrest core module unavailable; chinrest is forced disabled.");
    chinrestStateFallback.chinrestEnabled = false;
}

window.kbChinrestController = chinrestController;
window.kbChinrestFlowController = chinrestFlowController;
window.kbCameraGateState = {
    isHardFail: function () {
        return cameraGateHardFail === true;
    },
};

const virtualChinrestGate = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: "",
    choices: "NO_KEYS",
    trial_duration: 1,
    data: {
        task: "virtual_chinrest_gate",
    },
    on_finish: function (data) {
        let preflight = { status: "skipped" };
        let state = chinrestStateFallback;
        if (chinrestController) {
            preflight = chinrestController.runPreflight();
            state = chinrestController.getState();
        }
        chinrestRuntime.preflightStatus = preflight.status;
        chinrestRuntime.shouldRunTrial = preflight.status === "run_required";
        data.eye_tracking_enabled = !!eyeTrackingEnabled;
        data.virtual_chinrest_enabled = !!state.chinrestEnabled;
        if (preflight.status === "passed_cached") {
            data.chinrest_reused_metrics = true;
            data.chinrest_passed = true;
            if (state.chinrestMetrics) {
                Object.assign(data, state.chinrestMetrics);
            }
        }
        if (preflight.status === "failed") {
            data.chinrest_passed = false;
            data.chinrest_failure_reason = state.chinrestFailureReason;
        }
        chinrestDataPort.annotateTrial("virtual_chinrest_gate", {
            chinrest_preflight_status: preflight.status,
        }, data);
    },
};

const virtualChinrest = Object.assign({}, chinrestPluginPort.run(chinrestConfig), {
    data: {
        task: "virtual_chinrest",
    },
    on_finish: function (data) {
        if (!chinrestController) {
            return;
        }
        const result = chinrestController.handleRunResult(data);
        const state = chinrestController.getState();
        data.chinrest_passed = !!state.chinrestPassed;
        if (state.chinrestMetrics) {
            Object.assign(data, state.chinrestMetrics);
        }
        if (result.status === "failed") {
            data.chinrest_failure_reason = state.chinrestFailureReason;
        }
        chinrestDataPort.annotateTrial("virtual_chinrest", {
            chinrest_result_status: result.status,
        }, data);
    },
});

const virtualChinrestProcedure = {
    timeline: [
        virtualChinrestGate,
        {
            timeline: [virtualChinrest],
            conditional_function: function () {
                return chinrestRuntime.shouldRunTrial === true;
            },
        },
    ],
    conditional_function: function () {
        return chinrestFlowController.shouldRunChinrestStage();
    },
};

const chinrestFailureExitTrial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        const reason =
            chinrestController && chinrestController.getFailureReason
                ? chinrestController.getFailureReason()
                : "chinrest_failed";
        return `
            <h2>Setup Check Failed</h2>
            <p>We could not complete required display setup checks.</p>
            <p>Failure reason: <code>${reason}</code></p>
            <p>Your session will now be saved and ended.</p>
        `;
    },
    choices: "NO_KEYS",
    trial_duration: 1500,
    data: {
        task: "chinrest_failure_exit",
    },
    on_finish: function (data) {
        const reason =
            chinrestController && chinrestController.getFailureReason
                ? chinrestController.getFailureReason()
                : "chinrest_failed";
        data.chinrest_failure_reason = reason;
        if (chinrestController && chinrestController.persistFailureAndExit) {
            chinrestController.persistFailureAndExit();
        } else {
            chinrestTerminationPort.persistAndExit(reason, {
                task: "chinrest_failure_exit",
                chinrest_failure_reason: reason,
            });
        }
    },
};

const chinrestFailureExit = {
    timeline: [chinrestFailureExitTrial],
    conditional_function: function () {
        return chinrestFlowController.shouldRunFailureExit();
    },
};

const cameraInit = {
    type: jsPsychWebgazerInitCamera,
    // SPEC: init-camera requests permission, initializes stream, and ensures face is visible before ET trials.
    // REPO: pushed before calibrationProcedure in exp/main.js when eyeTrackingEnabled is true.
    // LINK: https://www.jspsych.org/v7/plugins/webgazer-init-camera/
    // Source (Spec): https://www.jspsych.org/v7/plugins/webgazer-init-camera/
    // Source (Paper): Steffan et al. 2024 (remote webcam ET validation context) https://pmc.ncbi.nlm.nih.gov/articles/PMC10841511/
    // Source (Paper): Van der Cruyssen et al. 2024 (online webcam ET exclusions/QC burden) https://pmc.ncbi.nlm.nih.gov/articles/PMC11289066/
    // Note: Face-visibility gating is repo policy to operationalize camera-quality exclusion criteria.
    instructions: `
        <p>Initializing eye tracker...</p>
        <p>Please wait and allow camera access if prompted.</p>
        <p style="font-size: 18px; color: #888;">
            Position your face so it's clearly visible in the camera preview.
        </p>
    `,
    button_text: "My face is centered - Continue", //this will only appear when the face is center

    on_finish: function () {
        if (
            runtimeConf &&
            runtimeConf.webgazer &&
            runtimeConf.webgazer.regression_module &&
            webgazer.setRegression
        ) {
            webgazer.setRegression(runtimeConf.webgazer.regression_module);
        }
        webgazer.showVideo(true); //the webcam video
        webgazer.showFaceOverlay(true); //the box for the face
        webgazer.showFaceFeedbackBox(true); //quality box
        // Keep gaze dot hidden during calibration; show only on validation visualization.
        webgazer.showPredictionPoints(false);
        runtimeDebugLog("WebGazer display options configured");
    },
};

const cameraQualityCheck = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <h2>Camera Quality Check</h2>
        <p>Keep your face centered and still while we check video quality.</p>
        <p>This may take a few seconds.</p>
    `,
    choices: "NO_KEYS",
    trial_duration: null,
    data: {
        task: "camera_quality_gate",
    },
    on_load: function () {
        const startedAt = Date.now();
        const timeoutMs = Number(
            runtimeConf && Number.isFinite(Number(runtimeConf.cameraGateTimeoutMs))
                ? Number(runtimeConf.cameraGateTimeoutMs)
                : 15000,
        );
        const minFaceBoxSize = Number(
            runtimeConf && Number.isFinite(Number(runtimeConf.cameraGateMinFaceBoxPx))
                ? Number(runtimeConf.cameraGateMinFaceBoxPx)
                : 60,
        );
        const maxCenterJitter = Number(
            runtimeConf && Number.isFinite(Number(runtimeConf.cameraGateMaxCenterJitterPx))
                ? Number(runtimeConf.cameraGateMaxCenterJitterPx)
                : 30,
        );

        const centerSamples = [];
        const intervalId = setInterval(function () {
            const now = Date.now();
            const elapsed = now - startedAt;
            const faceBox = document.getElementById("webgazerFaceFeedbackBox");
            const rect = faceBox && faceBox.getBoundingClientRect ? faceBox.getBoundingClientRect() : null;
            const faceBoxW = rect && Number.isFinite(rect.width) ? rect.width : null;
            const faceBoxH = rect && Number.isFinite(rect.height) ? rect.height : null;

            if (
                rect &&
                Number.isFinite(rect.left) &&
                Number.isFinite(rect.top) &&
                Number.isFinite(rect.width) &&
                Number.isFinite(rect.height)
            ) {
                centerSamples.push({
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                });
                if (centerSamples.length > 12) {
                    centerSamples.shift();
                }
            }

            const centerJitter = computeFaceCenterJitter(centerSamples);
            const brightness = null;

            cameraGateLatestQuality = {
                face_box_w: faceBoxW,
                face_box_h: faceBoxH,
                center_jitter: centerJitter,
                brightness: brightness,
            };

            const qualityPassed =
                Number.isFinite(faceBoxW) &&
                Number.isFinite(faceBoxH) &&
                faceBoxW >= minFaceBoxSize &&
                faceBoxH >= minFaceBoxSize &&
                (centerJitter === null || centerJitter <= maxCenterJitter);

            if (qualityPassed) {
                clearInterval(intervalId);
                cameraGateFailed = false;
                cameraGateTimedOut = false;
                cameraGateHardFail = false;
                cameraGateFailureReason = null;
                cameraGateDurationMs = elapsed;
                jsPsych.finishTrial({
                    task: "camera_quality_gate",
                    camera_gate_policy: cameraGatePolicy,
                    camera_gate_failed: false,
                    camera_gate_timeout: false,
                    camera_gate_duration_ms: elapsed,
                    quality_passed: true,
                    face_box_w: faceBoxW,
                    face_box_h: faceBoxH,
                    center_jitter: centerJitter,
                    brightness: brightness,
                });
                return;
            }

            if (elapsed >= timeoutMs) {
                clearInterval(intervalId);
                cameraGateDurationMs = elapsed;
                applyCameraGateFailure();
                jsPsych.finishTrial({
                    task: "camera_quality_gate",
                    camera_gate_policy: cameraGatePolicy,
                    camera_gate_failed: true,
                    camera_gate_timeout: true,
                    camera_gate_duration_ms: elapsed,
                    quality_passed: false,
                    face_box_w: faceBoxW,
                    face_box_h: faceBoxH,
                    center_jitter: centerJitter,
                    brightness: brightness,
                });
            }
        }, 100);
    },
    on_finish: function (data) {
        data.camera_gate_policy = cameraGatePolicy;
        data.camera_gate_failed = cameraGateFailed;
        data.camera_gate_timeout = cameraGateTimedOut;
        data.camera_gate_duration_ms = cameraGateDurationMs;
        if (!Object.prototype.hasOwnProperty.call(data, "quality_passed")) {
            data.quality_passed = !cameraGateTimedOut;
        }
        data.face_box_w = cameraGateLatestQuality.face_box_w;
        data.face_box_h = cameraGateLatestQuality.face_box_h;
        data.center_jitter = cameraGateLatestQuality.center_jitter;
        data.brightness = cameraGateLatestQuality.brightness;
        jsPsych.data.addProperties({
            camera_gate_failed: cameraGateFailed,
            camera_gate_timeout: cameraGateTimedOut,
            camera_gate_policy: cameraGatePolicy,
        });
    },
};

const calibrationInstructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <h2>Eye Tracker Calibration</h2>
        <p>You will see a series of dots appear on the screen.</p>
        <br>
        <p style="font-size: 24px; color:rgb(9, 24, 243);">
        <strong>Look at each dot and click on it.</strong>
        </p>
        <br>
        <p>This helps the eye tracker learn where you're looking.</p>
        <p>Try to keep your head still during calibration.</p>
        <br>
        <p>Press SPACE when you're ready to begin calibration.</p>
    `,
    choices: [" "],

    // Hide video so calibration dots are visible
    on_finish: function () {
        webgazer.showVideo(false);
        webgazer.showFaceOverlay(false);
        webgazer.showFaceFeedbackBox(false);
        webgazer.showPredictionPoints(false);
    },
};

const calibration = {
    type: jsPsychWebgazerCalibrate,
    // SPEC: calibration_points are screen positions (plugin renders points at those locations).
    // REPO: 9-point percent grid defined in calibrationPoints.
    // LINK: https://www.jspsych.org/v7/plugins/webgazer-calibrate/
    // Source (Spec): https://www.jspsych.org/v7/plugins/webgazer-calibrate/
    // Source (Paper): Papoutsaki et al. 2016 (WebGazer self-calibration feasibility) https://cs.brown.edu/people/apapouts/papers/ijcai2016webgazer.pdf
    calibration_points: calibrationPoints,
    // SPEC: click mode requires user click on each point to collect supervised samples.
    // REPO: click mode is used for all calibration attempts.
    // LINK: https://www.jspsych.org/v7/plugins/webgazer-calibrate/
    calibration_mode: "click",
    // SPEC: point_size controls rendered dot size.
    // REPO: fixed at 20 px for calibration visibility.
    // LINK: https://www.jspsych.org/v7/plugins/webgazer-calibrate/
    point_size: 20,
    // SPEC: repetitions_per_point defines samples collected per target.
    // REPO: value is updated at on_start via attempt schedule [2,3].
    // LINK: https://www.jspsych.org/v7/plugins/webgazer-calibrate/
    repetitions_per_point: calibRepsByAttempt[0],
    // SPEC: randomize_calibration_order shuffles point presentation.
    // REPO: enabled to reduce order effects on model fitting.
    // LINK: https://www.jspsych.org/v7/plugins/webgazer-calibrate/
    randomize_calibration_order: true,
    data: {
        task: "calibration",
    },
    on_start: function (trial) {
        jsPsych.pluginAPI.clearAllTimeouts();
        if (webgazer && webgazer.clearData) {
            webgazer.clearData();
        }
        webgazer.showPredictionPoints(false);
        currentCalibRepsPerPoint = getCurrentCalibRepsPerPoint();
        trial.repetitions_per_point = currentCalibRepsPerPoint;
        calibrationStartTs = Date.now();
    },
    on_finish: function (data) {
        const calibEndTs = Date.now();
        Object.assign(data, {
            task: "calibration",
            calib_attempt: calibrationAttempt,
            calib_reps_per_point: currentCalibRepsPerPoint,
            calibration_point_coordinates: calibrationPointCoordinates,
            camera_fps: getCameraFps(),
            calib_start_ts: calibrationStartTs,
            calib_end_ts: calibEndTs,
            calib_duration_ms:
                calibrationStartTs === null ? null : calibEndTs - calibrationStartTs,
            ...getDisplayMetrics(),
        });
    },
};

//Note for later [from https://www.jspsych.org/v7/overview/eye-tracking/]
//WebGazer's click-based calibration can be used throughout the experiment.
// You can turn this on by calling jsPsych.extensions.webgazer.startMouseCalibration()
// at any point in the experiment. If you use a continue button to
// advance through the experiment and move the location of the
// continue button around you can be making small adjustments
// to the calibration throughout.

// this is a new step with the extensions

const validationInstructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <h2>Calibration Validation</h2>
        <p>Now we will test how well the calibration worked.</p>
        <br>
        <p style="font-size: 24px; color:rgb(9, 24, 243);">
            <strong>Just LOOK at each dot - no clicking needed!</strong>
        </p>
        <br>
        <p>Keep your eyes focused on each dot until it disappears.</p>
        <p>Keep your head as still as possible.</p>
        <br>
        <p>Press SPACE when you're ready.</p>
    `,
    choices: [" "],
};

const validation = {
    type: jsPsychWebgazerValidate,
    // SPEC: validation_points define where gaze accuracy is evaluated.
    // REPO: reuses calibrationPoints for matched train/validate coverage.
    // LINK: https://www.jspsych.org/v7/plugins/webgazer-validate/
    // Source (Spec): https://www.jspsych.org/v7/plugins/webgazer-validate/
    // Source (Paper): Steffan et al. 2024 (jsPsych + WebGazer remote validation) https://pmc.ncbi.nlm.nih.gov/articles/PMC10841511/
    validation_points: calibrationPoints,
    // SPEC: coordinate mode declares validation_points units.
    // REPO: explicit "percent" to match calibration point convention in this pipeline.
    // LINK: https://www.jspsych.org/v7/plugins/webgazer-validate/
    validation_point_coordinates: calibrationPointCoordinates,
    // SPEC: roi_radius, time_to_saccade, validation_duration control acceptance radius and timing windows.
    // REPO: roiRadius=200, time_to_saccade=1000 ms, validation_duration=2000 ms.
    // LINK: https://www.jspsych.org/v7/plugins/webgazer-validate/
    roi_radius: roiRadius,
    time_to_saccade: 1000,
    validation_duration: 2000,
    // SPEC: point_size controls validation dot size; show_validation_data renders summary visualization.
    // REPO: point_size=20 and visualization enabled for operator feedback.
    // LINK: https://www.jspsych.org/v7/plugins/webgazer-validate/
    point_size: 20,
    show_validation_data: true,
    data: {
        task: "validation",
    },
    on_start: function () {
        validationStartTs = Date.now();
        // Validation plugin will show predictions itself during validation data visualization.
        webgazer.showPredictionPoints(false);
    },
    on_finish: function (data) {
        const validationEndTs = Date.now();
        const summary = computeValidationMetrics(data, calibrationPoints.length);
        lastValidationSummary = summary;
        // Keep canonical plugin field + compatibility alias for existing code paths.
        if (Array.isArray(data.raw_gaze) && !Array.isArray(data.webgazer_data)) {
            // Alias only for backward compatibility; raw_gaze remains canonical payload.
            data.webgazer_data = data.raw_gaze;
        }
        Object.assign(data, {
            task: "validation",
            calib_attempt: calibrationAttempt,
            calib_reps_per_point: currentCalibRepsPerPoint,
            calibration_point_coordinates: calibrationPointCoordinates,
            validation_point_coordinates: calibrationPointCoordinates,
            roi_radius_px: roiRadius,
            validation_point_count: calibrationPoints.length,
            camera_fps: getCameraFps(),
            avg_offset_px: summary.avgOffset,
            avg_offset: summary.avgOffset,
            mean_in_roi: summary.meanInRoi,
            validation_points_included: summary.pointsIncluded,
            validation_points_total: summary.pointsTotal,
            validation_points_dropped: summary.pointsDropped,
            validation_min_samples_per_point: validationMinSamplesPerPoint,
            percent_in_roi_used: summary.percentInRoiUsed,
            samples_per_sec: summary.samplesPerSec,
            validation_start_ts: validationStartTs,
            validation_end_ts: validationEndTs,
            validation_duration_ms:
                validationStartTs === null ? null : validationEndTs - validationStartTs,
            ...getDisplayMetrics(),
        });
    },
};

const validationResults = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        const validationData = jsPsych.data
            .get()
            .filter({ task: "validation" })
            .last(1)
            .values()[0]; //gets the validation data
        const summary =
            lastValidationSummary ||
            computeValidationMetrics(validationData, calibrationPoints.length);
        const averageAccuracy = summary.meanInRoi;
        const avgOffset = summary.avgOffset;
        const passed = isValidationPass(summary);
        const accuracyColor = passed ? "#4CAF50" : "#f44336";
        const statusText = passed ? "PASSED" : "NEEDS RECALIBRATION";
        const statusColor = passed ? "#4CAF50" : "#f44336";

        let html = `
        <h2>Calibration Results</h2>
            <div style="background: #f5f5f5; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
                
                <p style="font-size: 48px; color: ${accuracyColor}; margin: 10px 0;">
                    <strong>${
                        averageAccuracy === null ? "N/A" : averageAccuracy.toFixed(1) + "%"
                    }</strong>
                </p>
                <p style="font-size: 18px; color: #666;">Overall Accuracy</p>
                
                <hr style="margin: 20px 0;">
                
                <p style="font-size: 24px; color: ${statusColor};">
                    <strong>${statusText}</strong>
                </p>
                
                <p style="font-size: 14px; color: #888; margin-top: 20px;">
                    Average offset: ${avgOffset === null ? "N/A" : Math.round(avgOffset)} pixels<br>
                    Threshold: ${meanInRoiThreshold}% mean-in-ROI and max ${avgOffsetPassPx}px offset<br>
                    ROI radius: ${roiRadius} pixels
                </p>
            </div>
        `;

        if (passed) {
            html += `
               <br>
                <p style="color: #4CAF50;">✓ Calibration successful!</p>
                <p>Press SPACE to continue to the experiment.</p>
            `;
        } else if (calibrationAttempt < maxCalibrationAttempts - 1) {
            html += `
            <br>
            <p style="color: #f44336;">✗ Calibration accuracy is too low.</p>
            <p>Press SPACE to recalibrate (final attempt).</p>
        `;
        } else {
            html += `
            <br>
            <p style="color: #f44336;">✗ Calibration accuracy is still low.</p>
            <p>We will proceed, but this session will be flagged.</p>
            <p>Press SPACE to continue.</p>
        `;
        }
        return html;
    },

    choices: [" "],
    on_finish: function (data) {
        const validationData = jsPsych.data
            .get()
            .filter({ task: "validation" })
            .last(1)
            .values()[0];
        const summary = computeValidationMetrics(validationData, calibrationPoints.length);
        const calibPassed = isValidationPass(summary);
        const calibStrongPass = isValidationStrongPass(summary);
        const calibTerminalFail =
            !calibPassed && calibrationAttempt >= maxCalibrationAttempts - 1;

        Object.assign(data, {
            task: "validation_result",
            calib_attempt: calibrationAttempt,
            calib_reps_per_point: currentCalibRepsPerPoint,
            calib_passed: calibPassed,
            calib_strong_pass: calibStrongPass,
            calib_terminal_fail: calibTerminalFail,
            avg_offset_px: summary.avgOffset,
            avg_offset: summary.avgOffset,
            mean_in_roi: summary.meanInRoi,
            roi_radius_px: roiRadius,
            validation_point_count: calibrationPoints.length,
            validation_points_included: summary.pointsIncluded,
            validation_points_total: summary.pointsTotal,
            validation_points_dropped: summary.pointsDropped,
            validation_min_samples_per_point: validationMinSamplesPerPoint,
            percent_in_roi_used: summary.percentInRoiUsed,
            camera_fps: getCameraFps(),
            ...getDisplayMetrics(),
            // backwards-compatible aliases used in existing code
            calibration_passed: calibPassed,
            calibration_accuracy: summary.meanInRoi,
            calibration_attempt: calibrationAttempt,
            calibration_terminal_fail: calibTerminalFail,
        });

        runtimeDebugLog(
            `Calibration meanInROI: ${
                summary.meanInRoi === null ? "null" : summary.meanInRoi.toFixed(1)
            }%, Passed: ${calibPassed}`,
        );
    },
};

const calibrationAttemptLoop = {
    timeline: [
        calibrationInstructions,
        calibration,
        validationInstructions,
        validation,
        validationResults,
    ],
    conditional_function: function () {
        if (cameraGateCore && cameraGateCore.shouldRunCalibrationAttemptLoop) {
            return cameraGateCore.shouldRunCalibrationAttemptLoop(cameraGateTimedOut);
        }
        return cameraGateTimedOut !== true;
    },

    loop_function: function (data) {
        const lastResult = jsPsych.data.get().last(1).values()[0];
        const passed = lastResult.calib_passed === true || lastResult.calibration_passed === true;
        // POLICY: bounded retry loop; at most calibRepsByAttempt.length attempts.
        // REPO: increments calibrationAttempt once and exits on final failure.
        if (!passed) {
            if (calibrationAttempt < maxCalibrationAttempts - 1) {
                calibrationAttempt += 1;
                jsPsych.pluginAPI.clearAllTimeouts();
                if (webgazer && webgazer.clearData) {
                    webgazer.clearData();
                }
                runtimeDebugLog("Calibration failed - repeating calibration procedure");
                return true;
            }
            calibrationTerminalFail = true;
            runtimeDebugLog("Calibration failed after fallback - proceeding flagged");
            return false;
        }

        runtimeDebugLog("Calibration passed - continuing to experiment");
        return false;
    },
};

const calibrationProcedure = {
    timeline: [cameraQualityCheck, calibrationAttemptLoop],
};

const cameraGateFailureExit = {
    timeline: [
        {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `
                <h2>Camera Setup Failed</h2>
                <p>We could not verify camera quality for this session.</p>
                <p>Your session will now be saved and ended.</p>
            `,
            choices: "NO_KEYS",
            trial_duration: 1500,
            data: {
                task: "camera_gate_failure_exit",
            },
            on_finish: function (data) {
                data.camera_gate_failure_reason =
                    cameraGateFailureReason || "camera_quality_timeout";
                data.camera_gate_policy = cameraGatePolicy;
                data.exclusion_recommended = true;
                data.exclusion_reason = "camera_gate_failed";
                jsPsych.data.addProperties({
                    camera_gate_failure_reason: data.camera_gate_failure_reason,
                    camera_gate_policy: cameraGatePolicy,
                    exclusion_recommended: true,
                    exclusion_reason: "camera_gate_failed",
                });
                hideWebgazerUi();
                writeCsvRedirect();
                experimentComplete = true;
            },
        },
    ],
    conditional_function: function () {
        return eyeTrackingEnabled && cameraGateHardFail === true;
    },
};

const readyToStart = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        if (cameraGateFailed) {
            return `
                <h2>Camera Check Completed (Flagged)</h2>
                <p>Camera quality checks timed out and this session is flagged.</p>
                <p>Press SPACE to continue to the experiment instructions.</p>
            `;
        }
        if (calibrationTerminalFail) {
            return `
                <h2>Calibration Completed (Flagged)</h2>
                <p>Calibration did not meet thresholds after the fallback attempt.</p>
                <p>We will proceed, but this session will be flagged.</p>
                <p>Press SPACE to continue to the experiment instructions.</p>
            `;
        }
        return `
            <h2>Calibration successfully completed!</h2>
            <p>The eye tracker is now calibrated.</p>
            <p>Press SPACE to continue to the experiment instructions.</p>
        `;
    },
    choices: [" "],
    conditional_function: function () {
        return !chinrestFlowController.shouldRunFailureExit() && cameraGateHardFail === false;
    },
    on_finish: function () {
        const latestValidationResult = jsPsych.data
            .get()
            .filter({ task: "validation_result" })
            .last(1)
            .values()[0];
        const calibPassed = latestValidationResult
            ? latestValidationResult.calib_passed === true
            : cameraGateTimedOut
              ? false
              : !calibrationTerminalFail;
        const calibAttempts = latestValidationResult ? calibrationAttempt + 1 : cameraGateTimedOut ? 0 : calibrationAttempt + 1;

        webgazer.showVideo(true);
        webgazer.showFaceOverlay(true);
        webgazer.showFaceFeedbackBox(true);
        webgazer.showPredictionPoints(false); // can be true too
        // for other experiments this is useful, see https://www.jspsych.org/6.3/overview/eye-tracking/#tips-for-improving-data-quality
        jsPsych.extensions.webgazer.startMouseCalibration();
        jsPsych.data.addProperties({
            webgazer_enabled: eyeTrackingEnabled,
            calib_passed: calibPassed,
            calib_attempts: calibAttempts,
            camera_gate_failed: cameraGateFailed,
            camera_gate_timeout: cameraGateTimedOut,
            camera_gate_policy: cameraGatePolicy,
            regression_module:
                runtimeConf &&
                runtimeConf.webgazer &&
                runtimeConf.webgazer.regression_module
                    ? runtimeConf.webgazer.regression_module
                    : null,
            drift_checks:
                cameraGateCore && cameraGateCore.createEmptyDriftChecks
                    ? cameraGateCore.createEmptyDriftChecks()
                    : { total: 0, failures: 0, recalibrations: 0, skipped: true },
            calibration_final_passed: calibPassed,
            calibration_attempts: calibAttempts,
            calibration_terminal_fail: calibrationTerminalFail,
        });
        console.log("Continuous mouse calibration started");
    },
};

/* define instructions trial */
const instruction1 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[1],
    choices: [" "], //ascii spacebar
};

const instruction2 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[2],
    choices: [" "], //ascii spacebar
};

const instruction3 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[3],
    choices: ["0", "1"], //ascii spacebar
};

const instruction4 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[4],
    choices: [" "], //ascii spacebar
};

const instruction5 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[5],
    choices: [" "], //ascii spacebar
};

const instructionSet = [
    instruction1,
    instruction2,
    instruction3,
    instruction4,
    instruction5,
];

// create fixation point
const fixation = {
    // data: {test_part: 'fixation'},
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div style="color:black; font-size:60px;">+</div>',
    choices: "NO_KEYS",
    trial_duration: fixationDuration,
};

// create  trials
const stimuli = {
    type: jsPsychHtmlKeyboardResponse,

    stimulus: () => {
        var html;
        var stimulus2 = jsPsych.timelineVariable("stimulus2", true);
        if (version !== "social_kamin") {
            if (stimulus2 !== null) {
                html =
                    "<div class='stimuli-container'>" + // Changed from image-container to stimuli-container
                    "<img class='stimuli-left-allergy' src='" +
                    jsPsych.timelineVariable("stimulus", true) +
                    "'>" +
                    "<img class='stimuli-right-allergy' src='" +
                    stimulus2 +
                    "'>" +
                    "</div>";
            } else if (stimulus2 === null) {
                html =
                    "<img class='stimuli-allergy' src='" +
                    jsPsych.timelineVariable("stimulus", true) +
                    "'>";
            }
        } else {
            if (stimulus2 !== null) {
                html =
                    "<div class='stimuli-container'>" + // Changed from image-container to stimuli-container
                    "<img class='stimuli-left-social' src='" +
                    jsPsych.timelineVariable("stimulus", true) +
                    "'>" +
                    "<img class='stimuli-right-social' src='" +
                    stimulus2 +
                    "'>" +
                    "</div>";
            } else if (stimulus2 === null && version === "social_kamin") {
                html =
                    "<img class='stimuli-social' src='" +
                    jsPsych.timelineVariable("stimulus", true) +
                    "'>";
            }
        }
        return html;
    },

    // jsPsych.timelineVariable('stimulus'),
    choices: "NO_KEYS", // key_press handled instead by responseKey
    trial_duration: stimuliDuration,
    response_ends_trial: false,
    prompt:
        progressBar +
        fillUp +
        feedbackGenerator +
        timeRemaining +
        '<form autocomplete="off" action=""> <input autocomplete="false" name="hidden" id="tapTap" type="text" style="background-color:black; color: transparent; outline:none; border:none; background:none;" onkeypress="">',
    data: jsPsych.timelineVariable("data"),
    on_load: () => {
        buttonPress(48, 49); // Correctly pass the function to execute upon loading
    },
    extensions: [
        {
            type: jsPsychExtensionWebgazer,
            params: {
                targets: [],
            },
        },
    ],

    on_finish: (data) => {
        writeCandidateKeys(data);

        data.response = responseKey;
        data.version = version;
        data.task_version = version;

        if (responseKey == data.correct_response) {
            data.accuracy = 1;
            data.confidence = totalConfidence;
            responseKey = "";
        } else if (responseKey == data.incorrect_response) {
            data.accuracy = 0;
            data.confidence = totalConfidence;
            responseKey = "";
        } else {
            data.accuracy = "";
            data.confidence = "";
            responseKey = "";
        }
        if (data.webgazer_data) {
            runtimeDebugLog(
                `Trial collected ${data.webgazer_data.length} gaze samples`,
            );
        }
        data.index = trialIterator;
        trialIterator++;
    },
};

// create feedback trials
const feedback = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
        let last_trial_feedback = jsPsych.data
            .get()
            .last(1)
            .values()[0].correct_response;
        if (last_trial_feedback == 49) {
            return positiveFeedback;
        }
        if (last_trial_feedback == 48) {
            return negativeFeedback;
        }
    },
    choices: "NO_KEYS",
    extensions: [
        {
            type: jsPsychExtensionWebgazer,
            params: {
                targets: [],
            },
        },
    ],
    trial_duration: feedbackDuration,
    response_ends_trial: false,
    on_start: () => {
        // Clear the keyboard buffer to prevent any previous responses from affecting this trial
        jsPsych.pluginAPI.clearAllTimeouts(); // Clear any timeouts set by previous trials
    },

    on_finish: (data) => {
        if (data.webgazer_data) {
            runtimeDebugLog(
                `Trial collected ${data.webgazer_data.length} gaze samples`,
            );
        }
    },
};

const instruction6 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[6],
    choices: [" "], //ascii spacebar
};

//COMPLETION MESSAGE: Completed Classification Phase

const screenRating1 = {
    type: jsPsychSurveyMultiChoice,
    questions: [
        {
            prompt: instructions[7],
            name: "rating_random",
            options: [
                "Definitely Not",
                "Probably Not",
                "Unsure",
                "Probably Yes",
                "Definitely Yes",
            ],
            required: true,
            horizontal: true,
        },
    ],
    choices: "NO_KEYS",
    on_start: function () {
        document.getElementById("unload").onbeforeunload = "";
        $(document).ready(function () {
            $("body").addClass("showCursor"); // returns cursor functionality
        });
    },

    extensions: [
        {
            type: jsPsychExtensionWebgazer,
            params: {
                targets: [],
            },
        },
    ],
    on_finish: function (data) {
        writeCandidateKeys(data);

        data.response = responseKey;
        data.version = version;
        data.task_version = version;

        var ratingRandom = jsPsych.data.get().select("responses").values[0];

        // var currentData = jsPsych.currentTrial().data;
        runtimeDebugLog(ratingRandom);
        data.rating_random = ratingRandom;
        if (data.webgazer_data) {
            runtimeDebugLog(
                `Trial collected ${data.webgazer_data.length} gaze samples`,
            );
        }
    },
};
const screenRating2 = {
    type: jsPsychSurveyMultiChoice,
    questions: [
        {
            prompt: instructions[8],
            name: "rating_sabotage",
            options: [
                "Definitely Not",
                "Probably Not",
                "Unsure",
                "Probably Yes",
                "Definitely Yes",
            ],
            required: true,
            horizontal: true,
        },
    ],
    choices: "NO_KEYS",
    extensions: [
        {
            type: jsPsychExtensionWebgazer,
            params: {
                targets: [],
            },
        },
    ],
    on_finish: function (data) {
        writeCandidateKeys(data);
        data.response = responseKey;
        data.version = version;
        data.task_version = version;
        var ratingSabotage = jsPsych.data.get().select("responses").values[0];
        data.rating_sabotage = ratingSabotage;
        // var currentData = jsPsych.currentTrial().data;
        runtimeDebugLog(ratingSabotage);
        if (data.webgazer_data) {
            runtimeDebugLog(
                `Trial collected ${data.webgazer_data.length} gaze samples`,
            );
        }
    },

    // trial_duration: 60000,
};

const dataSave = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: dataSaveAnimation,
    choices: "NO_KEYS",
    trial_duration: 5000,
    on_finish: (data) => {
        const validationResultsRows = jsPsych.data
            .get()
            .filter({ task: "validation_result" })
            .values();
        const latestValidationResult =
            validationResultsRows.length > 0
                ? validationResultsRows[validationResultsRows.length - 1]
                : null;
        const chinrestState =
            chinrestController && chinrestController.getState
                ? chinrestController.getState()
                : chinrestStateFallback;
        const driftChecks =
            cameraGateCore && cameraGateCore.createEmptyDriftChecks
                ? cameraGateCore.createEmptyDriftChecks()
                : { total: 0, failures: 0, recalibrations: 0, skipped: true };
        const calibrationReport = {
            attempts_total: validationResultsRows.length,
            attempts: validationResultsRows.map((row) => ({
                calib_attempt: row.calib_attempt,
                calib_reps_per_point: row.calib_reps_per_point,
                calib_passed: row.calib_passed,
                calib_strong_pass: row.calib_strong_pass,
                calib_terminal_fail: row.calib_terminal_fail,
                avg_offset_px: row.avg_offset_px,
                mean_in_roi: row.mean_in_roi,
                roi_radius_px: row.roi_radius_px,
                validation_point_count: row.validation_point_count,
                validation_points_included: row.validation_points_included,
                validation_points_total: row.validation_points_total,
                validation_points_dropped: row.validation_points_dropped,
                validation_min_samples_per_point: row.validation_min_samples_per_point,
                percent_in_roi_used: row.percent_in_roi_used,
                camera_fps: row.camera_fps,
                samples_per_sec: row.samples_per_sec,
            })),
            final: {
                calib_passed: latestValidationResult
                    ? latestValidationResult.calib_passed === true
                    : false,
                calib_strong_pass: latestValidationResult
                    ? latestValidationResult.calib_strong_pass === true
                    : false,
                calib_terminal_fail: latestValidationResult
                    ? latestValidationResult.calib_terminal_fail === true
                    : calibrationTerminalFail,
                avg_offset_px: latestValidationResult
                    ? latestValidationResult.avg_offset_px
                    : null,
                mean_in_roi: latestValidationResult
                    ? latestValidationResult.mean_in_roi
                    : null,
            },
            drift_checks_total: driftChecks.total,
            drift_failures_total: driftChecks.failures,
            drift_recalibrations_total: driftChecks.recalibrations,
            drift_checks_skipped: driftChecks.skipped,
            camera_gate_failed: cameraGateFailed,
            camera_gate_timeout: cameraGateTimedOut,
            camera_gate_policy: cameraGatePolicy,
            camera_gate_failure_reason: cameraGateFailureReason,
            regression_module:
                runtimeConf &&
                runtimeConf.webgazer &&
                runtimeConf.webgazer.regression_module
                    ? runtimeConf.webgazer.regression_module
                    : null,
            chinrest_used: !!chinrestState.chinrestUsed,
            chinrest_passed: !!chinrestState.chinrestPassed,
            chinrest_failure_reason: chinrestState.chinrestFailureReason,
            chinrest_metrics: chinrestState.chinrestMetrics,
            device_metrics: getDisplayMetrics(),
        };
        jsPsych.data.addProperties({
            webgazer_enabled: eyeTrackingEnabled,
            calib_passed: calibrationReport.final.calib_passed,
            calib_attempts: calibrationReport.attempts_total,
            camera_gate_failed: cameraGateFailed,
            camera_gate_timeout: cameraGateTimedOut,
            camera_gate_policy: cameraGatePolicy,
            regression_module: calibrationReport.regression_module,
            drift_checks: driftChecks,
            calibration_report: calibrationReport,
        });
        data.calibration_report = calibrationReport;
        if (chinrestController && chinrestController.getSummary) {
            const chinrestSummary = chinrestController.getSummary();
            jsPsych.data.addProperties(chinrestSummary);
            data.chinrest_summary = chinrestSummary;
        }

        if (jsPsych.extensions.webgazer.stopMouseCalibration) {
            jsPsych.extensions.webgazer.stopMouseCalibration();
        }
        if (typeof debug !== "undefined" && debug) {
            console.log("Continuous mouse calibration stopped");
        }
        writeCsvRedirect();
        experimentComplete = true;
        webgazer.showVideo(false);
        webgazer.showFaceOverlay(false);
        webgazer.showFaceFeedbackBox(false);
        if (typeof debug !== "undefined" && debug) {
            console.log("Experiment complete, data saved");
        }
    },
};

// Defince procedures

let practice_procedure = {
    timeline: [fixation, stimuli, feedback],
    timeline_variables: practice_stimuli,
    randomize_order: false,
};

// Define common procedure settings struct
const commonSettings = (stimuliType) => ({
    timeline: [fixation, stimuli, feedback],
    timeline_variables: stimuliType,
    randomize_order: true,
    type: "fixed-repetitions",
});

// Initialize procedures
let learning_procedure, blocking_procedure, testing_procedure;

switch (version) {
    case "kamin":
        learning_procedure = {
            ...commonSettings(learning_stimuli_standard),
            repetitions: getRepetitions().learning,
        };
        blocking_procedure = {
            ...commonSettings(blocking_stimuli_standard),
            repetitions: getRepetitions().blocking,
        };
        testing_procedure = {
            ...commonSettings(testing_stimuli_standard),
            repetitions: getRepetitions().testing,
        };
        break;
    case "social_kamin":
    case "kamin_gain":
    case "kamin_loss":
        learning_procedure = {
            ...commonSettings(learning_stimuli_short),
            repetitions: getRepetitions().learning,
        };
        blocking_procedure = {
            ...commonSettings(blocking_stimuli_short),
            repetitions: getRepetitions().blocking,
        };
        testing_procedure = {
            ...commonSettings(testing_stimuli_short),
            repetitions: getRepetitions().testing,
        };
        break;
}

// call main
$.getScript("exp/main.js").fail(function (jqxhr, settings, exception) {
    const status = jqxhr && jqxhr.status;
    console.error("Failed to load script: exp/main.js", {
        status: status,
        exception: exception,
        settings: settings,
    });
    if (window.kbShowFatalLoadError) {
        window.kbShowFatalLoadError("exp/main.js", {
            status: status,
            exception: exception,
        });
    }
});
