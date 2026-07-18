"use strict";

// Preload images
timeline.push(preload);
timeline.push(welcome); // welcome page

const mainChinrestFlowController =
    typeof window !== "undefined" && window.kbChinrestFlowController
        ? window.kbChinrestFlowController
        : null;
const mainCameraGateState =
    typeof window !== "undefined" && window.kbCameraGateState
        ? window.kbCameraGateState
        : null;

function shouldRunCalibrationAfterChinrest() {
    const hardCameraFail =
        !!(
            mainCameraGateState &&
            mainCameraGateState.isHardFail &&
            mainCameraGateState.isHardFail()
        );
    if (hardCameraFail) {
        return false;
    }
    if (
        !mainChinrestFlowController ||
        !mainChinrestFlowController.shouldRunCalibration
    ) {
        return true;
    }
    return mainChinrestFlowController.shouldRunCalibration();
}

function shouldRunMainTaskAfterChinrest() {
    if (!mainChinrestFlowController || !mainChinrestFlowController.shouldRunMainTask) {
        return true;
    }
    return mainChinrestFlowController.shouldRunMainTask();
}

// here adding the WebGazer initiation and calibration process
if (eyeTrackingEnabled) {
    // SPEC: init-camera must run before calibrate/validate trials when auto_initialize=false.
    // REPO: cameraInit then calibrationProcedure ensures extension readiness.
    // LINK: https://www.jspsych.org/v7/overview/eye-tracking/
    // Source (Spec): https://www.jspsych.org/v7/overview/eye-tracking/
    // Source (Paper): Papoutsaki et al. 2016 (WebGazer) https://cs.brown.edu/people/apapouts/papers/ijcai2016webgazer.pdf
    // Source (Paper): Steffan et al. 2024 (jsPsych + WebGazer validation) https://pmc.ncbi.nlm.nih.gov/articles/PMC10841511/
    timeline.push(cameraInit);
    if (typeof virtualChinrestProcedure !== "undefined") {
        timeline.push(virtualChinrestProcedure);
    }
    if (typeof chinrestFailureExit !== "undefined") {
        timeline.push(chinrestFailureExit);
    }
    timeline.push({
        timeline: [calibrationProcedure],
        conditional_function: shouldRunCalibrationAfterChinrest,
    });
    if (typeof cameraGateFailureExit !== "undefined") {
        timeline.push(cameraGateFailureExit);
    }
    if (typeof readyToStart !== "undefined") {
        timeline.push(readyToStart);
    }
}

const mainTaskTimeline = [...instructionSet, practice_procedure, instruction6];

// Interleave 3 silent gaze-fixation break probes at even quarters of the main
// task (mid-learning, learning/blocking seam, blocking/testing seam). Guarded
// because exp/timeline-no-webgazer.js also loads this file and does not
// define the split learning procedure or the probe trials.
if (
    typeof learning_procedure_part1 !== "undefined" &&
    typeof learning_procedure_part2 !== "undefined" &&
    typeof gazeFixationProbe1 !== "undefined" &&
    typeof gazeFixationProbe2 !== "undefined" &&
    typeof gazeFixationProbe3 !== "undefined"
) {
    mainTaskTimeline.push(
        learning_procedure_part1,
        gazeFixationProbe1,
        learning_procedure_part2,
        gazeFixationProbe2,
        blocking_procedure,
        gazeFixationProbe3,
        testing_procedure,
    );
} else {
    mainTaskTimeline.push(learning_procedure, blocking_procedure, testing_procedure);
}

if (ratingQuestions) {
    mainTaskTimeline.push(screenRating1, screenRating2);
}
mainTaskTimeline.push(dataSave);

timeline.push({
    timeline: mainTaskTimeline,
    conditional_function: shouldRunMainTaskAfterChinrest,
});

// don't allow experiment to start unless subjectId is set
if (subjectId) {
    // New jsPsych 7.x syntax
    jsPsych.run(timeline);
}
