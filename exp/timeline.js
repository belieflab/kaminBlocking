"use strict";


const jsPsych = initJsPsych({
    show_progress_bar: true,
    message_progress_bar: "Completion Progress",
    auto_update_progress_bar: false,
    extensions: [
        {
            type: jsPsychExtensionWebgazer
        }
    ]
});

const preload = {
    type: jsPsychPreload,
    images: [stimArray, negative, positive],
    show_detailed_errors: true,
};

/* create timeline */
let timeline = [];


switch (webgazerUse) {
    case true:
        $.getScript("exp/timeline-webgazer.js");
        break;
    case false:
        $.getScript("exp/timeline-no-webgazer.js");
        break;
}
