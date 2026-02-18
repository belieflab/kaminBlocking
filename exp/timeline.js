"use strict";

const jsPsych = initJsPsych({
    show_progress_bar: true,
    message_progress_bar: "Completion Progress",
    auto_update_progress_bar: false,
    extensions: [
        {
            type: jsPsychExtensionWebgazer,
            params: {
                sampling_interval: 34,
                auto_initialize: false,
                round_predictions: true,
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

switch (webgazer) {
    case true:
        $.getScript("exp/timeline-webgazer.js");
        break;
    case false:
        $.getScript("exp/timeline-no-webgazer.js");
        break;
}
