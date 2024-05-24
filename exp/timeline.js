"use strict";

const jsPsych = initJsPsych({
    show_progress_bar: true,
    message_progress_bar: "Completion Progress",
    auto_update_progress_bar: false,
});

/* create timeline */
const timeline = [];

const preload = {
    type: jsPsychPreload,
    images: [stimArray, negative, positive],
    show_detailed_errors: true,
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
    on_load: buttonPress,
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
    type: "jsPsychSurveyMultiChoice",
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
        console.log(ratingRandom);
        data.rating_random = ratingRandom;
    },
};
const screenRating2 = {
    type: "jsPsychSurveyMultiChoice",
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
        console.log(ratingSabotage);
    },

    // trial_duration: 60000,
};

const dataSave = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: dataSaveAnimation(),
    choices: "NO_KEYS",
    trial_duration: 5000,
    on_finish: () => {
        // const updatedScore =
        //     typeof score !== "undefined"
        //         ? score
        //         : jsPsych.data.get().select("score").values.slice(-1)[0]; // Replace 'score' with actual data key if necessary
        // Now, generate the thank you message with the updated score
        const thankYou = instructions[10];

        saveDataPromise()
            .then((response) => {
                console.log("Data saved successfully.", response);
                // Update the stimulus content directly via DOM manipulation
                document.querySelector("#jspsych-content").innerHTML = thankYou;
            })
            .catch((error) => {
                console.log("Failed to save data.", error);
                // Check if the error object has 'error' property and use it, otherwise convert object to string
                let errorMessage = error.error || JSON.stringify(error);
                switch (errorMessage) {
                    case '{"success":false}':
                        errorMessage =
                            "The ./data directory does not exit on this server.";
                        break;
                    case "Not Found":
                        errorMessage =
                            "There was an error saving the file to disk.";
                        break;
                    default:
                        errorMessage = "Unknown error.";
                }
                // Update the stimulus content directly via DOM manipulation
                const dataFailure = `
                <div class="error-page">
                    <p>Oh no!</p>
                    <p>An error has occured and your data has not been saved:</p>
                    <p>${errorMessage}</p>
                    <p>Please wait for the experimenter to continue.</p>
                </div>`;
                document.querySelector("#jspsych-content").innerHTML =
                    dataFailure;
            })
            .finally(() => {
                document.getElementById("unload").onbeforeunload = ""; // Removes popup
                $("body").addClass("showCursor"); // Returns cursor functionality
                closeFullscreen(); // Kill fullscreen
                if (!src_subject_id) {
                    window.location.replace(feedbackLink);
                }
            });
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
