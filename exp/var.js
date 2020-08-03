  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
 /// *  make sure you know what you are doing with these buttons and levers; you may break the experiment  * ///
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* START TRAINING TRIAL FOR PARTICIPANTS */

let stim_array = [];
for (let i = 1; i < 19; i++){
    stim_array.push('stimuli/s' + i + '.jpg');
}

let stim_shuffle = jsPsych.randomization.repeat(stim_array, 1); //shuffled array no repeats

let practice_stimuli = [
    {stimulus: stim_shuffle[15], stimulus2: '', data: {test_part: 'practice', correct_response: 48}}, // 0 key
    {stimulus: stim_shuffle[16], stimulus2: '', data: {test_part: 'practice', correct_response: 48}}, // 0 key
    {stimulus: stim_shuffle[17], stimulus2: '', data: {test_part: 'practice', correct_response: 49}}, // 1 key
]

let learning_stimuli = [
    {stimulus: stim_shuffle[0], stimulus2: '',  data: {test_part: 'learning', reaction: 'allergy', role: 'singlePositive', correct_response: 49}}, // 1 key
    {stimulus: stim_shuffle[1], stimulus2: '', data: {test_part: 'learning', reaction: 'allergy', role: 'singlePositive', correct_response: 49}}, // 1 key
    {stimulus: stim_shuffle[4], stimulus2: '', data: {test_part: 'learning', reaction: 'noReaction', role: 'singleNegative', correct_response: 48}}, // 0 key
    {stimulus: stim_shuffle[5], stimulus2: '', data: {test_part: 'learning', reaction: 'noReaction', role: 'singleNegative',correct_response: 48}}, // 0 key
    {stimulus: stim_shuffle[9], stimulus2: '', data: {test_part: 'learning', reaction: 'noReaction', role: 'singleNegative',correct_response: 48}}, // 0 key
    {stimulus: stim_shuffle[10], stimulus2: '', data: {test_part: 'learning', reaction: 'allergy', role: 'singlePositive', correct_response: 49}}, // 1 key
    {stimulus: stim_shuffle[11], stimulus2: '', data: {test_part: 'learning', reaction: 'noReaction', role: 'singleNegative',correct_response: 48}}, // 0 key
]

let blocking_stimuli = [
    {stimulus: stim_shuffle[0], stimulus2: stim_shuffle[2], data: {test_part: 'blocking', reaction: 'allergy', role: 'blocking', correct_response: 49}}, // 1 key
    {stimulus: stim_shuffle[1], stimulus2: stim_shuffle[3], data: {test_part: 'blocking', reaction: 'allergy', role: 'blocking', correct_response: 49}}, // 1 key
    {stimulus: stim_shuffle[4], stimulus2: stim_shuffle[6], data: {test_part: 'blocking', reaction: 'allergy', role: 'blockingControl', correct_response: 49}}, // 1 key
    {stimulus: stim_shuffle[5], stimulus2: stim_shuffle[7], data: {test_part: 'blocking', reaction: 'allergy', role: 'blockingControl', correct_response: 49}}, // 1 key
    {stimulus: stim_shuffle[8], stimulus2: stim_shuffle[9], data: {test_part: 'blocking', reaction: 'noReaction', role: 'noAllergyControl', correct_response: 48}}, // 0 key
    {stimulus: stim_shuffle[10], stimulus2: '', data: {test_part: 'blocking', reaction: 'allergy', role: 'consistentAllergy', correct_response: 49}}, // 1 key
    {stimulus: stim_shuffle[11], stimulus2: '', data: {test_part: 'blocking', reaction: 'noReaction', role: 'consistentNoAllergy', correct_response: 48}}, // 0 key
]

let testing_stimuli = [
    {stimulus: stim_shuffle[2], stimulus2: '', data: {test_part: 'testing', reaction: 'allergy', role: 'blockingViolation',correct_response: 49}}, // 1 key
    {stimulus: stim_shuffle[3], stimulus2: '', data: {test_part: 'testing', reaction: 'noReaction', role: 'blockingConfirmation',correct_response: 48}}, // 0 key
    {stimulus: stim_shuffle[6], stimulus2: '', data: {test_part: 'testing', reaction: 'allergy', role: 'blockingConfirmationControl',correct_response: 49}}, // 1 key
    {stimulus: stim_shuffle[7], stimulus2: '', data: {test_part: 'testing', reaction: 'noReaction', role: 'blockingViolationControl',correct_response: 48}}, // 0 key
    {stimulus: stim_shuffle[8], stimulus2: '', data: {test_part: 'testing', reaction: 'noReaction', role: 'noAllergyControl',correct_response: 48}}, // 0 key
    {stimulus: stim_shuffle[10], stimulus2: stim_shuffle[9], data: {test_part: 'testing', reaction: 'allergy', role: 'consistentAllergy',correct_response: 49}}, // 1 key
    {stimulus: stim_shuffle[11], stimulus2: '', data: {test_part: 'testing', reaction: 'noReaction', role: 'consistentNoAllergy',correct_response: 48}}, // 0 key
]
