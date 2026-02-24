"use strict";

(function (root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
        return;
    }
    root.KaminChinrestCore = factory();
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
    const FAILURE_REASONS = {
        pluginMissing: "chinrest_plugin_missing",
        scaleGuardMissingMetrics: "chinrest_scale_guard_missing_metrics",
        aborted: "chinrest_aborted",
        failed: "chinrest_failed",
    };

    function isFiniteNumber(value) {
        return Number.isFinite(Number(value));
    }

    function normalizeMetrics(raw) {
        if (!raw || typeof raw !== "object") {
            return null;
        }
        const normalized = {
            px2mm: Number(raw.px2mm),
            view_dist_mm: Number(raw.view_dist_mm),
            px2deg: Number(raw.px2deg),
            win_width_deg: Number(raw.win_width_deg),
        };
        if (
            !isFiniteNumber(normalized.px2mm) ||
            !isFiniteNumber(normalized.view_dist_mm) ||
            !isFiniteNumber(normalized.px2deg) ||
            !isFiniteNumber(normalized.win_width_deg)
        ) {
            return null;
        }
        return normalized;
    }

    function resolveEnablement(runtimeConf) {
        const conf = runtimeConf || {};
        const eyeTrackingEnabled = !!(
            conf.webgazer &&
            conf.webgazer.enable
        );
        if (!conf.virtualChinrest) {
            conf.virtualChinrest = {};
        }
        if (!eyeTrackingEnabled) {
            conf.virtualChinrest.enabled = false;
        }
        return {
            eyeTrackingEnabled: eyeTrackingEnabled,
            chinrestEnabled: !!conf.virtualChinrest.enabled,
        };
    }

    function createChinrestFlowController(getState, opts) {
        const options = opts || {};
        return {
            shouldRunChinrestStage: function () {
                const state = getState();
                return !!state.chinrestEnabled && !state.chinrestFailed && !state.chinrestPassed;
            },
            shouldRunCalibration: function () {
                const state = getState();
                return !state.chinrestFailed;
            },
            shouldRunMainTask: function () {
                const state = getState();
                const hardCameraFail = typeof options.isHardCameraGateFailed === "function"
                    ? !!options.isHardCameraGateFailed()
                    : false;
                return !state.chinrestFailed && !hardCameraFail;
            },
            shouldRunFailureExit: function () {
                const state = getState();
                return !!state.chinrestFailed;
            },
        };
    }

    function createChinrestController(deps) {
        const dataPort = deps.dataPort;
        const pluginPort = deps.pluginPort;
        const scaleGuardPort = deps.scaleGuardPort;
        const terminationPort = deps.terminationPort;
        const taskIdentifier = deps.taskIdentifier || "chinrest_failure_exit";
        const chinrestConfig = Object.assign({}, deps.chinrestConfig || {});

        const state = {
            chinrestEnabled: !!chinrestConfig.enabled,
            chinrestUsed: false,
            chinrestPassed: false,
            chinrestFailed: false,
            chinrestFailureReason: null,
            chinrestMetrics: null,
        };

        function getSummary() {
            return {
                chinrest_used: !!state.chinrestUsed,
                chinrest_passed: !!state.chinrestPassed,
                chinrest_failure_reason: state.chinrestFailureReason,
                chinrest_metrics: state.chinrestMetrics,
            };
        }

        function writeFailure(reason) {
            const failureReason = reason || FAILURE_REASONS.failed;
            state.chinrestUsed = true;
            state.chinrestPassed = false;
            state.chinrestFailed = true;
            state.chinrestFailureReason = failureReason;
            state.chinrestMetrics = null;
            dataPort.addGlobal({
                chinrest_passed: false,
                exclusion_recommended: true,
                exclusion_reason: FAILURE_REASONS.failed,
                chinrest_failure_reason: failureReason,
            });
        }

        function writePass(metrics) {
            state.chinrestUsed = true;
            state.chinrestPassed = true;
            state.chinrestFailed = false;
            state.chinrestFailureReason = null;
            state.chinrestMetrics = metrics;

            const configProps = {
                chinrest_blindspot_reps: chinrestConfig.blindspot_reps,
                chinrest_resize_units: chinrestConfig.resize_units,
                chinrest_pixels_per_unit: chinrestConfig.pixels_per_unit,
            };

            dataPort.addGlobal(
                Object.assign({}, metrics, {
                    chinrest_passed: true,
                }, configProps),
            );
        }

        return {
            getState: function () {
                return Object.assign({}, state);
            },
            getSummary: getSummary,
            getFailureReason: function () {
                return state.chinrestFailureReason;
            },
            getConfig: function () {
                return Object.assign({}, chinrestConfig);
            },
            isFailed: function () {
                return !!state.chinrestFailed;
            },
            runPreflight: function () {
                if (!state.chinrestEnabled) {
                    state.chinrestUsed = false;
                    dataPort.writeFinalSummary(getSummary());
                    return { status: "skipped" };
                }

                if (!pluginPort.isAvailable()) {
                    writeFailure(FAILURE_REASONS.pluginMissing);
                    dataPort.writeFinalSummary(getSummary());
                    return { status: "failed" };
                }

                if (scaleGuardPort.getGuard()) {
                    const cached = normalizeMetrics(scaleGuardPort.getCachedMetrics());
                    if (cached) {
                        writePass(cached);
                        dataPort.writeFinalSummary(getSummary());
                        return { status: "passed_cached", metrics: cached };
                    }
                    writeFailure(FAILURE_REASONS.scaleGuardMissingMetrics);
                    dataPort.writeFinalSummary(getSummary());
                    return { status: "failed" };
                }

                return { status: "run_required" };
            },
            handleRunResult: function (result) {
                if (
                    result &&
                    (result.aborted === true ||
                        result.chinrest_aborted === true ||
                        result.did_abort === true ||
                        result.was_aborted === true)
                ) {
                    writeFailure(FAILURE_REASONS.aborted);
                    dataPort.writeFinalSummary(getSummary());
                    return { status: "failed" };
                }

                const metrics = normalizeMetrics(result || {});
                if (!metrics) {
                    writeFailure(FAILURE_REASONS.failed);
                    dataPort.writeFinalSummary(getSummary());
                    return { status: "failed" };
                }

                writePass(metrics);
                if (chinrestConfig.resize_units === "deg") {
                    scaleGuardPort.setGuard(true);
                    scaleGuardPort.setCachedMetrics(metrics);
                }
                dataPort.writeFinalSummary(getSummary());
                return { status: "passed", metrics: metrics };
            },
            runPlugin: function () {
                return pluginPort.run(chinrestConfig);
            },
            runPluginSafely: function () {
                try {
                    return {
                        status: "plugin_ready",
                        trial: pluginPort.run(chinrestConfig),
                    };
                } catch (_error) {
                    writeFailure(FAILURE_REASONS.failed);
                    dataPort.writeFinalSummary(getSummary());
                    return { status: "failed" };
                }
            },
            persistFailureAndExit: function () {
                const reason = state.chinrestFailureReason || FAILURE_REASONS.failed;
                terminationPort.persistAndExit(reason, {
                    task: taskIdentifier,
                    chinrest_failure_reason: reason,
                });
            },
        };
    }

    return {
        FAILURE_REASONS: FAILURE_REASONS,
        normalizeMetrics: normalizeMetrics,
        resolveEnablement: resolveEnablement,
        createChinrestFlowController: createChinrestFlowController,
        createChinrestController: createChinrestController,
    };
});
