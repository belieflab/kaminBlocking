///////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// *  make sure you know what you are doing with these buttons and levers; you may break the experiment  * ///
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* START TRAINING TRIAL FOR PARTICIPANTS */

// version number
const iteration = "corrected"; // fixed testing stimuli pairing per PRC ec3c20c

// feedback contrainer
let feedbackGenerator = '<p id="feedbackGenerator" style="color:black;"></p>';

// tracks total taps per trial
let totalConfidence = [0]; // must be 0 to compensate for participant should they miss first trial

// // user selection of allergy or no-allergy
let responseKey;

// trial index
let trialIterator = 1;

// progress bar container
let progressBar =
    '<div id="counter" class="w3-container" style="color:black"><div class="w3-light-grey"><div class="w3-grey" id="keyBar" style="height:24px;width:0%;"></div></div><br><div>';
let fillUp = '<p id="fillUp" style="color:black;"></p>';

// set the time remaining notification for participant
let timeRemaining =
    '<p id="timeRemaining" style="text-align:center; color:black;"></p>';

let stim_array = [];
for (let i = 1; i < 19; i++) {
    stim_array.push("stim/" + version + "/s" + i + fileExtension);
}

let stim_shuffle = jsPsych.randomization.repeat(stim_array, 1); //shuffled array no repeats

// cues within stim_shuffle: standard version (until 11), short (until 13). SCdO 07/may/2024
//                 0   1   2   3   4   5   6   7    8   9   10  11  12  13
// stim_shuffle = [A1, A2, B1, B2, C1, C2, D1, D2,  E,  F,  I,  J,  K,  L] 

let practice_stimuli = [
    {
        stimulus: stim_shuffle[15],
        stimulus2: null,
        data: {
            test_part: "practice",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[15].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: stim_shuffle[16],
        stimulus2: null,
        data: {
            test_part: "practice",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[16].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: stim_shuffle[17],
        stimulus2: null,
        data: {
            test_part: "practice",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[17].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
];

let learning_stimuli_standard = [
    {
        stimulus: stim_shuffle[0],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "allergy",
            condition: "single-positive",
            trial_type: "A1+",
            correct_response: 49, // allergy (1)
            incorrect_response: 48, // no-allergy (0)
            stim_left: stim_shuffle[0].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[1],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "allergy",
            condition: "single-positive",
            trial_type: "A2+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[1].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[4],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "no-reaction",
            condition: "single-negative",
            trial_type: "C1-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[4].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: stim_shuffle[5],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "no-reaction",
            condition: "single-negative",
            trial_type: "C2-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[5].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: stim_shuffle[9],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "no-reaction",
            condition: "single-negative",
            trial_type: "F-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[9].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: stim_shuffle[10],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "allergy",
            condition: "single-positive",
            trial_type: "I+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[10].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[11],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "no-reaction",
            condition: "single-negative",
            trial_type: "J-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[11].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
];

let learning_stimuli_short = [
    {
        stimulus: stim_shuffle[0],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "allergy",
            condition: "single-positive",
            trial_type: "A1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[0].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[1],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "allergy",
            condition: "single-positive",
            trial_type: "A2+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[1].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[4],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "no-reaction",
            condition: "single-negative",
            trial_type: "C1-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[4].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: stim_shuffle[5],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "no-reaction",
            condition: "single-negative",
            trial_type: "C2-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[5].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
];

let blocking_stimuli_standard = [
    {
        stimulus: stim_shuffle[0],
        stimulus2: stim_shuffle[2],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking",
            trial_type: "A1B1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[0].slice(8),
            stim_right: stim_shuffle[2].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[1],
        stimulus2: stim_shuffle[3],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking",
            trial_type: "A2B2+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[1].slice(8),
            stim_right: stim_shuffle[3].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[4],
        stimulus2: stim_shuffle[6],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking-control",
            trial_type: "C1D1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[4].slice(8),
            stim_right: stim_shuffle[6].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[5],
        stimulus2: stim_shuffle[7],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking-control",
            trial_type: "C2D2+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[5].slice(8),
            stim_right: stim_shuffle[7].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[8],
        stimulus2: stim_shuffle[9],
        data: {
            test_part: "blocking",
            reaction: "no-reaction",
            condition: "no-allergy-control",
            trial_type: "EF-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[8].slice(8),
            stim_right: stim_shuffle[9].slice(8),
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: stim_shuffle[10],
        stimulus2: null,
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "consistent-allergy",
            trial_type: "I+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[10].slice(8),
            stim_right: "",
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[11],
        stimulus2: null,
        data: {
            test_part: "blocking",
            reaction: "no-reaction",
            condition: "consistent-no-allergy",
            trial_type: "J-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[11].slice(8),
            stim_right: "",
        },
    }, // 0 key
];

let blocking_stimuli_short = [
    {
        stimulus: stim_shuffle[0],
        stimulus2: stim_shuffle[2],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking",
            trial_type: "A1B1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[0].slice(8),
            stim_right: stim_shuffle[2].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[1],
        stimulus2: stim_shuffle[3],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking",
            trial_type: "A2B2+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[1].slice(8),
            stim_right: stim_shuffle[3].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[4],
        stimulus2: stim_shuffle[6],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking-control",
            trial_type: "C1D1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[4].slice(8),
            stim_right: stim_shuffle[6].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[5],
        stimulus2: stim_shuffle[7],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking-control",
            trial_type: "C2D2+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[5].slice(8),
            stim_right: stim_shuffle[7].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[8],
        stimulus2: stim_shuffle[9],
        data: {
            test_part: "blocking",
            reaction: "no-reaction",
            condition: "no-allergy-control",
            trial_type: "EF-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[8].slice(8),
            stim_right: stim_shuffle[9].slice(8),
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: stim_shuffle[10],
        stimulus2: stim_shuffle[12],
        data: {
            test_part: "blocking",
            reaction: "no-reaction",
            condition: "no-allergy-control",
            trial_type: "IK-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[10].slice(8),
            stim_right: stim_shuffle[12].slice(8),
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: stim_shuffle[11],
        stimulus2: stim_shuffle[13],
        data: {
            test_part: "blocking",
            reaction: "no-reaction",
            condition: "no-allergy-control",
            trial_type: "JL-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[11].slice(8),
            stim_right: stim_shuffle[13].slice(8),
            version: iteration,
        },
    }, // 0 key
];

// cues within stim_shuffle: standard version (until 11), short (until 13). SCdO 07/may/2024
//                 0   1   2   3   4   5   6   7    8   9   10  11  12  13
// stim_shuffle = [A1, A2, B1, B2, C1, C2, D1, D2,  E,  F,  I,  J,  K,  L]

let testing_stimuli_standard = [
    {
        stimulus: stim_shuffle[2],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "allergy",
            condition: "blocking-violation",
            trial_type: "B1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[2].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[3],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "no-reaction",
            condition: "blocking-confirmation",
            trial_type: "B2-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[3].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: stim_shuffle[6],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "allergy",
            condition: "blocking-confirmation-control",
            trial_type: "D1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[6].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[7],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "no-reaction",
            condition: "blocking-violation-control",
            trial_type: "D2-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[7].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: stim_shuffle[8],
        stimulus2: stim_shuffle[9],
        data: {
            test_part: "testing",
            reaction: "no-reaction",
            condition: "no-allergy-control",
            trial_type: "EF-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[8].slice(8),
            stim_right: stim_shuffle[9].slice(8),
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: stim_shuffle[10],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "allergy",
            condition: "consistent-allergy",
            trial_type: "I+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[10].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[11],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "no-reaction",
            condition: "consistent-no-allergy",
            trial_type: "J-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[11].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
];

// unclear what to do with the c2d2 trial in testing, when it is d2 ('blocking-violation-control')
// in Corlett in Fletcher 2012, this is a "-"
// in original CAPR task above, it is also a "-"
// in Ongchoco, it appears to be "+" in the code and is not listed as in article table!
let testing_stimuli_short = [
    {
        stimulus: stim_shuffle[2],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "allergy",
            condition: "blocking-violation",
            trial_type: "B1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[2].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[3],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "no-reaction",
            condition: "blocking-confirmation",
            trial_type: "B2-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[3].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: stim_shuffle[6],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "allergy",
            condition: "blocking-confirmation-control",
            trial_type: "D1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: stim_shuffle[6].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: stim_shuffle[7],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "no-reaction",
            condition: "blocking-violation-control",
            trial_type: "D2-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[7].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: stim_shuffle[13],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "no-reaction",
            condition: "no-allergy-control",
            trial_type: "L-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: stim_shuffle[11].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
];
