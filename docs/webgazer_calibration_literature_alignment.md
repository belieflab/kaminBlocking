# WebGazer Calibration/Validation Literature Alignment (webgazer branch)

## 1) Overview
This document covers only WebGazer calibration + validation runtime behavior, plugin conventions, metric definitions, and pass/fail logic in the `webgazer` branch path assembled by `exp/main.js` and `exp/timeline-webgazer.js` (exp/main.js:7-10, exp/timeline-webgazer.js:535-565). This document explicitly excludes virtual chinrest, camera gate, and drift topics as out of scope for this branch note (exp/main.js:7-10).

## 2) Active Runtime Load Chain (Calibration/Validation only)
- `index.php` loads core calibration/validation prerequisites: `wrap/lib/validate.js`, `webgazer.js`, `jspsych@7.3.3`, and pinned local WebGazer extension/plugins (`extension-webgazer`, `plugin-webgazer-init-camera`, `plugin-webgazer-calibrate`, `plugin-webgazer-validate`) (index.php:23-30, index.php:41-47).
- Intake/start validation handlers then dynamically load `exp/var.js` -> `exp/lang.js` -> `exp/timeline.js` after validation passes (wrap/lib/validate.js:328-337, wrap/lib/validate.js:530-539, wrap/lib/validate.js:767-774).
- `exp/timeline.js` initializes jsPsych with `jsPsychExtensionWebgazer`, then branches to `exp/timeline-webgazer.js` when `eyeTrackingEnabled` is true (exp/timeline.js:3-25, exp/timeline.js:37-40).
- `exp/main.js` pushes `cameraInit`, `calibrationProcedure`, and `readyToStart` on the ET path (exp/main.js:7-10).

## 3) System Map (Where to Look) — Calibration/Validation only
### 3.1 Configuration (webgazer settings used by calibration/validation)
- Runtime WebGazer settings are defined in `runtimeConf.webgazer` (`enable`, `regression_module`, `sampling_interval_ms`, `auto_initialize`, `round_predictions`) (exp/conf.js:9-16).
- ET branch control is `eyeTrackingEnabled = !!(runtimeConf.webgazer && runtimeConf.webgazer.enable)` (exp/conf.js:27-31).
- `runtimeConf.webgazer.regression_module` is applied in `cameraInit.on_finish` via `webgazer.setRegression(...)` when available (exp/timeline-webgazer.js:260-267).

### 3.2 WebGazer extension initialization (sampling_interval/auto_initialize/round_predictions)
- `initJsPsych(...extensions...)` wires `jsPsychExtensionWebgazer` params from `runtimeConf.webgazer.sampling_interval_ms`, `runtimeConf.webgazer.auto_initialize`, and `runtimeConf.webgazer.round_predictions` (exp/timeline.js:3-25).

### 3.3 Calibration
- Calibration trial definition is `const calibration = { type: jsPsychWebgazerCalibrate, ... }` with calibration-specific parameters in the same object (exp/timeline-webgazer.js:305-312).

### 3.4 Validation + Metrics Pipeline
- Validation trial definition is `const validation = { type: jsPsychWebgazerValidate, ... }` with validation parameters and `on_finish` summary projection (exp/timeline-webgazer.js:370-386).
- Metric computation pipeline lives in `computeValidationMetrics`, using helper functions for raw payload resolution/sanitization, sample counting, sample-rate, and scalar offset calculation (exp/timeline-webgazer.js:86-199).

## 4) Calibration (Plugin conventions + repo settings)
- Repo calibration parameters are set as: `calibration_points`, `calibration_mode`, `point_size`, `repetitions_per_point`, `randomize_calibration_order` (exp/timeline-webgazer.js:306-312).
- Vendored calibrate plugin exposes `calibration_points` in its parameter block and does not show a coordinate-mode parameter in that same parameter list excerpt (wrap/vendor/jspsych/plugin-webgazer-calibrate-1.0.3.js:1:595-638; context excerpt includes `parameters:{calibration_points... calibration_mode... point_size... repetitions_per_point... randomize_calibration_order...`).
- Vendored calibrate plugin renders points with `%` CSS coordinates (`left:${pt[0]}%; top:${pt[1]}%`) in the calibration point template (wrap/vendor/jspsych/plugin-webgazer-calibrate-1.0.3.js:1:1982-2023; excerpt contains `left:").concat(e[0],"%; top:").concat(e[1],'%`).
- Therefore, in this vendored calibrate plugin, `calibration_points` are interpreted as percent coordinates by implementation (wrap/vendor/jspsych/plugin-webgazer-calibrate-1.0.3.js:1:1982-2023).
- UNKNOWN: full-file proof of absence of any alternate calibrate coordinate-mode API cannot be line-ranged from a minified one-line artifact alone beyond the shown parameter block excerpt (wrap/vendor/jspsych/plugin-webgazer-calibrate-1.0.3.js:1:595-638).

## 5) Validation (Plugin outputs + repo expectations)
### 5.1 Validate trial parameter names used in this repo
- Repo validate parameters are: `validation_points`, `validation_point_coordinates`, `roi_radius`, `time_to_saccade`, `validation_duration`, `point_size`, `show_validation_data` (exp/timeline-webgazer.js:372-378).

### 5.2 Vendored validate plugin emitted fields (proof)
- Vendored validate plugin initializes `raw_gaze`, `percent_in_roi`, `average_offset`, `validation_points` in trial data object construction (wrap/vendor/jspsych/plugin-webgazer-validate-1.0.3.js:1:1406-1475; excerpt includes `a={raw_gaze:[],percent_in_roi:[],average_offset:[],validation_points:null}`).
- Vendored validate plugin writes `samples_per_sec` during validation completion (wrap/vendor/jspsych/plugin-webgazer-validate-1.0.3.js:1:2407-2424; excerpt includes `a.samples_per_sec=`).
- Vendored validate plugin writes per-point `percent_in_roi[t]` (wrap/vendor/jspsych/plugin-webgazer-validate-1.0.3.js:1:2784-2803; excerpt includes `a.percent_in_roi[t]=`).
- Vendored validate plugin writes per-point `average_offset[t]` (wrap/vendor/jspsych/plugin-webgazer-validate-1.0.3.js:1:2986-3005; excerpt includes `a.average_offset[t]=`).
- TARGET reads payload keys via fallback list `raw_gaze`, `webgazer_data`, `rawGaze` and reads `percent_in_roi`, `average_offset`, and optional `samples_per_sec` (exp/timeline-webgazer.js:146-199).

### 5.3 Data shapes (repo contract)
- `raw_gaze`/`webgazer_data` is treated as `Array<Array<sample>>` with one inner array per validation point, and per-point counts are `raw_gaze[i].length` (exp/timeline-webgazer.js:86-95, exp/timeline-webgazer.js:146-161).
- `average_offset` is treated as `Array<{x:number,y:number,r:number}>` and `r` is interpreted by repo as per-point median radial offset in pixels for aggregation (exp/timeline-webgazer.js:157-173).
- `percent_in_roi` is treated as per-point numeric values used for weighted aggregation (exp/timeline-webgazer.js:187-190).
- `samples_per_sec` is read directly when provided; otherwise repo recomputes from sample timing/duration (exp/timeline-webgazer.js:127-155, exp/timeline-webgazer.js:195-198).

## 6) Metrics + Pass/Fail Rules (Definitions vs thresholds)
- Per-point sample counts are computed from grouped validation payload arrays (`Array.isArray(webgazerData[i]) ? webgazerData[i].length : 0`) (exp/timeline-webgazer.js:86-95).
- Points are filtered by valid percent range and `validationMinSamplesPerPoint` before primary aggregation, with fallback to valid-percent-only points when needed (exp/timeline-webgazer.js:194-205).
- `meanInRoi` is a weighted mean using `max(1, samples)` as weights across included points (exp/timeline-webgazer.js:207-215).
- Scalar `avgOffset` is deterministic: mean of per-point `average_offset[].r` after finite-value filtering (exp/timeline-webgazer.js:157-173).
- Pass rule is `avgOffset != null && meanInRoi != null && avgOffset <= avgOffsetPassPx && meanInRoi >= meanInRoiThreshold` (exp/timeline-webgazer.js:201-207).
- Strong-pass rule is `avgOffset != null && avgOffset <= avgOffsetStrongPassPx` (exp/timeline-webgazer.js:210-212).

| Threshold | Value | Status |
|---|---:|---|
| `meanInRoiThreshold` | `70` (exp/timeline-webgazer.js:23) | Project-defined (requires pilot justification) |
| `avgOffsetPassPx` | `200` (exp/timeline-webgazer.js:24) | Project-defined (requires pilot justification) |
| `avgOffsetStrongPassPx` | `150` (exp/timeline-webgazer.js:25) | Project-defined (requires pilot justification) |
| `validationMinSamplesPerPoint` | `20` (exp/timeline-webgazer.js:26) | Project-defined (requires pilot justification) |

## 7) Change Index (Calibration/Validation only)

| File | Line range | Subsystem | What changed | Why |
|---|---|---|---|---|
| `index.php` | 39-47 | Validation runtime wiring | Switched WebGazer jsPsych extension/plugins to pinned local vendor files. | Schema compatibility + reproducible plugin behavior for calibration/validation only. |
| `exp/timeline-webgazer.js` | 28-30, 331-332, 365-367 | Calibration / Validation | Added explicit coordinate convention constant and emitted coordinate metadata in trial data. | Aligns with jsPsych v7 calibrate percent-coordinate behavior proven in vendored plugin. |
| `exp/timeline-webgazer.js` | 146-155, 357-360 | Data schema | Canonical payload read prefers `raw_gaze`; compatibility alias maps `webgazer_data = raw_gaze`. | Resolves naming mismatch while preserving existing consumers. |
| `exp/timeline-webgazer.js` | 157-173, 370-372, 508-510 | Metrics | Deterministic scalar `avg_offset` from mean of per-point `r` values; emitted in validation outputs. | Aligns repo metric contract with plugin-emitted `average_offset` object shape. |
| `exp/timeline-webgazer.js` | 98-125, 186-199 | Validation | Added raw sample sanitization and robust `samples_per_sec` fallback. | Improves calibration/validation reliability with unsanitized input protection. |
| `exp/timeline-webgazer.js` | 273-274, 301-302, 320, 384-385 | Calibration / Validation UX | Keeps prediction dot hidden during calibration; validation visualization remains plugin-controlled. | Prevents calibration UI contamination; validation still supports visual diagnostics. |

## 8) Verification Checklist

### Static checks (`rg`)
```bash
rg -n "calibration_points|calibration_mode|point_size|repetitions_per_point|randomize_calibration_order" exp/timeline-webgazer.js
rg -n "validation_points|validation_point_coordinates|roi_radius|time_to_saccade|validation_duration|show_validation_data" exp/timeline-webgazer.js
rg -n "raw_gaze|webgazer_data|percent_in_roi|average_offset|samples_per_sec|avg_offset" exp/timeline-webgazer.js
rg -n "computePointSampleCounts|computeValidationMetrics|resolveAvgOffset|isValidationPass|isValidationStrongPass" exp/timeline-webgazer.js
rg -n "plugin-webgazer-calibrate-1.0.3|plugin-webgazer-validate-1.0.3|extension-webgazer-1.0.3" index.php
```
Expected: calibration/validation parameter names present, coordinate-mode convention fields present, canonical+alias payload keys present, and deterministic `avg_offset` emission present (exp/timeline-webgazer.js:86-212, exp/timeline-webgazer.js:357-372).

### Runtime sanity checks
- Calibration runs, then validation runs, because `calibrationProcedure` timeline is `[calibrationInstructions, calibration, validationInstructions, validation, validationResults]` (exp/timeline-webgazer.js:535-542).
- Retry loop is bounded by `maxCalibrationAttempts - 1` and stops with terminal flag when exhausted (exp/timeline-webgazer.js:544-560).
- Saved data includes calibration/validation result fields and final calibration report write path (`dataSave`) (exp/timeline-webgazer.js:501-525, exp/timeline-webgazer.js:913-947).
- Canonical/alias expectation for validation payload is maintained (`raw_gaze` canonical + `webgazer_data` alias) (exp/timeline-webgazer.js:146-155, exp/timeline-webgazer.js:357-360).

### CDN dependency risk
- Behavior of CDN-loaded `webgazer.js` and `jspsych@7.3.3` remains runtime-dependent and therefore partially UNKNOWN if upstream assets change or are unavailable (index.php:27-30).
