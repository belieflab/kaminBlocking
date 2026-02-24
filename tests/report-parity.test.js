"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const webgazerTimelineSource = fs.readFileSync(
    path.join(__dirname, "..", "exp", "timeline-webgazer.js"),
    "utf8",
);
const noWebgazerTimelineSource = fs.readFileSync(
    path.join(__dirname, "..", "exp", "timeline-no-webgazer.js"),
    "utf8",
);

function extractDataSaveObject(source) {
    const match = source.match(/const dataSave = \{[\s\S]*?\n\};\n\n\/\/ Defince procedures/);
    if (!match) {
        throw new Error("Could not extract dataSave object");
    }
    return (
        match[0].replace(/\n\/\/ Defince procedures[\s\S]*$/, "\n") +
        "\nglobalThis.__dataSave = dataSave;\n"
    );
}

function testITREPORT01_CalibrationReportKeysAndSingleWrite() {
    const requiredKeys = [
        "attempts_total",
        "attempts",
        "final",
        "drift_checks_total",
        "drift_failures_total",
        "drift_recalibrations_total",
        "drift_checks_skipped",
        "camera_gate_failed",
        "camera_gate_timeout",
        "camera_gate_policy",
        "camera_gate_failure_reason",
        "regression_module",
        "chinrest_used",
        "chinrest_passed",
        "chinrest_failure_reason",
        "chinrest_metrics",
        "device_metrics",
    ];
    requiredKeys.forEach((key) => {
        assert.ok(webgazerTimelineSource.includes(`${key}:`), `Missing calibration_report key: ${key}`);
    });

    const addPropertiesCalls = [];
    const context = {
        jsPsychHtmlKeyboardResponse: function JsPsychHtmlKeyboardResponse() {},
        dataSaveAnimation: "saving...",
        calibrationTerminalFail: false,
        chinrestStateFallback: {
            chinrestUsed: false,
            chinrestPassed: false,
            chinrestFailureReason: null,
            chinrestMetrics: null,
        },
        chinrestController: null,
        cameraGateCore: {
            createEmptyDriftChecks: () => ({ total: 0, failures: 0, recalibrations: 0, skipped: true }),
        },
        cameraGateFailed: false,
        cameraGateTimedOut: false,
        cameraGatePolicy: "fail_open_but_exclude",
        cameraGateFailureReason: null,
        runtimeConf: {
            webgazer: {
                regression_module: "ridge",
            },
        },
        eyeTrackingEnabled: true,
        getDisplayMetrics: () => ({
            screen_w: 1920,
            screen_h: 1080,
            window_w: 1280,
            window_h: 720,
            devicePixelRatio: 1,
        }),
        jsPsych: {
            data: {
                get: () => ({
                    filter: () => ({
                        values: () => [
                            {
                                calib_attempt: 0,
                                calib_reps_per_point: 2,
                                calib_passed: true,
                                calib_strong_pass: true,
                                calib_terminal_fail: false,
                                avg_offset_px: 120,
                                mean_in_roi: 82,
                                roi_radius_px: 200,
                                validation_point_count: 9,
                                validation_points_included: 9,
                                validation_points_total: 9,
                                validation_points_dropped: 0,
                                validation_min_samples_per_point: 20,
                                percent_in_roi_used: [80, 82, 83],
                                camera_fps: 30,
                                samples_per_sec: 28,
                            },
                        ],
                    }),
                }),
                addProperties: (props) => {
                    addPropertiesCalls.push(props);
                },
            },
            extensions: {
                webgazer: {
                    stopMouseCalibration: () => {},
                },
            },
        },
        webgazer: {
            showVideo: () => {},
            showFaceOverlay: () => {},
            showFaceFeedbackBox: () => {},
        },
        writeCsvRedirect: () => {},
        experimentComplete: false,
    };

    const snippet = extractDataSaveObject(webgazerTimelineSource);
    vm.runInNewContext(snippet, context, { filename: "exp/timeline-webgazer.js" });
    const trialData = {};
    context.__dataSave.on_finish(trialData);

    assert.ok(trialData.calibration_report);
    requiredKeys.forEach((key) => {
        assert.ok(
            Object.prototype.hasOwnProperty.call(trialData.calibration_report, key),
            `Missing report key on trial row: ${key}`,
        );
    });
    const calibrationReportWrites = addPropertiesCalls.filter((entry) =>
        Object.prototype.hasOwnProperty.call(entry, "calibration_report"),
    );
    assert.strictEqual(calibrationReportWrites.length, 1);
    assert.strictEqual(calibrationReportWrites[0].calibration_report, trialData.calibration_report);
}

function testITREPORT02_ETOffDataSaveWritesDefaultsWithoutThrowing() {
    const context = {
        jsPsychHtmlKeyboardResponse: function JsPsychHtmlKeyboardResponse() {},
        dataSaveAnimation: "saving...",
        window: {
            screen: { width: 1920, height: 1080 },
            innerWidth: 1280,
            innerHeight: 720,
            devicePixelRatio: 1,
        },
        jsPsych: {
            data: {
                addProperties: (props) => {
                    context.__globals = props;
                },
            },
        },
        writeCsvRedirect: () => {
            context.__redirected = true;
        },
        __globals: null,
        __redirected: false,
    };

    const snippet = extractDataSaveObject(noWebgazerTimelineSource);
    vm.runInNewContext(snippet, context, { filename: "exp/timeline-no-webgazer.js" });
    const trialData = {};
    context.__dataSave.on_finish(trialData);

    assert.ok(context.__globals);
    assert.ok(context.__globals.calibration_report);
    assert.strictEqual(context.__globals.chinrest_used, false);
    assert.strictEqual(context.__globals.chinrest_passed, false);
    assert.strictEqual(context.__globals.chinrest_failure_reason, null);
    assert.strictEqual(trialData.chinrest_summary.chinrest_used, false);
    assert.ok(trialData.calibration_report);
    assert.strictEqual(context.__redirected, true);
}

testITREPORT01_CalibrationReportKeysAndSingleWrite();
testITREPORT02_ETOffDataSaveWritesDefaultsWithoutThrowing();

console.log("IT-REPORT-01..02 passed");
