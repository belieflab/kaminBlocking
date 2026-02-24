"use strict";

(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
        return;
    }
    root.KaminCameraGateCore = factory();
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
    function normalizePolicy(policy) {
        const value = String(policy || "").toLowerCase();
        if (value === "fail_closed") {
            return "fail_closed";
        }
        if (value === "fail_open") {
            return "fail_open_but_exclude";
        }
        return "fail_open_but_exclude";
    }

    function applyCameraGateFailure(state, policy) {
        const resolvedPolicy = normalizePolicy(policy);
        const next = Object.assign({}, state || {});
        next.cameraGateFailed = true;
        next.cameraGateTimedOut = true;
        next.cameraGatePolicy = resolvedPolicy;
        next.cameraGateFailureReason = "camera_quality_timeout";
        next.cameraGateHardFail = resolvedPolicy === "fail_closed";
        next.exclusionRecommended = true;
        next.exclusionReason = "camera_gate_failed";
        return next;
    }

    function shouldRunCalibrationAttemptLoop(cameraGateTimedOut) {
        return cameraGateTimedOut !== true;
    }

    function createEmptyDriftChecks() {
        return {
            total: 0,
            failures: 0,
            recalibrations: 0,
            skipped: true,
        };
    }

    return {
        normalizePolicy: normalizePolicy,
        applyCameraGateFailure: applyCameraGateFailure,
        shouldRunCalibrationAttemptLoop: shouldRunCalibrationAttemptLoop,
        createEmptyDriftChecks: createEmptyDriftChecks,
    };
});
