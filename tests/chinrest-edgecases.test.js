"use strict";

/*
Edge-Case Matrix (Input -> Expected Outcome)
EC-01 Enablement precedence:
  ET off + config on (+ any toggle-like flags) -> chinrest disabled, forced off.
EC-02 Config off:
  ET on + config off -> preflight skipped; summary exists with chinrest_used:false, chinrest_passed:false, reason:null, metrics:null.
EC-03 Plugin missing:
  ET on + config on + plugin unavailable -> fail chinrest_plugin_missing; exclusion fields set; termination payload includes reason; calibration/task blocked.
EC-04 Plugin run throws:
  pluginPort.run throws -> fail chinrest_failed via runPluginSafely; fail-closed summary written.
EC-05 Aborted run:
  result.aborted (or alias) -> fail chinrest_aborted; downstream blocked.
EC-06 NaN metrics:
  any metric NaN -> fail chinrest_failed.
EC-07 Infinity metrics:
  any metric +/-Infinity -> fail chinrest_failed.
EC-08 Missing metric:
  any required metric missing -> fail chinrest_failed.
EC-09 Zero/negative metrics:
  CURRENT IMPLEMENTATION allows finite non-positive values (deterministic documented behavior).
EC-10 Guard semantics (deg mode):
  resize_units=deg + guard=true + valid cache -> pass_cached, reuse metrics, plugin not required.
EC-11 Guard present + cache missing:
  resize_units=deg + guard=true + invalid/missing cache -> fail chinrest_scale_guard_missing_metrics.
EC-12 Re-entrancy/idempotence:
  after pass sets guard/cache once; repeated preflight reuses cache without additional guard/cache writes.
EC-13 Failure reason persistence:
  each canonical reason appears in termination payload and final summary fields.
EC-14 Summary always defined:
  ET-off path (timeline-no-webgazer) and core skip/pass/fail all define chinrest summary keys.
EC-15 Dev-only toggle gating (if present):
  No dev toggle exists in implementation; resolver ignores extra toggle flags (production-safe deterministic behavior).
EC-16 Downstream gating completeness:
  chinrestFailed=true blocks calibration and main task; failure exit path is true.

Manual Test Script (for browser-only integration aspects)
M-01 Runtime plugin internal exception path:
  1. In browser devtools, monkeypatch plugin trial internals to throw during execution.
  2. Start ET-on session with chinrest enabled.
  3. Expected: session terminates through chinrest failure exit with:
     chinrest_passed:false, exclusion_recommended:true, exclusion_reason:"chinrest_failed",
     chinrest_failure_reason:"chinrest_failed", task:"chinrest_failure_exit".
M-02 Full ET-off branch in browser:
  1. Set runtimeConf.webgazer.enable=false and reload.
  2. Complete session.
  3. Expected final globals include:
     chinrest_used:false, chinrest_passed:false, chinrest_failure_reason:null, chinrest_metrics:null.
*/

const assert = require("assert");
const fs = require("fs");
const path = require("path");
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
        setGuardCalls: 0,
        setCachedCalls: 0,
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
            run: () => ({ type: "virtual_chinrest_trial" }),
        },
        dataPort: {
            addGlobal: (props) => addedGlobals.push(props),
            annotateTrial: () => {},
            writeFinalSummary: (props) => summaries.push(props),
        },
        scaleGuardPort: {
            getGuard: () => guardState.guard,
            setGuard: (value) => {
                guardState.setGuardCalls += 1;
                guardState.guard = !!value;
            },
            getCachedMetrics: () => guardState.cached,
            setCachedMetrics: (value) => {
                guardState.setCachedCalls += 1;
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
    return { controller, flow, addedGlobals, summaries, terminationCalls, guardState };
}

function assertSummaryShape(summary) {
    assert.ok(Object.prototype.hasOwnProperty.call(summary, "chinrest_used"));
    assert.ok(Object.prototype.hasOwnProperty.call(summary, "chinrest_passed"));
    assert.ok(Object.prototype.hasOwnProperty.call(summary, "chinrest_failure_reason"));
    assert.ok(Object.prototype.hasOwnProperty.call(summary, "chinrest_metrics"));
}

function testEC01_EnablementPrecedence_ETOffWins() {
    const conf = {
        webgazer: { enable: false },
        virtualChinrest: { enabled: true },
        chinrestToggle: "on",
        isDev: true,
    };
    const resolved = resolveEnablement(conf);
    assert.strictEqual(resolved.eyeTrackingEnabled, false);
    assert.strictEqual(resolved.chinrestEnabled, false);
    assert.strictEqual(conf.virtualChinrest.enabled, false);
}

function testEC02_ConfigOffSummaryDefined() {
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
    assert.strictEqual(h.summaries.length, 1);
    assertSummaryShape(h.summaries[0]);
    assert.strictEqual(h.summaries[0].chinrest_used, false);
    assert.strictEqual(h.summaries[0].chinrest_passed, false);
    assert.strictEqual(h.summaries[0].chinrest_failure_reason, null);
    assert.strictEqual(h.summaries[0].chinrest_metrics, null);
}

function testEC03_PluginMissingFailureFieldsAndGating() {
    const h = createHarness({
        pluginPort: {
            isAvailable: () => false,
            run: () => ({ type: "never" }),
        },
    });
    const preflight = h.controller.runPreflight();
    assert.strictEqual(preflight.status, "failed");
    assert.strictEqual(h.controller.getFailureReason(), FAILURE_REASONS.pluginMissing);
    const failureGlobal = h.addedGlobals[h.addedGlobals.length - 1];
    assert.strictEqual(failureGlobal.chinrest_passed, false);
    assert.strictEqual(failureGlobal.exclusion_recommended, true);
    assert.strictEqual(failureGlobal.exclusion_reason, "chinrest_failed");
    assert.strictEqual(failureGlobal.chinrest_failure_reason, FAILURE_REASONS.pluginMissing);
    assert.strictEqual(h.flow.shouldRunCalibration(), false);
    assert.strictEqual(h.flow.shouldRunMainTask(), false);
    assert.strictEqual(h.flow.shouldRunFailureExit(), true);
    h.controller.persistFailureAndExit();
    assert.strictEqual(h.terminationCalls.length, 1);
    assert.strictEqual(h.terminationCalls[0].payload.task, "chinrest_failure_exit");
    assert.strictEqual(
        h.terminationCalls[0].payload.chinrest_failure_reason,
        FAILURE_REASONS.pluginMissing,
    );
}

function testEC04_PluginRunThrowsHandledAsFailure() {
    const h = createHarness({
        pluginPort: {
            isAvailable: () => true,
            run: () => {
                throw new Error("boom");
            },
        },
    });
    const outcome = h.controller.runPluginSafely();
    assert.strictEqual(outcome.status, "failed");
    assert.strictEqual(h.controller.getFailureReason(), FAILURE_REASONS.failed);
    assert.strictEqual(h.flow.shouldRunCalibration(), false);
}

function testEC05_AbortedRun() {
    const h = createHarness();
    assert.strictEqual(h.controller.runPreflight().status, "run_required");
    const result = h.controller.handleRunResult({ aborted: true });
    assert.strictEqual(result.status, "failed");
    assert.strictEqual(h.controller.getFailureReason(), FAILURE_REASONS.aborted);
    assert.strictEqual(h.flow.shouldRunMainTask(), false);
}

function testEC06_NaNMetricFails() {
    const h = createHarness();
    h.controller.runPreflight();
    const result = h.controller.handleRunResult({
        px2mm: NaN,
        view_dist_mm: 600,
        px2deg: 40,
        win_width_deg: 25,
    });
    assert.strictEqual(result.status, "failed");
    assert.strictEqual(h.controller.getFailureReason(), FAILURE_REASONS.failed);
}

function testEC07_InfiniteMetricFails() {
    const h = createHarness();
    h.controller.runPreflight();
    const result = h.controller.handleRunResult({
        px2mm: Infinity,
        view_dist_mm: 600,
        px2deg: 40,
        win_width_deg: 25,
    });
    assert.strictEqual(result.status, "failed");
    assert.strictEqual(h.controller.getFailureReason(), FAILURE_REASONS.failed);
}

function testEC08_MissingMetricFails() {
    const h = createHarness();
    h.controller.runPreflight();
    const result = h.controller.handleRunResult({
        px2mm: 0.2,
        view_dist_mm: 600,
        win_width_deg: 25,
    });
    assert.strictEqual(result.status, "failed");
    assert.strictEqual(h.controller.getFailureReason(), FAILURE_REASONS.failed);
}

function testEC09_NonPositiveMetrics_CurrentBehaviorAllowed() {
    const h = createHarness();
    h.controller.runPreflight();
    const result = h.controller.handleRunResult({
        px2mm: -0.2,
        view_dist_mm: 0,
        px2deg: -10,
        win_width_deg: 0,
    });
    assert.strictEqual(result.status, "passed");
    assert.strictEqual(h.controller.getState().chinrestPassed, true);
}

function testEC10_GuardWithValidCacheReusesMetrics() {
    const h = createHarness();
    h.guardState.guard = true;
    h.guardState.cached = {
        px2mm: 0.3,
        view_dist_mm: 650,
        px2deg: 30,
        win_width_deg: 20,
    };
    const preflight = h.controller.runPreflight();
    assert.strictEqual(preflight.status, "passed_cached");
    assert.deepStrictEqual(preflight.metrics, h.guardState.cached);
    assert.strictEqual(h.controller.getState().chinrestPassed, true);
    assert.strictEqual(h.controller.getState().chinrestFailureReason, null);
}

function testEC11_GuardWithoutCacheFailsClosed() {
    const h = createHarness();
    h.guardState.guard = true;
    h.guardState.cached = { px2mm: 0.1 };
    const preflight = h.controller.runPreflight();
    assert.strictEqual(preflight.status, "failed");
    assert.strictEqual(
        h.controller.getFailureReason(),
        FAILURE_REASONS.scaleGuardMissingMetrics,
    );
    assert.strictEqual(h.flow.shouldRunFailureExit(), true);
}

function testEC12_ReentrancyIdempotenceOnGuardCache() {
    const h = createHarness();
    h.controller.runPreflight();
    h.controller.handleRunResult({
        px2mm: 0.25,
        view_dist_mm: 550,
        px2deg: 35,
        win_width_deg: 22,
    });
    assert.strictEqual(h.guardState.setGuardCalls, 1);
    assert.strictEqual(h.guardState.setCachedCalls, 1);
    const cached = Object.assign({}, h.guardState.cached);

    const preflightAgain = h.controller.runPreflight();
    assert.strictEqual(preflightAgain.status, "passed_cached");
    assert.strictEqual(h.guardState.setGuardCalls, 1);
    assert.strictEqual(h.guardState.setCachedCalls, 1);
    assert.deepStrictEqual(h.guardState.cached, cached);
}

function testEC13_FailureReasonPersistenceAllCanonicalReasons() {
    const cases = [
        {
            expected: FAILURE_REASONS.pluginMissing,
            build: () =>
                createHarness({
                    pluginPort: { isAvailable: () => false, run: () => ({}) },
                }),
            trigger: (h) => h.controller.runPreflight(),
        },
        {
            expected: FAILURE_REASONS.scaleGuardMissingMetrics,
            build: () => {
                const h = createHarness();
                h.guardState.guard = true;
                h.guardState.cached = null;
                return h;
            },
            trigger: (h) => h.controller.runPreflight(),
        },
        {
            expected: FAILURE_REASONS.aborted,
            build: () => createHarness(),
            trigger: (h) => {
                h.controller.runPreflight();
                h.controller.handleRunResult({ aborted: true });
            },
        },
        {
            expected: FAILURE_REASONS.failed,
            build: () => createHarness(),
            trigger: (h) => {
                h.controller.runPreflight();
                h.controller.handleRunResult({ px2mm: NaN });
            },
        },
    ];

    cases.forEach((entry) => {
        const h = entry.build();
        entry.trigger(h);
        assert.strictEqual(h.controller.getFailureReason(), entry.expected);
        const summary = h.controller.getSummary();
        assert.strictEqual(summary.chinrest_failure_reason, entry.expected);
        h.controller.persistFailureAndExit();
        assert.strictEqual(h.terminationCalls.length, 1);
        assert.strictEqual(h.terminationCalls[0].reason, entry.expected);
        assert.strictEqual(h.terminationCalls[0].payload.chinrest_failure_reason, entry.expected);
    });
}

function testEC14_SummaryAlwaysDefined_AllBranches() {
    const skip = createHarness({
        chinrestConfig: { enabled: false, resize_units: "deg" },
    });
    skip.controller.runPreflight();
    assertSummaryShape(skip.summaries[0]);

    const pass = createHarness();
    pass.controller.runPreflight();
    pass.controller.handleRunResult({
        px2mm: 0.2,
        view_dist_mm: 500,
        px2deg: 33,
        win_width_deg: 20,
    });
    assertSummaryShape(pass.summaries[pass.summaries.length - 1]);

    const fail = createHarness();
    fail.controller.runPreflight();
    fail.controller.handleRunResult({ px2mm: NaN });
    assertSummaryShape(fail.summaries[fail.summaries.length - 1]);

    const noEtFile = fs.readFileSync(
        path.join(__dirname, "..", "exp", "timeline-no-webgazer.js"),
        "utf8",
    );
    assert.ok(noEtFile.includes("chinrest_used"));
    assert.ok(noEtFile.includes("chinrest_passed"));
    assert.ok(noEtFile.includes("chinrest_failure_reason"));
    assert.ok(noEtFile.includes("chinrest_metrics"));
}

function testEC15_DevToggleIfPresentIgnoredByResolver() {
    const resolved = resolveEnablement({
        webgazer: { enable: true },
        virtualChinrest: { enabled: true },
        isDev: false,
        chinrestToggle: "off",
    });
    assert.strictEqual(resolved.eyeTrackingEnabled, true);
    assert.strictEqual(resolved.chinrestEnabled, true);
}

function testEC16_DownstreamGatingCompleteness() {
    const h = createHarness({
        pluginPort: { isAvailable: () => false, run: () => ({}) },
    });
    h.controller.runPreflight();
    assert.strictEqual(h.flow.shouldRunCalibration(), false);
    assert.strictEqual(h.flow.shouldRunMainTask(), false);
    assert.strictEqual(h.flow.shouldRunFailureExit(), true);
    assert.strictEqual(h.flow.shouldRunChinrestStage(), false);
}

testEC01_EnablementPrecedence_ETOffWins();
testEC02_ConfigOffSummaryDefined();
testEC03_PluginMissingFailureFieldsAndGating();
testEC04_PluginRunThrowsHandledAsFailure();
testEC05_AbortedRun();
testEC06_NaNMetricFails();
testEC07_InfiniteMetricFails();
testEC08_MissingMetricFails();
testEC09_NonPositiveMetrics_CurrentBehaviorAllowed();
testEC10_GuardWithValidCacheReusesMetrics();
testEC11_GuardWithoutCacheFailsClosed();
testEC12_ReentrancyIdempotenceOnGuardCache();
testEC13_FailureReasonPersistenceAllCanonicalReasons();
testEC14_SummaryAlwaysDefined_AllBranches();
testEC15_DevToggleIfPresentIgnoredByResolver();
testEC16_DownstreamGatingCompleteness();

console.log("EC-01..EC-16 passed");
