  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
 /// *  make sure you know what you are doing with these buttons and levers; you may break the experiment  * ///
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* START TRAINING TRIAL FOR PARTICIPANTS */

// feedback contrainer
let feedbackGenerator = '<p id="feedbackGenerator" style="color:black;"></p>';

// tracks total taps per trial
let totalConfidence = [0]; // must be 0 to compensate for participant should they miss first trial

// // user selection of allergy or no-allergy
// let selection;

// progress bar container
let progressBar = '<div id="counter" class="w3-container" style="color:black"><div class="w3-light-grey"><div class="w3-grey" id="keyBar" style="height:24px;width:0%;"></div></div><br><div>';
let fillUp = '<p id="fillUp" style="color:black;"></p>';

// set the time remaining notification for participant
let timeRemaining = '<p id="timeRemaining" style="text-align:center; color:black;"></p>';

let stim_array = [];
for (let i = 1; i < 19; i++){
    stim_array.push('stimuli/s' + i + '.jpg');
}

let stim_shuffle = jsPsych.randomization.repeat(stim_array, 1); //shuffled array no repeats

let practice_stimuli = [
    {stimulus: stim_shuffle[15], stimulus2: '', data: {test_part: 'practice', correct_response: 48, correct_response: 48}}, // 0 key
    {stimulus: stim_shuffle[16], stimulus2: '', data: {test_part: 'practice', correct_response: 48, correct_response: 48,}}, // 0 key
    {stimulus: stim_shuffle[17], stimulus2: '', data: {test_part: 'practice', correct_response: 49, incorrect_response: 48}}, // 1 key
]

let learning_stimuli = [
    {stimulus: stim_shuffle[0], stimulus2: '',  data: {test_part: 'learning', reaction: 'allergy', role: 'single-positive', correct_response: 49, incorrect_response: 48}}, // 1 key
    {stimulus: stim_shuffle[1], stimulus2: '', data: {test_part: 'learning', reaction: 'allergy', role: 'single-positive', correct_response: 49, incorrect_response: 48}}, // 1 key
    {stimulus: stim_shuffle[4], stimulus2: '', data: {test_part: 'learning', reaction: 'no-reaction', role: 'single-negative', correct_response: 48, incorrect_response: 49}}, // 0 key
    {stimulus: stim_shuffle[5], stimulus2: '', data: {test_part: 'learning', reaction: 'no-reaction', role: 'single-negative',correct_response: 48, incorrect_response: 49}}, // 0 key
    {stimulus: stim_shuffle[9], stimulus2: '', data: {test_part: 'learning', reaction: 'no-reaction', role: 'single-negative',correct_response: 48, incorrect_response: 49}}, // 0 key
    {stimulus: stim_shuffle[10], stimulus2: '', data: {test_part: 'learning', reaction: 'allergy', role: 'single-positive', correct_response: 49, incorrect_response: 48}}, // 1 key
    {stimulus: stim_shuffle[11], stimulus2: '', data: {test_part: 'learning', reaction: 'no-reaction', role: 'single-negative',correct_response: 48, incorrect_response: 49}}, // 0 key
]

let blocking_stimuli = [
    {stimulus: stim_shuffle[0], stimulus2: stim_shuffle[2], data: {test_part: 'blocking', reaction: 'allergy', role: 'blocking', correct_response: 49, incorrect_response: 48}}, // 1 key
    {stimulus: stim_shuffle[1], stimulus2: stim_shuffle[3], data: {test_part: 'blocking', reaction: 'allergy', role: 'blocking', correct_response: 49, incorrect_response: 48}}, // 1 key
    {stimulus: stim_shuffle[4], stimulus2: stim_shuffle[6], data: {test_part: 'blocking', reaction: 'allergy', role: 'blocking-control', correct_response: 49, incorrect_response: 48}}, // 1 key
    {stimulus: stim_shuffle[5], stimulus2: stim_shuffle[7], data: {test_part: 'blocking', reaction: 'allergy', role: 'blocking-control', correct_response: 49, incorrect_response: 48}}, // 1 key
    {stimulus: stim_shuffle[8], stimulus2: stim_shuffle[9], data: {test_part: 'blocking', reaction: 'noReaction', role: 'no-allergy-control', correct_response: 48, incorrect_response: 49}}, // 0 key
    {stimulus: stim_shuffle[10], stimulus2: '', data: {test_part: 'blocking', reaction: 'allergy', role: 'consistent-allergy', correct_response: 49, incorrect_response: 48}}, // 1 key
    {stimulus: stim_shuffle[11], stimulus2: '', data: {test_part: 'blocking', reaction: 'no-reaction', role: 'consistent-no-allergy', correct_response: 48, incorrect_response: 49}}, // 0 key
]

let testing_stimuli = [
    {stimulus: stim_shuffle[2], stimulus2: '', data: {test_part: 'testing', reaction: 'allergy', role: 'blocking-violation',correct_response: 49, incorrect_response: 48}}, // 1 key
    {stimulus: stim_shuffle[3], stimulus2: '', data: {test_part: 'testing', reaction: 'no-reaction', role: 'blocking-confirmation',correct_response: 48, incorrect_response: 49}}, // 0 key
    {stimulus: stim_shuffle[6], stimulus2: '', data: {test_part: 'testing', reaction: 'allergy', role: 'blocking-confirmation-control',correct_response: 49, incorrect_response: 48}}, // 1 key
    {stimulus: stim_shuffle[7], stimulus2: '', data: {test_part: 'testing', reaction: 'no-reaction', role: 'blocking-violation-control',correct_response: 48, incorrect_response: 49}}, // 0 key
    {stimulus: stim_shuffle[8], stimulus2: '', data: {test_part: 'testing', reaction: 'no-reaction', role: 'no-allergy-control',correct_response: 48, incorrect_response: 49}}, // 0 key
    {stimulus: stim_shuffle[10], stimulus2: stim_shuffle[9], data: {test_part: 'testing', reaction: 'allergy', role: 'consistent-allergy',correct_response: 49, incorrect_response: 48}}, // 1 key
    {stimulus: stim_shuffle[11], stimulus2: '', data: {test_part: 'testing', reaction: 'no-reaction', role: 'consistent-no-allergy',correct_response: 48, incorrect_response: 49}}, // 0 key
]
