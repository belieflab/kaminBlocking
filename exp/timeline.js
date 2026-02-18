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

switch (eyeTrackingEnabled) {
    case true:
        $.getScript("exp/timeline-webgazer.js");
        break;
    case false:
        $.getScript("exp/timeline-no-webgazer.js");
        break;
}
