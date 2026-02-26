# Chinrest + Calibration Flow Report (Single Repo)

## 0. Executive Snapshot
- Chinrest estimates display geometry metrics (`px2mm`, `view_dist_mm`, `px2deg`, `win_width_deg`) and decides pass/fail before calibration. Evidence: [exp/chinrest-core.js:21-40](exp/chinrest-core.js), [exp/chinrest-core.js:191-218](exp/chinrest-core.js), [exp/timeline-webgazer.js:444-465](exp/timeline-webgazer.js).
- Calibration is WebGazer calibrate + validate with retry logic and reporting fields. Evidence: [exp/timeline-webgazer.js:587-639](exp/timeline-webgazer.js), [exp/timeline-webgazer.js:669-847](exp/timeline-webgazer.js), [exp/timeline-webgazer.js:849-881](exp/timeline-webgazer.js).
- Runtime order (ET-on): `cameraInit` -> `virtualChinrestProcedure` -> `chinrestFailureExit` (conditional) -> `calibrationProcedure`/`readyToStart` (conditional) -> main task (conditional). Evidence: [exp/main.js:30-66](exp/main.js).
- Critical downstream gate: if chinrest fails, calibration and main task are both blocked, and failure-exit runs. Evidence: [exp/chinrest-core.js:67-81](exp/chinrest-core.js), [exp/main.js:12-27](exp/main.js), [exp/timeline-webgazer.js:518-523](exp/timeline-webgazer.js).

## 1. Ordered Flow Map
1. Stage name/ID: Intake validation + experiment script load
- Trigger/entry condition: Intake validation success and test save success.
- Actions performed: Loads `exp/var.js` -> `exp/lang.js` -> `exp/timeline.js`.
- Outputs persisted: None directly for chinrest/calibration.
- Failure behavior: Alerts and stops load if scripts fail.
- Evidence: `validateIntake()` chain in [wrap/lib/validate.js:759-804](wrap/lib/validate.js).

2. Stage name/ID: Timeline branch loader
- Trigger/entry condition: `eyeTrackingEnabled` resolved.
- Actions performed: loads `exp/timeline-webgazer.js` if ET on, else `exp/timeline-no-webgazer.js`.
- Outputs persisted: None directly.
- Failure behavior: fatal load UI.
- Evidence: [exp/timeline.js:80-107](exp/timeline.js).

3. Stage name/ID: ET enablement + chinrest enablement resolution
- Trigger/entry condition: config initialization.
- Actions performed: ET from `runtimeConf.webgazer.enable`; if ET false then force `runtimeConf.virtualChinrest.enabled = false`.
- Outputs persisted: config/runtime booleans.
- Failure behavior: N/A.
- Evidence: [exp/conf.js:9-38](exp/conf.js), [exp/chinrest-core.js:42-58](exp/chinrest-core.js).

4. Stage name/ID: `cameraInit`
- Trigger/entry condition: ET-on path in main timeline.
- Actions performed: initialize camera, set WebGazer regression/display options.
- Outputs persisted: none in trial data here.
- Failure behavior: plugin-level camera gate behavior.
- Evidence: [exp/main.js:30-38](exp/main.js), [exp/timeline-webgazer.js:525-559](exp/timeline-webgazer.js).

5. Stage name/ID: `virtualChinrestGate` (preflight)
- Trigger/entry condition: `virtualChinrestProcedure` conditional true (`shouldRunChinrestStage()`).
- Actions performed:
  - Checks plugin availability.
  - Checks scale guard + cached metrics reuse/fail.
  - Determines whether actual chinrest trial runs (`chinrestRuntime.shouldRunTrial`).
- Outputs persisted (trial/global):
  - Trial: `task: "virtual_chinrest_gate"`, `virtual_chinrest_enabled`, optional `chinrest_reused_metrics`, `chinrest_passed`, metric fields, `chinrest_failure_reason`, `chinrest_preflight_status`.
  - Global summary via `writeFinalSummary(...)` in core preflight branches.
- Failure behavior: marks failure reason and downstream fail state.
- Evidence: [exp/timeline-webgazer.js:409-442](exp/timeline-webgazer.js), [exp/chinrest-core.js:164-190](exp/chinrest-core.js), [exp/chinrest-core.js:171-187](exp/chinrest-core.js).

6. Stage name/ID: `virtualChinrest` (actual plugin trial)
- Trigger/entry condition: nested conditional `chinrestRuntime.shouldRunTrial === true`.
- Actions performed: runs jsPsych virtual chinrest plugin; controller validates abort/metrics and persists pass/fail outputs.
- Outputs persisted:
  - On pass: global `px2mm`, `view_dist_mm`, `px2deg`, `win_width_deg`, `chinrest_passed:true`, and config params (`enabled`, `blindspot_reps`, `resize_units`, `pixels_per_unit`, optional `item_path`).
  - On fail: global `chinrest_passed:false`, `exclusion_recommended:true`, `exclusion_reason:"chinrest_failed"`, `chinrest_failure_reason`.
  - Trial annotations: `chinrest_result_status`, `chinrest_failure_reason` as needed.
- Failure behavior: sets failed state and blocks downstream.
- Evidence: [exp/timeline-webgazer.js:444-465](exp/timeline-webgazer.js), [exp/chinrest-core.js:111-147](exp/chinrest-core.js), [exp/chinrest-core.js:191-218](exp/chinrest-core.js).

7. Stage name/ID: `chinrestFailureExit`
- Trigger/entry condition: `shouldRunFailureExit()` true.
- Actions performed: shows failure screen and calls `persistFailureAndExit(...)`.
- Outputs persisted:
  - Trial: `task:"chinrest_failure_exit"`, `chinrest_failure_reason`.
  - Global termination payload: `termination_reason`, `task:"chinrest_failure_exit"`, `chinrest_failure_reason`.
- Failure behavior: terminates session (`writeCsvRedirect`, hides WebGazer UI, `experimentComplete=true`).
- Evidence: [exp/timeline-webgazer.js:482-523](exp/timeline-webgazer.js), [exp/timeline-webgazer.js:352-370](exp/timeline-webgazer.js), [exp/chinrest-core.js:234-239](exp/chinrest-core.js).

8. Stage name/ID: `calibrationProcedure` (`calibrationInstructions` -> `calibration` -> `validationInstructions` -> `validation` -> `validationResults`)
- Trigger/entry condition: conditional gate `shouldRunCalibrationAfterChinrest()` true.
- Actions performed:
  - Calibrate points.
  - Validate gaze metrics.
  - Compute pass/fail and retry once (`calibRepsByAttempt=[2,3]`).
- Outputs persisted:
  - Calibration trial fields (`calib_attempt`, `calib_reps_per_point`, timing/display fields).
  - Validation fields (`avg_offset`, `mean_in_roi`, point/sample fields, timing/display).
  - Validation result fields (`calib_passed`, `calib_strong_pass`, `calib_terminal_fail`, aliases).
- Failure behavior:
  - Calibration quality failure does **not** terminate; retries then proceeds flagged.
- Evidence: [exp/main.js:44-47](exp/main.js), [exp/timeline-webgazer.js:561-881](exp/timeline-webgazer.js), [exp/timeline-webgazer.js:883-931](exp/timeline-webgazer.js).

9. Stage name/ID: `readyToStart`
- Trigger/entry condition: after `calibrationProcedure`.
- Actions performed: displays calibrated/flagged message; enables continuous mouse calibration.
- Outputs persisted: global calibration/camera fields (`webgazer_enabled`, `calib_passed`, `camera_gate_*`, `calibration_*`, `regression_module`, etc.).
- Failure behavior: none; proceeds.
- Evidence: [exp/timeline-webgazer.js:883-931](exp/timeline-webgazer.js).

10. Stage name/ID: Main task bundle
- Trigger/entry condition: `shouldRunMainTaskAfterChinrest()` true.
- Actions performed: instructions, practice, learning/blocking/testing, optional ratings, then data save.
- Outputs persisted: final `calibration_report`; chinrest summary also added in ET path.
- Failure behavior: blocked when chinrest failed.
- Evidence: [exp/main.js:50-66](exp/main.js), [exp/timeline-webgazer.js:1224-1274](exp/timeline-webgazer.js).

11. Stage name/ID: ET-off save path
- Trigger/entry condition: `eyeTrackingEnabled === false` branch.
- Actions performed: no ET/chinrest stages; on save writes chinrest summary defaults.
- Outputs persisted: `chinrest_used:false`, `chinrest_passed:false`, `chinrest_failure_reason:null`, `chinrest_metrics:null`.
- Failure behavior: none specific.
- Evidence: [exp/timeline.js:94-106](exp/timeline.js), [exp/timeline-no-webgazer.js:244-260](exp/timeline-no-webgazer.js).

## 2. Post-card Distance Confirmation Step
- Status: NOT FOUND
- Searches performed and where looked:
  - Global search in source/docs for distance-confirmation terms: `rg -n "chinrest|virtualChinrest|virtual-chinrest|calibration|calibrate|webgazer|camera|distance|view_dist|confirm distance|are you|mm|cm" exp wrap index.php docs -S`.
  - Focused search for chinrest metric/confirmation cues: `rg -n "view_dist_mm|px2mm|px2deg|win_width_deg|blindspot|item_path|card|distance|confirm|are you|cm|mm|virtual_chinrest" exp wrap docs index.php -S`.
  - Checked ET timeline stages and prompts directly: [exp/timeline-webgazer.js:409-575](exp/timeline-webgazer.js), [exp/timeline-webgazer.js:651-799](exp/timeline-webgazer.js).
  - Checked vendor plugins present locally: [wrap/vendor/jspsych](wrap/vendor/jspsych) contains only WebGazer plugins; no local virtual-chinrest plugin file.
  - Checked runtime includes: virtual chinrest is loaded from unpkg CDN, not local source in repo. Evidence: [index.php:39](index.php).
- Result: No explicit local stage/prompt that asks participant to confirm measured post-card distance (e.g., “Are you actually X cm/mm from screen?”) was found in this repository.

## 3. Gates and Invariants
- Enablement resolution (ET off behavior)
  - ET off (`webgazer.enable` false) force-disables chinrest config.
  - Evidence: [exp/conf.js:35-38](exp/conf.js), [exp/chinrest-core.js:42-57](exp/chinrest-core.js).

- Chinrest gating of calibration/task
  - Calibration runs only if `!chinrestFailed`.
  - Main task runs only if `!chinrestFailed` (and flow controller supports optional hard camera gate hook).
  - Failure exit runs only if `chinrestFailed`.
  - Evidence: [exp/chinrest-core.js:67-81](exp/chinrest-core.js), [exp/main.js:12-27](exp/main.js), [exp/timeline-webgazer.js:518-523](exp/timeline-webgazer.js).

- Calibration gating of task
  - Calibration quality does not block task permanently; loop retries once, then continues flagged on terminal fail.
  - Evidence: [exp/timeline-webgazer.js:858-880](exp/timeline-webgazer.js), [exp/timeline-webgazer.js:886-898](exp/timeline-webgazer.js), [exp/main.js:44-66](exp/main.js).

- Repeat/retry logic
  - Calibration retries bounded by `calibRepsByAttempt` (`[2,3]`) and `maxCalibrationAttempts`.
  - Chinrest idempotence via scale guard + cached metrics (`data-chinrest-scale-applied`, `window.__virtualChinrestMetrics`).
  - Evidence: [exp/timeline-webgazer.js:24-25](exp/timeline-webgazer.js), [exp/timeline-webgazer.js:849-876](exp/timeline-webgazer.js), [exp/timeline-webgazer.js:333-349](exp/timeline-webgazer.js), [exp/chinrest-core.js:177-187](exp/chinrest-core.js), [exp/chinrest-core.js:212-215](exp/chinrest-core.js).

## 4. Persisted Data Contract (This Repo)
- `chinrest_passed`
  - Where written: [exp/chinrest-core.js:119](exp/chinrest-core.js), [exp/chinrest-core.js:145](exp/chinrest-core.js), [exp/timeline-webgazer.js:429](exp/timeline-webgazer.js), [exp/timeline-webgazer.js:454](exp/timeline-webgazer.js), [exp/timeline-no-webgazer.js:252](exp/timeline-no-webgazer.js).
  - Semantics: chinrest pass/fail state (global + trial mirrors).

- `exclusion_recommended`
  - Where written: [exp/chinrest-core.js:120](exp/chinrest-core.js).
  - Semantics: failure path requests exclusion.

- `exclusion_reason`
  - Where written: [exp/chinrest-core.js:121](exp/chinrest-core.js).
  - Semantics: fixed failure family (`"chinrest_failed"`).

- `chinrest_failure_reason`
  - Where written: [exp/chinrest-core.js:122](exp/chinrest-core.js), [exp/timeline-webgazer.js:436](exp/timeline-webgazer.js), [exp/timeline-webgazer.js:459](exp/timeline-webgazer.js), [exp/timeline-webgazer.js:506-513](exp/timeline-webgazer.js), [exp/timeline-no-webgazer.js:253](exp/timeline-no-webgazer.js).
  - Semantics: canonical reason string for chinrest failure.

- `px2mm`, `view_dist_mm`, `px2deg`, `win_width_deg`
  - Where written: normalized/validated in [exp/chinrest-core.js:25-40](exp/chinrest-core.js), persisted on pass in [exp/chinrest-core.js:143-147](exp/chinrest-core.js), mirrored to trial in [exp/timeline-webgazer.js:431-432](exp/timeline-webgazer.js), [exp/timeline-webgazer.js:455-457](exp/timeline-webgazer.js).
  - Semantics: chinrest geometry metrics required for pass.

- `chinrest_used`, `chinrest_metrics`
  - Where written: summary object from [exp/chinrest-core.js:102-108](exp/chinrest-core.js), emitted through `writeFinalSummary` at [exp/chinrest-core.js:167](exp/chinrest-core.js), [exp/chinrest-core.js:173](exp/chinrest-core.js), [exp/chinrest-core.js:181](exp/chinrest-core.js), [exp/chinrest-core.js:185](exp/chinrest-core.js), [exp/chinrest-core.js:200](exp/chinrest-core.js), [exp/chinrest-core.js:207](exp/chinrest-core.js), [exp/chinrest-core.js:216](exp/chinrest-core.js), [exp/chinrest-core.js:230](exp/chinrest-core.js), and added again at save in [exp/timeline-webgazer.js:1257-1260](exp/timeline-webgazer.js); ET-off defaults in [exp/timeline-no-webgazer.js:250-257](exp/timeline-no-webgazer.js).
  - Semantics: final chinrest usage/pass summary with metrics object or null.

- `virtual_chinrest_enabled`, `chinrest_preflight_status`, `chinrest_reused_metrics`, `chinrest_result_status`
  - Where written: [exp/timeline-webgazer.js:424-440](exp/timeline-webgazer.js), [exp/timeline-webgazer.js:461-463](exp/timeline-webgazer.js).
  - Semantics: chinrest gate/trial diagnostics in trial data.

- `task` (chinrest failure)
  - Where written: `task:"chinrest_failure_exit"` in [exp/timeline-webgazer.js:498-500](exp/timeline-webgazer.js) and termination payload [exp/chinrest-core.js:236-238](exp/chinrest-core.js), [exp/timeline-webgazer.js:510-513](exp/timeline-webgazer.js).
  - Semantics: terminal failure trial identifier.

- `termination_reason`
  - Where written: [exp/timeline-webgazer.js:353-361](exp/timeline-webgazer.js).
  - Semantics: reason attached during failure exit persistence.

- Calibration-related persisted fields
  - `calib_attempt`, `calib_reps_per_point`, `calibration_point_coordinates`, `camera_fps`, `calib_start_ts`, `calib_end_ts`, `calib_duration_ms`: [exp/timeline-webgazer.js:624-637](exp/timeline-webgazer.js).
  - `validation_point_coordinates`, `roi_radius_px`, `validation_point_count`, `avg_offset_px`, `avg_offset`, `mean_in_roi`, `validation_points_included`, `validation_points_total`, `validation_points_dropped`, `validation_min_samples_per_point`, `percent_in_roi_used`, `samples_per_sec`, `validation_start_ts`, `validation_end_ts`, `validation_duration_ms`: [exp/timeline-webgazer.js:709-732](exp/timeline-webgazer.js).
  - `calib_passed`, `calib_strong_pass`, `calib_terminal_fail`, `calibration_passed`, `calibration_accuracy`, `calibration_attempt`, `calibration_terminal_fail`: [exp/timeline-webgazer.js:815-839](exp/timeline-webgazer.js).
  - Global calibration/camera flags (`webgazer_enabled`, `calib_passed`, `calib_attempts`, `camera_gate_failed`, `camera_gate_timeout`, `camera_gate_policy`, `regression_module`, `drift_checks`, `calibration_final_passed`, `calibration_attempts`, `calibration_terminal_fail`): [exp/timeline-webgazer.js:908-928](exp/timeline-webgazer.js).
  - `calibration_report`: [exp/timeline-webgazer.js:1235-1256](exp/timeline-webgazer.js).

## 5. Evidence Index
- [index.php:23-48](index.php)
- [index.php:74-79](index.php)
- [wrap/lib/validate.js:759-804](wrap/lib/validate.js)
- [exp/conf.js:9-38](exp/conf.js)
- [exp/timeline.js:3-39](exp/timeline.js)
- [exp/timeline.js:80-107](exp/timeline.js)
- [exp/chinrest-core.js:10-15](exp/chinrest-core.js)
- [exp/chinrest-core.js:21-40](exp/chinrest-core.js)
- [exp/chinrest-core.js:42-58](exp/chinrest-core.js)
- [exp/chinrest-core.js:60-83](exp/chinrest-core.js)
- [exp/chinrest-core.js:93-123](exp/chinrest-core.js)
- [exp/chinrest-core.js:126-147](exp/chinrest-core.js)
- [exp/chinrest-core.js:164-218](exp/chinrest-core.js)
- [exp/chinrest-core.js:234-239](exp/chinrest-core.js)
- [exp/main.js:3-66](exp/main.js)
- [exp/timeline-webgazer.js:287-407](exp/timeline-webgazer.js)
- [exp/timeline-webgazer.js:409-523](exp/timeline-webgazer.js)
- [exp/timeline-webgazer.js:525-559](exp/timeline-webgazer.js)
- [exp/timeline-webgazer.js:561-639](exp/timeline-webgazer.js)
- [exp/timeline-webgazer.js:651-734](exp/timeline-webgazer.js)
- [exp/timeline-webgazer.js:736-847](exp/timeline-webgazer.js)
- [exp/timeline-webgazer.js:849-931](exp/timeline-webgazer.js)
- [exp/timeline-webgazer.js:1224-1274](exp/timeline-webgazer.js)
- [exp/timeline-webgazer.js:1328-1342](exp/timeline-webgazer.js)
- [exp/timeline-no-webgazer.js:244-260](exp/timeline-no-webgazer.js)
- [wrap/vendor/jspsych](wrap/vendor/jspsych)
