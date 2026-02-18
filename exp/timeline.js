"use strict";

const jsPsych = initJsPsych({
    show_progress_bar: true,
    message_progress_bar: "Completion Progress",
    auto_update_progress_bar: false,
    extensions: [
        {
            type: jsPsychExtensionWebgazer,
            // SPEC: WebGazer extension params control sampling cadence and initialization behavior.
            // REPO: Values come from runtimeConf.webgazer.* and are passed verbatim into extension params.
            // LINK: https://www.jspsych.org/v7/extensions/webgazer/
            params: {
                // SPEC: Sampling interval between gaze samples (ms).
                // REPO: runtimeConf.webgazer.sampling_interval_ms (default configured in exp/conf.js).
                // WHY: Stable sampling supports consistent validation metrics.
                // LINK: https://www.jspsych.org/v7/extensions/webgazer/
                sampling_interval:
                    runtimeConf &&
                    runtimeConf.webgazer &&
                    runtimeConf.webgazer.sampling_interval_ms,
                // SPEC: auto_initialize=false requires explicit camera init trial before gaze use.
                // REPO: init-camera plugin is pushed before calibration in exp/main.js.
                // LINK: https://www.jspsych.org/v7/extensions/webgazer/
                auto_initialize:
                    runtimeConf &&
                    runtimeConf.webgazer &&
                    runtimeConf.webgazer.auto_initialize,
                // SPEC: round_predictions toggles integer rounding of x/y predictions.
                // REPO: Controlled by runtimeConf.webgazer.round_predictions.
                // LINK: https://www.jspsych.org/v7/extensions/webgazer/
                round_predictions:
                    runtimeConf &&
                    runtimeConf.webgazer &&
                    runtimeConf.webgazer.round_predictions,
            },
        },
    ],
});

const preload = {
    type: jsPsychPreload,
    images: [stimArray, negative, positive],
    show_detailed_errors: true,
};

/* create timeline */
let timeline = [];

window.kbShowFatalLoadError =
    window.kbShowFatalLoadError ||
    function (scriptName, details) {
        const submitButton = document.getElementById("submitButton");
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = "SUBMIT";
        }
        const statusText =
            details && details.status !== undefined && details.status !== null
                ? String(details.status)
                : "unknown";
        const detailText =
            details && details.exception ? String(details.exception) : "No additional details available.";
        const html = `
            <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8f8f8;padding:24px;">
                <div style="max-width:720px;background:#fff;border:1px solid #ddd;border-radius:8px;padding:24px;color:#222;font-family:Arial,sans-serif;">
                    <h2 style="margin-top:0;">Experiment failed to load</h2>
                    <p>A required script could not be loaded: <code>${scriptName}</code>.</p>
                    <p>Status: <code>${statusText}</code></p>
                    <p>Details: <code>${detailText}</code></p>
                    <p>Please refresh the page. If this continues, contact study staff.</p>
                </div>
            </div>
        `;
        if (document.body) {
            document.body.innerHTML = html;
        }
    };

switch (eyeTrackingEnabled) {
    case true:
        $.getScript("exp/timeline-webgazer.js").fail(function (jqxhr, settings, exception) {
            console.error("Failed to load script: exp/timeline-webgazer.js", {
                status: jqxhr && jqxhr.status,
                exception: exception,
                settings: settings,
            });
            window.kbShowFatalLoadError("exp/timeline-webgazer.js", {
                status: jqxhr && jqxhr.status,
                exception: exception,
            });
        });
        break;
    case false:
        $.getScript("exp/timeline-no-webgazer.js").fail(function (jqxhr, settings, exception) {
            console.error("Failed to load script: exp/timeline-no-webgazer.js", {
                status: jqxhr && jqxhr.status,
                exception: exception,
                settings: settings,
            });
            window.kbShowFatalLoadError("exp/timeline-no-webgazer.js", {
                status: jqxhr && jqxhr.status,
                exception: exception,
            });
        });
        break;
}
