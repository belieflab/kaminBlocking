"use strict";

const assert = require("assert");
const {
    FAILURE_REASONS,
    resolveEnablement,
    createChinrestController,
    createChinrestFlowController,
} = require("../exp/chinrest-core.js");

function createHarness(overrides) {
    const addedGlobals = [];
    const summaries = [];
    const terminationCalls = [];
    const guardState = {
        guard: false,
        cached: null,
    };
    const base = {
        chinrestConfig: {
            enabled: true,
            blindspot_reps: 3,
            resize_units: "deg",
            pixels_per_unit: 50,
            item_path: "img/card.png",
        },
        pluginPort: {
            isAvailable: () => true,
            run: (config) => config,
        },
        dataPort: {
            addGlobal: (props) => addedGlobals.push(props),
            annotateTrial: () => {},
            writeFinalSummary: (props) => summaries.push(props),
        },
        scaleGuardPort: {
            getGuard: () => guardState.guard,
            setGuard: (value) => {
                guardState.guard = !!value;
            },
            getCachedMetrics: () => guardState.cached,
            setCachedMetrics: (value) => {
                guardState.cached = value;
            },
        },
        terminationPort: {
            persistAndExit: (reason, payload) => {
                terminationCalls.push({ reason, payload });
            },
        },
    };

    const deps = Object.assign({}, base, overrides || {});
    const controller = createChinrestController(deps);
    const flow = createChinrestFlowController(() => controller.getState());
    return {
        controller,
        flow,
        addedGlobals,
        summaries,
        terminationCalls,
        guardState,
    };
}

function testATCR01_ETOffSkipsChinrest() {
    const runtimeConf = {
        webgazer: { enable: false },
        virtualChinrest: { enabled: true },
    };
    const resolved = resolveEnablement(runtimeConf);
    assert.strictEqual(resolved.eyeTrackingEnabled, false);
    assert.strictEqual(resolved.chinrestEnabled, false);
    assert.strictEqual(runtimeConf.virtualChinrest.enabled, false);

    const h = createHarness({
        chinrestConfig: {
            enabled: false,
            blindspot_reps: 3,
            resize_units: "deg",
            pixels_per_unit: 50,
        },
    });
    const preflight = h.controller.runPreflight();
    assert.strictEqual(preflight.status, "skipped");
    assert.strictEqual(h.flow.shouldRunCalibration(), true);
    assert.strictEqual(h.flow.shouldRunMainTask(), true);
}

function testATCR02_PluginMissingFailsAndBlocks() {
    const h = createHarness({
        pluginPort: {
            isAvailable: () => false,
            run: () => null,
        },
    });
    const preflight = h.controller.runPreflight();
    assert.strictEqual(preflight.status, "failed");
    assert.strictEqual(h.controller.getFailureReason(), FAILURE_REASONS.pluginMissing);
    assert.strictEqual(h.flow.shouldRunCalibration(), false);
    assert.strictEqual(h.flow.shouldRunMainTask(), false);
    const failureGlobal = h.addedGlobals[h.addedGlobals.length - 1];
    assert.strictEqual(failureGlobal.chinrest_passed, false);
    assert.strictEqual(failureGlobal.exclusion_recommended, true);
    assert.strictEqual(failureGlobal.exclusion_reason, "chinrest_failed");
    assert.strictEqual(
        failureGlobal.chinrest_failure_reason,
        FAILURE_REASONS.pluginMissing,
    );
    h.controller.persistFailureAndExit();
    assert.strictEqual(h.terminationCalls.length, 1);
    assert.strictEqual(h.terminationCalls[0].payload.task, "chinrest_failure_exit");
}

function testATCR03_ValidMetricsPassAndPersist() {
    const h = createHarness();
    const preflight = h.controller.runPreflight();
    assert.strictEqual(preflight.status, "run_required");
    const runResult = h.controller.handleRunResult({
        px2mm: 0.25,
        view_dist_mm: 550,
        px2deg: 40,
        win_width_deg: 22,
    });
    assert.strictEqual(runResult.status, "passed");
    const successGlobal = h.addedGlobals[h.addedGlobals.length - 1];
    assert.strictEqual(successGlobal.chinrest_passed, true);
    assert.ok(Number.isFinite(successGlobal.px2mm));
    assert.ok(Number.isFinite(successGlobal.view_dist_mm));
    assert.ok(Number.isFinite(successGlobal.px2deg));
    assert.ok(Number.isFinite(successGlobal.win_width_deg));
    const summary = h.controller.getSummary();
    assert.strictEqual(summary.chinrest_used, true);
    assert.strictEqual(summary.chinrest_passed, true);
    assert.ok(summary.chinrest_metrics);
}

function testATCR04_AbortFailsAndBlocks() {
    const h = createHarness();
    const preflight = h.controller.runPreflight();
    assert.strictEqual(preflight.status, "run_required");
    const runResult = h.controller.handleRunResult({
        aborted: true,
        px2mm: 0.2,
        view_dist_mm: 500,
        px2deg: 30,
        win_width_deg: 20,
    });
    assert.strictEqual(runResult.status, "failed");
    assert.strictEqual(h.controller.getFailureReason(), FAILURE_REASONS.aborted);
    assert.strictEqual(h.flow.shouldRunCalibration(), false);
    assert.strictEqual(h.flow.shouldRunMainTask(), false);
}

function testATCR05_GuardWithoutCacheFailsClosed() {
    const h = createHarness();
    h.guardState.guard = true;
    h.guardState.cached = null;
    const preflight = h.controller.runPreflight();
    assert.strictEqual(preflight.status, "failed");
    assert.strictEqual(
        h.controller.getFailureReason(),
        FAILURE_REASONS.scaleGuardMissingMetrics,
    );
}

testATCR01_ETOffSkipsChinrest();
testATCR02_PluginMissingFailsAndBlocks();
testATCR03_ValidMetricsPassAndPersist();
testATCR04_AbortFailsAndBlocks();
testATCR05_GuardWithoutCacheFailsClosed();

console.log("AT-CR-01..05 passed");
