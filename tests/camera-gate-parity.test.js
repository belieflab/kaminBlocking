"use strict";

const assert = require("assert");
const {
    applyCameraGateFailure,
    normalizePolicy,
    shouldRunCalibrationAttemptLoop,
} = require("../exp/camera-gate-core.js");
const { createChinrestFlowController } = require("../exp/chinrest-core.js");

function testATCG01_CameraGatePass_ProceedsToCalibration() {
    const state = {
        cameraGateFailed: false,
        cameraGateTimedOut: false,
        cameraGateHardFail: false,
    };
    assert.strictEqual(normalizePolicy("fail_open_but_exclude"), "fail_open_but_exclude");
    assert.strictEqual(normalizePolicy("fail_open"), "fail_open_but_exclude");
    assert.strictEqual(shouldRunCalibrationAttemptLoop(state.cameraGateTimedOut), true);
}

function testATCG02_TimeoutFailClosed_HardFailBlocksMainTask() {
    const next = applyCameraGateFailure({}, "fail_closed");
    assert.strictEqual(next.cameraGateTimedOut, true);
    assert.strictEqual(next.cameraGateFailed, true);
    assert.strictEqual(next.cameraGateHardFail, true);
    assert.strictEqual(next.exclusionRecommended, true);
    assert.strictEqual(next.exclusionReason, "camera_gate_failed");
    assert.strictEqual(shouldRunCalibrationAttemptLoop(next.cameraGateTimedOut), false);

    const flow = createChinrestFlowController(
        () => ({ chinrestFailed: false }),
        { isHardCameraGateFailed: () => next.cameraGateHardFail },
    );
    assert.strictEqual(flow.shouldRunMainTask(), false);
}

function testATCG03_TimeoutFailOpen_ProceedsFlaggedNoHardStop() {
    const next = applyCameraGateFailure({}, "fail_open_but_exclude");
    assert.strictEqual(next.cameraGateTimedOut, true);
    assert.strictEqual(next.cameraGateFailed, true);
    assert.strictEqual(next.cameraGateHardFail, false);
    assert.strictEqual(next.exclusionRecommended, true);
    assert.strictEqual(next.exclusionReason, "camera_gate_failed");
    assert.strictEqual(shouldRunCalibrationAttemptLoop(next.cameraGateTimedOut), false);

    const flow = createChinrestFlowController(
        () => ({ chinrestFailed: false }),
        { isHardCameraGateFailed: () => next.cameraGateHardFail },
    );
    assert.strictEqual(flow.shouldRunMainTask(), true);
}

testATCG01_CameraGatePass_ProceedsToCalibration();
testATCG02_TimeoutFailClosed_HardFailBlocksMainTask();
testATCG03_TimeoutFailOpen_ProceedsFlaggedNoHardStop();

console.log("AT-CG-01..03 passed");
