"use strict";

const runtimeDebugLog = (...args) => {
    if (typeof debug !== "undefined" && debug) {
        console.log(...args);
    }
};

/* define welcome message trial */
const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[0],
    choices: "ALL_KEYS", //ascii spacebar
};

/* define instructions trial */
const instruction1 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[1],
    choices: [" "], //ascii spacebar
};

const instruction2 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[2],
    choices: [" "], //ascii spacebar
};

const instruction3 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[3],
    choices: ["0", "1"], //ascii spacebar
};

const instruction4 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[4],
    choices: [" "], //ascii spacebar
};

const instruction5 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[5],
    choices: [" "], //ascii spacebar
};

const instructionSet = [
    instruction1,
    instruction2,
    instruction3,
    instruction4,
    instruction5,
];

// create fixation point
const fixation = {
    // data: {test_part: 'fixation'},
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div style="color:black; font-size:60px;">+</div>',
    choices: "NO_KEYS",
    trial_duration: fixationDuration,
};

// create  trials
const stimuli = {
    type: jsPsychHtmlKeyboardResponse,

    stimulus: () => {
        var html;
        var stimulus2 = jsPsych.timelineVariable("stimulus2", true);
        if (version !== "social_kamin") {
            if (stimulus2 !== null) {
                html =
                    "<div class='stimuli-container'>" + // Changed from image-container to stimuli-container
                    "<img class='stimuli-left-allergy' src='" +
                    jsPsych.timelineVariable("stimulus", true) +
                    "'>" +
                    "<img class='stimuli-right-allergy' src='" +
                    stimulus2 +
                    "'>" +
                    "</div>";
            } else if (stimulus2 === null) {
                html =
                    "<img class='stimuli-allergy' src='" +
                    jsPsych.timelineVariable("stimulus", true) +
                    "'>";
            }
        } else {
            if (stimulus2 !== null) {
                html =
                    "<div class='stimuli-container'>" + // Changed from image-container to stimuli-container
                    "<img class='stimuli-left-social' src='" +
                    jsPsych.timelineVariable("stimulus", true) +
                    "'>" +
                    "<img class='stimuli-right-social' src='" +
                    stimulus2 +
                    "'>" +
                    "</div>";
            } else if (stimulus2 === null && version === "social_kamin") {
                html =
                    "<img class='stimuli-social' src='" +
                    jsPsych.timelineVariable("stimulus", true) +
                    "'>";
            }
        }
        return html;
    },

    // jsPsych.timelineVariable('stimulus'),
    choices: "NO_KEYS", // key_press handled instead by responseKey
    trial_duration: stimuliDuration,
    response_ends_trial: false,
    prompt:
        progressBar +
        fillUp +
        feedbackGenerator +
        timeRemaining +
        '<form autocomplete="off" action=""> <input autocomplete="false" name="hidden" id="tapTap" type="text" style="background-color:black; color: transparent; outline:none; border:none; background:none;" onkeypress="">',
    data: jsPsych.timelineVariable("data"),
    on_load: () => {
        buttonPress(48, 49); // Correctly pass the function to execute upon loading
    },
    on_finish: (data) => {
        writeCandidateKeys(data);

        data.response = responseKey;
        data.version = version;
        data.task_version = version;

        if (responseKey == data.correct_response) {
            data.accuracy = 1;
            data.confidence = totalConfidence;
            responseKey = "";
        } else if (responseKey == data.incorrect_response) {
            data.accuracy = 0;
            data.confidence = totalConfidence;
            responseKey = "";
        } else {
            data.accuracy = "";
            data.confidence = "";
            responseKey = "";
        }
        data.index = trialIterator;
        trialIterator++;
    },
};

// create feedback trials
const feedback = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: () => {
        let last_trial_feedback = jsPsych.data
            .get()
            .last(1)
            .values()[0].correct_response;
        if (last_trial_feedback == 49) {
            return positiveFeedback;
        }
        if (last_trial_feedback == 48) {
            return negativeFeedback;
        }
    },
    choices: "NO_KEYS",
    trial_duration: feedbackDuration,
    response_ends_trial: false,
    on_start: () => {
        // Clear the keyboard buffer to prevent any previous responses from affecting this trial
        jsPsych.pluginAPI.clearAllTimeouts(); // Clear any timeouts set by previous trials
    },
};

const instruction6 = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[6],
    choices: [" "], //ascii spacebar
};

//COMPLETION MESSAGE: Completed Classification Phase

const screenRating1 = {
    type: jsPsychSurveyMultiChoice,
    questions: [
        {
            prompt: instructions[7],
            name: "rating_random",
            options: [
                "Definitely Not",
                "Probably Not",
                "Unsure",
                "Probably Yes",
                "Definitely Yes",
            ],
            required: true,
            horizontal: true,
        },
    ],
    choices: "NO_KEYS",
    on_start: function () {
        document.getElementById("unload").onbeforeunload = "";
        $(document).ready(function () {
            $("body").addClass("showCursor"); // returns cursor functionality
        });
    },
    on_finish: function (data) {
        writeCandidateKeys(data);

        data.response = responseKey;
        data.version = version;
        data.task_version = version;

        var ratingRandom = jsPsych.data.get().select("responses").values[0];

        // var currentData = jsPsych.currentTrial().data;
        runtimeDebugLog(ratingRandom);
        data.rating_random = ratingRandom;
    },
};
const screenRating2 = {
    type: jsPsychSurveyMultiChoice,
    questions: [
        {
            prompt: instructions[8],
            name: "rating_sabotage",
            options: [
                "Definitely Not",
                "Probably Not",
                "Unsure",
                "Probably Yes",
                "Definitely Yes",
            ],
            required: true,
            horizontal: true,
        },
    ],
    choices: "NO_KEYS",
    on_finish: function (data) {
        writeCandidateKeys(data);
        data.response = responseKey;
        data.version = version;
        data.task_version = version;
        var ratingSabotage = jsPsych.data.get().select("responses").values[0];
        data.rating_sabotage = ratingSabotage;
        // var currentData = jsPsych.currentTrial().data;
        runtimeDebugLog(ratingSabotage);
    },

    // trial_duration: 60000,
};

const dataSave = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: dataSaveAnimation,
    choices: "NO_KEYS",
    trial_duration: 5000,
    on_finish: function (data) {
        const calibrationReport = {
            attempts_total: 0,
            attempts: [],
            final: {
                calib_passed: false,
                calib_strong_pass: false,
                calib_terminal_fail: false,
                avg_offset_px: null,
                mean_in_roi: null,
            },
            drift_checks_total: 0,
            drift_failures_total: 0,
            drift_recalibrations_total: 0,
            drift_checks_skipped: true,
            camera_gate_failed: false,
            camera_gate_timeout: false,
            camera_gate_policy: null,
            camera_gate_failure_reason: null,
            regression_module: null,
            chinrest_used: false,
            chinrest_passed: false,
            chinrest_failure_reason: null,
            chinrest_metrics: null,
            device_metrics: {
                screen_w: window.screen && Number.isFinite(window.screen.width) ? window.screen.width : null,
                screen_h: window.screen && Number.isFinite(window.screen.height) ? window.screen.height : null,
                window_w: window.innerWidth,
                window_h: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio || 1,
            },
        };
        const chinrestSummary = {
            chinrest_used: false,
            chinrest_passed: false,
            chinrest_failure_reason: null,
            chinrest_metrics: null,
        };
        jsPsych.data.addProperties(
            Object.assign({}, chinrestSummary, {
                webgazer_enabled: false,
                calib_passed: false,
                calib_attempts: 0,
                camera_gate_failed: false,
                camera_gate_timeout: false,
                camera_gate_policy: null,
                regression_module: null,
                drift_checks: {
                    total: 0,
                    failures: 0,
                    recalibrations: 0,
                    skipped: true,
                },
                calibration_report: calibrationReport,
            }),
        );
        data.calibration_report = calibrationReport;
        data.chinrest_summary = chinrestSummary;
        writeCsvRedirect();
    },
};

// Defince procedures

let practice_procedure = {
    timeline: [fixation, stimuli, feedback],
    timeline_variables: practice_stimuli,
    randomize_order: false,
};

// Define common procedure settings struct
const commonSettings = (stimuliType) => ({
    timeline: [fixation, stimuli, feedback],
    timeline_variables: stimuliType,
    randomize_order: true,
    type: "fixed-repetitions",
});

// Initialize procedures
let learning_procedure, blocking_procedure, testing_procedure;

switch (version) {
    case "kamin":
        learning_procedure = {
            ...commonSettings(learning_stimuli_standard),
            repetitions: getRepetitions().learning,
        };
        blocking_procedure = {
            ...commonSettings(blocking_stimuli_standard),
            repetitions: getRepetitions().blocking,
        };
        testing_procedure = {
            ...commonSettings(testing_stimuli_standard),
            repetitions: getRepetitions().testing,
        };
        break;
    case "social_kamin":
    case "kamin_gain":
    case "kamin_loss":
        learning_procedure = {
            ...commonSettings(learning_stimuli_short),
            repetitions: getRepetitions().learning,
        };
        blocking_procedure = {
            ...commonSettings(blocking_stimuli_short),
            repetitions: getRepetitions().blocking,
        };
        testing_procedure = {
            ...commonSettings(testing_stimuli_short),
            repetitions: getRepetitions().testing,
        };
        break;
}

// call main
$.getScript("exp/main.js");
