startExperiment = () => {
    jsPsych.init({
        timeline: timeline,
        show_progress_bar: true,
        preload_video: [],
        preload_audio: [],
        preload_images: [],
    });
};

/* create timeline */
let timeline = [];

/* define welcome message trial */
let welcome = {
    type: "html-keyboard-response",
    stimulus: instructions[0],
};

/* define instructions trial */
let instructions_1 = {
    type: "html-keyboard-response",
    stimulus: instructions[1],
    choices: [32], //ascii spacebar
};

let instructions_2 = {
    type: "html-keyboard-response",
    stimulus: instructions[2],
    choices: [32], //ascii spacebar
};

let instructions_3 = {
    type: "html-keyboard-response",
    stimulus: instructions[3],
    choices: [48, 49], //ascii spacebar
};

let instructions_4 = {
    type: "html-keyboard-response",
    stimulus: instructions[4],
    choices: [32],
};

let instructions_5 = {
    type: "html-keyboard-response",
    stimulus: instructions[5],
    choices: [32],
};

// create fixation point
let fixation = {
    // data: {test_part: 'fixation'},
    type: "html-keyboard-response",
    stimulus: '<div style="color:black; font-size:60px;">+</div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: fixationDuration,
};

// create  trials
let stimuli = {
    type: "html-keyboard-response",

    stimulus: function () {
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
    choices: [jsPsych.NO_KEYS], // key_press handled instead by responseKey
    trial_duration: stimuliDuration,
    response_ends_trial: false,
    prompt:
        progressBar +
        fillUp +
        feedbackGenerator +
        timeRemaining +
        '<form autocomplete="off" action=""> <input autocomplete="false" name="hidden" id="tapTap" type="text" style="background-color:black; color: transparent; outline:none; border:none; background:none;" onkeypress="">',
    data: jsPsych.timelineVariable("data"),
    on_load: (buttonPress = (data) => {
        barFill = document.getElementById("fillUp");
        barFill.innerHTML = responseOptions;
        document.getElementById("tapTap").focus(); //gives focus to the text box
        // Set up the text box to capture key events
        const tapTapElement = document.getElementById("tapTap");
        tapTapElement.focus(); // Focus on the text box to capture key events

        // Variables to keep track of whether the key is held down
        let keyHeld48 = false;
        let keyHeld49 = false;

        // Function to handle key press
        const handleKeyPress = (keycode, isKeyDown) => {
            if (keycode === 48) {
                keyHeld48 = isKeyDown;
            } else if (keycode === 49) {
                keyHeld49 = isKeyDown;
            }
            responseKey = keycode;

            // Trigger the confidence movement if either key is held
            if (keyHeld48 || keyHeld49) {
                totalConfidence = moveConfidence();
            }
        };

        // Keydown event
        $(tapTapElement).keydown(function (event) {
            var keycode = event.which;
            if (keycode === 48 || keycode === 49) {
                handleKeyPress(keycode, true);
                event.preventDefault(); // Prevent default action and stop propagation
            }
        });

        // Keyup event
        $(tapTapElement).keyup(function (event) {
            var keycode = event.which;
            if (keycode === 48 || keycode === 49) {
                handleKeyPress(keycode, false);
                event.preventDefault(); // Prevent default action and stop propagation
            }
        });
    }),
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
let feedback = {
    // data: {test_part: 'feedback'},
    type: "html-keyboard-response",
    // stimulus: function() {
    //     let last_trial_accuracy = jsPsych.data.get().last(1).values()[0].accuracy;
    //     if (last_trial_accuracy == 1) {
    //         return '<div style="color:red; font-size:60px;">ALLERGIC REACTION!</div>'
    //     } else {
    //         return '<div style="color:green; font-size:60px;">NO REACTION</div>'
    //     }
    //   },
    stimulus: function () {
        let last_trial_feedback = jsPsych.data
            .get()
            .last(1)
            .values()[0].correct_response;
        if (last_trial_feedback == 49) {
            // if last correct_response == 49 (1 key)
            // return '<div style="color:red; font-size:60px;">ALLERGIC REACTION!</div>'
            // return '<img src=stim/social/+.jpg ></img>'
            return feedbackPositive;
        } else if (last_trial_feedback == 48) {
            // if last correct_response == 48 (0 key)
            // return '<div style="color:green; font-size:60px;">NO REACTION</div>'
            // return '<img src=stim/social/-.jpg ></img>'
            return feedbackNegative;
        }
    },

    choices: jsPsych.NO_KEYS,
    trial_duration: feedbackDuration,
    response_ends_trial: false,
    // post_trial_gap: jsPsych.randomization.sampleWithReplacement(isi, 5, [5,1]),
    post_trial_gap: 1000, //ISI
    on_finish: function (data) {
        // data.practice = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press)
        // data.c1 = data.key_press == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(data.correct_response);
    },
};

/* END TRAINING TRIAL FOR PARTICIPANTS */

/* BEGIN EXPERIMENT */

let instructions_6 = {
    type: "html-keyboard-response",
    stimulus: instructions[6],
    choices: [32],
};

//COMPLETION MESSAGE: Completed Classification Phase

let screenRating1 = {
    type: "survey-multi-choice",
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
    choices: jsPsych.NO_KEYS,
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
let screenRating2 = {
    type: "survey-multi-choice",
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
    choices: jsPsych.NO_KEYS,
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
    type: "html-keyboard-response",
    stimulus: dataSaveAnimation,
    choices: "NO_KEYS",
    trial_duration: 5000,
    on_finish: writeCsvRedirect,
};

// call main
$.getScript("exp/main.js");
