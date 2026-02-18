"use strict";

const calibrationThreshold = 70; //70% for now
const roiRadius = 200; // 150 pixel radius for "on target"
const maxCalibrationAttempts = 2;
let calibrationAttempt = 0;
let calibrationTerminalFail = false;

/* define welcome message trial */
const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: instructions[0],
    choices: "ALL_KEYS", //ascii spacebar
};

const cameraInit = {
    type: jsPsychWebgazerInitCamera,
    instructions: `
        <p>Initializing eye tracker...</p>
        <p>Please wait and allow camera access if prompted.</p>
        <p style="font-size: 18px; color: #888;">
            Position your face so it's clearly visible in the camera preview.
        </p>
    `,
    button_text: "My face is centered - Continue", //this will only appear when the face is center

    on_finish: function () {
        webgazer.showVideo(true); //the webcam video
        webgazer.showFaceOverlay(true); //the box for the face
        webgazer.showFaceFeedbackBox(true); //quality box
        webgazer.showPredictionPoints(true); // the gaze tracker
        console.log("WebGazer display options configured");
    },
};

const calibrationInstructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <h2>Eye Tracker Calibration</h2>
        <p>You will see a series of dots appear on the screen.</p>
        <br>
        <p style="font-size: 24px; color:rgb(9, 24, 243);">
        <strong>Look at each dot and click on it.</strong>
        </p>
        <br>
        <p>This helps the eye tracker learn where you're looking.</p>
        <p>Try to keep your head still during calibration.</p>
        <br>
        <p>Press SPACE when you're ready to begin calibration.</p>
    `,
    choices: [" "],

    // Hide video so calibration dots are visible
    on_finish: function () {
        webgazer.showVideo(false);
        webgazer.showFaceOverlay(false);
        webgazer.showFaceFeedbackBox(false);
    },
};

const calibration = {
    type: jsPsychWebgazerCalibrate,
    calibration_points: [
        [25, 25], //these are percentages
        [75, 25],
        [50, 50],
        [25, 75],
        [75, 75],
    ],
    calibration_mode: "click",
    point_size: 20,
    repetitions_per_point: 2,
    randomize_calibration_order: true,
};

//Note for later [from https://www.jspsych.org/6.3/overview/eye-tracking/#tips-for-improving-data-quality]
//WebGazer's click-based calibration can be used throughout the experiment.
// You can turn this on by calling jsPsych.extensions.webgazer.startMouseCalibration()
// at any point in the experiment. If you use a continue button to
// advance through the experiment and move the location of the
// continue button around you can be making small adjustments
// to the calibration throughout.

// this is a new step with the extensions

const validationInstructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <h2>Calibration Validation</h2>
        <p>Now we will test how well the calibration worked.</p>
        <br>
        <p style="font-size: 24px; color:rgb(9, 24, 243);">
            <strong>Just LOOK at each dot - no clicking needed!</strong>
        </p>
        <br>
        <p>Keep your eyes focused on each dot until it disappears.</p>
        <p>Keep your head as still as possible.</p>
        <br>
        <p>Press SPACE when you're ready.</p>
    `,
    choices: [" "],
};

const validation = {
    type: jsPsychWebgazerValidate,
    validation_points: [
        [25, 25],
        [75, 25],
        [50, 50],
        [25, 75],
        [75, 75],
    ],
    validation_point_coordinates: "percent",
    roi_radius: roiRadius,
    time_to_saccade: 1000,
    validation_duration: 2000,
    point_size: 20,
    show_validation_data: true,
    data: {
        task: "validation",
    },
};

const validationResults = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        const validationData = jsPsych.data
            .get()
            .filter({ task: "validation" })
            .last(1)
            .values()[0]; //gets the validation data

        const percentages = validationData.percent_in_roi;
        // like a mean for the accuracy
        const averageAccuracy =
            percentages.reduce((a, b) => a + b, 0) / percentages.length;
        //how much gaze was off
        const avgOffset = Math.round(validationData.average_offset);
        const passed = averageAccuracy >= calibrationThreshold;
        const accuracyColor = passed ? "#4CAF50" : "#f44336";
        const statusText = passed ? "PASSED" : "NEEDS RECALIBRATION";
        const statusColor = passed ? "#4CAF50" : "#f44336";

        let html = `
        <h2>Calibration Results</h2>
            <div style="background: #f5f5f5; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
                
                <p style="font-size: 48px; color: ${accuracyColor}; margin: 10px 0;">
                    <strong>${averageAccuracy.toFixed(1)}%</strong>
                </p>
                <p style="font-size: 18px; color: #666;">Overall Accuracy</p>
                
                <hr style="margin: 20px 0;">
                
                <p style="font-size: 24px; color: ${statusColor};">
                    <strong>${statusText}</strong>
                </p>
                
                <p style="font-size: 14px; color: #888; margin-top: 20px;">
                    Average offset: ${avgOffset} pixels<br>
                    Threshold: ${calibrationThreshold}%<br>
                    ROI radius: ${roiRadius} pixels
                </p>
            </div>
        `;

        if (passed) {
            html += `
               <br>
                <p style="color: #4CAF50;">✓ Calibration successful!</p>
                <p>Press SPACE to continue to the experiment.</p>
            `;
        } else if (calibrationAttempt < maxCalibrationAttempts - 1) {
            html += `
            <br>
            <p style="color: #f44336;">✗ Calibration accuracy is too low.</p>
            <p>Press SPACE to recalibrate (final attempt).</p>
        `;
        } else {
            html += `
            <br>
            <p style="color: #f44336;">✗ Calibration accuracy is still low.</p>
            <p>We will proceed, but this session will be flagged.</p>
            <p>Press SPACE to continue.</p>
        `;
        }
        return html;
    },

    choices: [" "],
    on_finish: function (data) {
        const validationData = jsPsych.data
            .get()
            .filter({ task: "validation" })
            .last(1)
            .values()[0];
        const percentages = validationData.percent_in_roi;
        const averageAccuracy =
            percentages.reduce((a, b) => a + b, 0) / percentages.length;

        // Store pass/fail in this trial's data
        data.calibration_passed = averageAccuracy >= calibrationThreshold;
        data.calibration_accuracy = averageAccuracy;
        data.calibration_attempt = calibrationAttempt;
        data.calibration_terminal_fail =
            !data.calibration_passed &&
            calibrationAttempt >= maxCalibrationAttempts - 1;

        console.log(
            `Calibration accuracy: ${averageAccuracy.toFixed(1)}%, Passed: ${data.calibration_passed}`,
        );
    },
};

const calibrationProcedure = {
    timeline: [
        calibrationInstructions,
        calibration,
        validationInstructions,
        validation,
        validationResults,
    ],

    loop_function: function (data) {
        const lastResult = jsPsych.data.get().last(1).values()[0];

        if (lastResult.calibration_passed === false) {
            if (calibrationAttempt < maxCalibrationAttempts - 1) {
                calibrationAttempt += 1;
                console.log("Calibration failed - repeating calibration procedure");
                return true;
            }
            calibrationTerminalFail = true;
            console.log("Calibration failed after fallback - proceeding flagged");
            return false;
        }

        console.log("Calibration passed - continuing to experiment");
        return false;
    },
};

const readyToStart = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
        if (calibrationTerminalFail) {
            return `
                <h2>Calibration Completed (Flagged)</h2>
                <p>Calibration did not meet thresholds after the fallback attempt.</p>
                <p>We will proceed, but this session will be flagged.</p>
                <p>Press SPACE to continue to the experiment instructions.</p>
            `;
        }
        return `
            <h2>Calibration successfully completed!</h2>
            <p>The eye tracker is now calibrated.</p>
            <p>Press SPACE to continue to the experiment instructions.</p>
        `;
    },
    choices: [" "],
    on_finish: function () {
        webgazer.showVideo(true);
        webgazer.showFaceOverlay(true);
        webgazer.showFaceFeedbackBox(true);
        webgazer.showPredictionPoints(false); // can be true too
        // for other experiments this is useful, see https://www.jspsych.org/6.3/overview/eye-tracking/#tips-for-improving-data-quality
        jsPsych.extensions.webgazer.startMouseCalibration();
        jsPsych.data.addProperties({
            calibration_final_passed: !calibrationTerminalFail,
            calibration_attempts: calibrationAttempt + 1,
            calibration_terminal_fail: calibrationTerminalFail,
        });
        console.log("Continuous mouse calibration started");
    },
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
    extensions: [
        {
            type: jsPsychExtensionWebgazer,
            params: {
                targets: [],
            },
        },
    ],

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
        if (data.webgazer_data) {
            console.log(
                `Trial collected ${data.webgazer_data.length} gaze samples`,
            );
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
    extensions: [
        {
            type: jsPsychExtensionWebgazer,
            params: {
                targets: [],
            },
        },
    ],
    trial_duration: feedbackDuration,
    response_ends_trial: false,
    on_start: () => {
        // Clear the keyboard buffer to prevent any previous responses from affecting this trial
        jsPsych.pluginAPI.clearAllTimeouts(); // Clear any timeouts set by previous trials
    },

    on_finish: (data) => {
        if (data.webgazer_data) {
            console.log(
                `Trial collected ${data.webgazer_data.length} gaze samples`,
            );
        }
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

    extensions: [
        {
            type: jsPsychExtensionWebgazer,
            params: {
                targets: [],
            },
        },
    ],
    on_finish: function (data) {
        writeCandidateKeys(data);

        data.response = responseKey;
        data.version = version;
        data.task_version = version;

        var ratingRandom = jsPsych.data.get().select("responses").values[0];

        // var currentData = jsPsych.currentTrial().data;
        console.log(ratingRandom);
        data.rating_random = ratingRandom;
        if (data.webgazer_data) {
            console.log(
                `Trial collected ${data.webgazer_data.length} gaze samples`,
            );
        }
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
    extensions: [
        {
            type: jsPsychExtensionWebgazer,
            params: {
                targets: [],
            },
        },
    ],
    on_finish: function (data) {
        writeCandidateKeys(data);
        data.response = responseKey;
        data.version = version;
        data.task_version = version;
        var ratingSabotage = jsPsych.data.get().select("responses").values[0];
        data.rating_sabotage = ratingSabotage;
        // var currentData = jsPsych.currentTrial().data;
        console.log(ratingSabotage);
        if (data.webgazer_data) {
            console.log(
                `Trial collected ${data.webgazer_data.length} gaze samples`,
            );
        }
    },

    // trial_duration: 60000,
};

const dataSave = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: dataSaveAnimation,
    choices: "NO_KEYS",
    trial_duration: 5000,
    on_finish: () => {
        jsPsych.extensions.webgazer.stopMouseCalibration();
        console.log("Continuous mouse calibration stopped");
        writeCsvRedirect();
        experimentComplete = true;
        webgazer.showVideo(false);
        webgazer.showFaceOverlay(false);
        webgazer.showFaceFeedbackBox(false);
        console.log("Experiment complete, data saved");
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
