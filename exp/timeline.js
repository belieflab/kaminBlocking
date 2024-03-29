// $.getScript("exp/conf.js");
/* create timeline */
let timeline = [];

if (test) {
    let testAlert = prompt(
        "WARNING. This task is currently in 'test' mode. If you meant to complete task with a participant, type 'yes' to switch to production mode."
    );
    if (testAlert.toLowerCase() === "yes") {
        test = false;
    }
}

/* define welcome message trial */
let welcome = {
    type: "html-keyboard-response",
    stimulus:
        '<h1 style="color:black;">Welcome to the experiment!</h1>' +
        "<p>Press any key to begin.</p>",
};

/* define instructions trial */
let instructions_1 = {
    type: "html-keyboard-response",
    stimulus: instructions1,
    choices: [32], //ascii spacebar
};

let instructions_2 = {
    type: "html-keyboard-response",
    stimulus: instructions2,
    choices: [32], //ascii spacebar
};

let instructions_3 = {
    type: "html-keyboard-response",
    stimulus: instructions3,
    choices: [48, 49], //ascii spacebar
};

let instructions_4 = {
    type: "html-keyboard-response",
    stimulus: instructions4,
    choices: [32],
};

let instructions_5 = {
    type: "html-keyboard-response",
    stimulus: instructions5,
    choices: [32],
};

// create fixation point
let fixation = {
    // data: {test_part: 'fixation'},
    type: "html-keyboard-response",
    stimulus: '<div style="color:black; font-size:60px;"></div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 1000,
};

// create  trials
let stimuli = {
    type: "html-keyboard-response",

    stimulus: function () {
        var html;
        var stimulus2 = jsPsych.timelineVariable("stimulus2", true);
        if (taskVersion !== "social_kamin") {
            if (stimulus2 !== null) {
                html =
                    "<div class='image-container'>" +
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
                    "<div class='image-container'>" +
                    "<img class='stimuli-left-social' src='" +
                    jsPsych.timelineVariable("stimulus", true) +
                    "'>" +
                    "<img class='stimuli-right-social' src='" +
                    stimulus2 +
                    "'>" +
                    "</div>";
            } else if (stimulus2 === null && taskVersion === "social_kamin") {
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
    trial_duration: 3000,
    // stimulus_duration: 3000,
    response_ends_trial: false,
    prompt:
        progressBar +
        fillUp +
        feedbackGenerator +
        timeRemaining +
        '<form autocomplete="off" action=""> <input autocomplete="false" name="hidden" id="tapTap" type="text" style="background-color:black; color: transparent; outline:none; border:none; background:none;" onkeypress="">',
    data: jsPsych.timelineVariable("data"),
    on_load: function buttonPress(data) {
        barFill = document.getElementById("fillUp");
        barFill.innerHTML = responseOptions;
        document.getElementById("tapTap").focus(); //gives focus to the text box
        $(document).ready(function () {
            $("#tapTap").keypress(function (event) {
                var keycode = event.which;
                if ((barFill.innerHTML = responseOptions)) {
                    if (keycode == 48) {
                        document
                            .getElementById("counter")
                            .setAttribute(
                                "onkeydown",
                                "return moveConfidence()"
                            ); // event.charCode allows us to set specific keys to use
                        responseKey = 48;
                        // console.log(responseKey);
                    } else if (keycode == 49) {
                        document
                            .getElementById("counter")
                            .setAttribute(
                                "onkeydown",
                                "return moveConfidence()"
                            ); // event.charCode allows us to set specific keys to use
                        responseKey = 49;
                        // console.log(responseKey);
                    } else {
                        // all other keys ignored
                        document
                            .getElementById("counter")
                            .setAttribute("onkeydown", "return false"); // event.charCode allows us to set specific keys to use
                    }
                }
            });
        });
    },
    on_finish: function (data) {
        data.subjectkey = GUID;
        data.src_subject_id = workerId;
        data.site = siteNumber;
        data.interview_date = today;
        data.interview_age = ageAtAssessment;
        data.sex = sexAtBirth;
        data.phenotype = groupStatus;
        data.visit = visit;
        data.handedness = handedness;
        data.response = responseKey;
        data.version = version;
        data.task_version = taskVersion;

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
    trial_duration: 1000,
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
    stimulus:
        '<h2 style="color:black;">Let us begin!</h2>' +
        '<p style="color:black;">Press the spacebar when you are ready to start the experiment.</p>',
    choices: [32],
};

//COMPLETION MESSAGE: Completed Classification Phase

let save_data = {
    type: "html-keyboard-response",
    stimulus: dataSaveAnimation,
    choices: jsPsych.NO_KEYS,
    trial_duration: 5000,
    on_finish: () => {
        saveData(experimentAlias + "_" + subjectId, jsPsych.data.get().csv()); //function with file name and which type of file as the 2 arguments
        document.getElementById("unload").onbeforeunload = ""; //removes popup (are you sure you want to exit) since data is saved now
        // returns cursor functionality
        $(document).ready(function () {
            $("body").addClass("showCursor"); // returns cursor functionality
            closeFullscreen(); // kill fullscreen
        });
    },
};

let end = {
    type: "html-keyboard-response",
    stimulus:
        "<p>Thank you!</p>" +
        "<p>You have successfully completed the experiment and your data has been saved.</p>" +
        "<p>To leave feedback on this task, please click the following link:</p>" +
        "<p><a href=" +
        feedbackLink +
        ">Leave Task Feedback!</a></p>" +
        // "<p>Please wait for the experimenter to continue.</p>"+
        "<p><i>You may now close the expriment window at anytime.</i></p>",
    choices: jsPsych.NO_KEYS,
    // trial_duration: 60000,
};

let screenRating1 = {
    type: "survey-multi-choice",
    questions: [
        {
            prompt: question1,
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
        data.subjectkey = GUID;
        data.src_subject_id = workerId;
        data.site = siteNumber;
        data.interview_date = today;
        data.interview_age = ageAtAssessment;
        data.sex = sexAtBirth;
        data.phenotype = groupStatus;
        data.visit = visit;
        data.handedness = handedness;
        data.response = responseKey;
        data.version = version;
        data.task_version = taskVersion;

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
            prompt: question2,
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
        data.subjectkey = GUID;
        data.src_subject_id = workerId;
        data.site = siteNumber;
        data.interview_date = today;
        data.interview_age = ageAtAssessment;
        data.sex = sexAtBirth;
        data.phenotype = groupStatus;
        data.visit = visit;
        data.handedness = handedness;
        data.response = responseKey;
        data.version = version;
        data.task_version = taskVersion;
        var ratingSabotage = jsPsych.data.get().select("responses").values[0];
        data.rating_sabotage = ratingSabotage;
        // var currentData = jsPsych.currentTrial().data;
        console.log(ratingSabotage);
    },

    // trial_duration: 60000,
};
// call main
$.getScript("exp/main.js");
