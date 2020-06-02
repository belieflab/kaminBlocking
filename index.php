<?php
$post_data = json_decode(file_get_contents('php://input'), true); 
// the directory "data" must be writable by the server
$name = "data/".$post_data['filename'].".csv"; 
$data = $post_data['filedata'];
// write the file to disk
file_put_contents($name, $data);
?>


<!DOCTYPE html>
<html>
  <head>
    <title>Self-Deception Task</title>
    <script src="jsPsych/jspsych.js"></script>
    <script src="jsPsych/plugins/jspsych-html-keyboard-response.js"></script>
    <script src="jsPsych/plugins/jspsych-image-keyboard-response.js"></script>
    <link href="jsPsych/css/jspsych.css" rel="stylesheet" type="text/css"></link>
    <link rel="stylesheet" type="text/css" href="css/style.css">
  </head>
  <body  style="background-color:black;">  
  
  <div class="loading centeredDiv">
    <h1 class="loading">Loading...</h1>
  </div>
  <div id="consentHolder" class="consent centeredDiv">
  <h3 id="consentPreamble" class="consent" style="color:white;">In order for us to conduct this test online, we need to include the standard consent form below. <br /> <br /> </h3>
  <div id="consentForm" class="consent consent-box"> 
    <h2 id="consentHeading" class="consent">
      CONSENT FOR PARTICIPATION IN A RESERCH PROJECT 200 FR. 1 (2016-2)
      <br>
      YALE UNIVERSITY SCHOOL OF MEDICINE CONNECTICUT MENTAL HEALTH CENTER
    </h2> 

    <h2>
      
    </h2>
    <p id="consentInstructions" class="consent">
      <b>Study Title:</b> Perception and Decisions
      <br><br>
      <b>Principal Investigator:</b> Philip R. Corlett, PhD
      <br><br>
      <b>Funding Source:</b> department funds
      <br><br>
      <u><b>Invitation to Participate and Description of Project</b></u>
      <br>
      You are invited to participate in a research study that concerns psychological processes related to beliefs, perceptions, decisions, and personality traits. Due to the nature of psychology experiments, we cannot explain the precise purpose of the experiment until after the session is over. Afterwards, the experimenter will be happy to answer any questions you might have about the purpose of the study.
      <br><br>
      <u><b>Description of Procedures</b></u>
      <br>
      If you agree to participate in this study, this Human Intelligence Task (HIT) will require you to (1) play a computer game using the computer mouse or keys on your keyboard and (2) answer simple questions about your demographics, health (including mental health), beliefs, and personality through an interactive web survey. You will never be asked for personally identifiable information such as your name, address, or date of birth. 
      <br>
      The experiment is designed to take approximately 1 hour. You will have up to six hours to complete the experiment and submit codes for credit. 
      <br><br>
      <u><b>Risks and Inconveniences</b></u>
      <br>
      There are little to no risks associated with this study. Some individuals may experience mild boredom. 
      <br><br>
      <u><b>Economic Considerations</b></u>
      <br>
      You will receive the reward specified on the Mechanical-Turk HIT for completing both the game and the questionnaire. Payment for completion of the HIT is $6.00 with up to a $2.00 bonus based on task performance and a further $40 bonus to individuals who score in the top 1%. Upon finishing the game and submitting the questionnaire, you will receive code numbers. Please record these two code numbers and submit them for payment. 
      <br><br>
      <u><b>Confidentiality</b></u>
      <br>
      We will never ask for your name, birth date, email or any other identifying piece of information. Your data will be pooled with those of others, and your responses will be completely anonymous. We will keep this data indefinitely for possible use in scientific publications and presentations. 
      <br>
      The researcher will not know your name, and no identifying information will be connected to your survey answers in any way. The survey is therefore anonymous. However, your account is associated with an mTurk number that the researcher has to be able to see in order to pay you, and in some cases these numbers are associated with public profiles which could, in theory, be searched. For this reason, though the researcher will not be looking at anyone’s public profiles, the fact of your participation in the research (as opposed to your actual survey responses) is technically considered “confidential” rather than truly anonymous.
      <br><br>
      <u><b>Voluntary Participation</b></u>
      <br>
      Your participation in this study is completely voluntary. You are free to decline to participate or to end participation at any time by simply closing your browser window. However, please note that you must submit both the computer game and questionnaire in order to receive payment. You may decline answering any question by selecting the designated alternative response (e.g., “I do not wish to answer”). Declining questions will not affect payment.
      <br><br>
      <u><b>Questions or Concerns</b></u>
      <br>
      If you have any questions or concerns regarding the experiment, you may contact us here at the lab by emailing BLAMLabRequester@gmail.com If you have general questions about your rights as a research participant, you may contact the Yale University Human Investigation Committee at 203-785-4688 or human.subjects@yale.edu (HSC# 2000026290).

    </p>
  </div>


</div>
<div id="attritionHolder" class="attrition centeredDiv"> 
  <p id="attritionInstructions" class="attrition"></p>
  <input required type="text" id="attritionAns" class="attrition" size="60" style="width:inherit; height:17px; font-size:15px; margin: 0 auto;" />
</div>
<div id="errorMessageHolder" class="error centeredDiv">
  <p id="mobileBrowserErrorMessage">You cannot access this test from a mobile browser. Please use a desktop computer to complete the task.</p>
  <p id="workerIDErrorMessage">You are ineligible for this task, since your worker ID has been recorded as participating in this task already. 
    Please return the HIT.</p>
</div>



  <div id="nextButtonHolder" class="buttonHolder">
  <button id="nextButton" onclick="startExperiment()">CONSENT/NEXT</button>
</div>
</body>
  
  <script>
    /* create timeline */
    var timeline = [];

    /* define welcome message trial */
    var welcome = {
      type: "html-keyboard-response",
      stimulus: '<p style="color:white;">Welcome to the experiment! Press any key to begin.</p>'
    };
    timeline.push(welcome);

    /* define instructions trial */
    var instructions_1 = {
      type: "html-keyboard-response",
      stimulus: '<p style="color:white;">In this experiment, you are asked to imagine that you are an allergist (someone who tries to discover the cause of allergic reactions in people).</p>' +
                '<p style="color:white;">You have been presented with a new patient who suffers from allergic reactions following some meals, but not others.</p> '+
                '<p style="color:white;">You arrange for them to eat a number of different meals, containing one or two foods, and observe whether or not they have an allergic reaction.</p>'+
                '<br>'+
                '<p style="color:white;">Press the space bar to continue.</p>',
      choices: [32], //ascii spacebar
    };
    timeline.push(instructions_1);

    var instructions_2 = {
      type: "html-keyboard-response",
      stimulus: '<p style="color:white;">During the experiment, you will be shown pictures of the foods given to your patient for each meal.</p>'+
                '<p style="color:white;">You will then be shown whether or not they suffered an allergic reaction after eating the meal.</p>' + 
                '<p style="color:white;">When you see each meal, please predict whether or not you believe they will suffer an allergic reaction after eating the meal.</p>'+
                '<br>'+
                '<p style="color:white;">To predict that a particular meal <strong><u>will not</strong></u> cause an allergy please press the <q><strong>0</strong></q> key on the keyboard.</p>'+
                '<p style="color:white;">To predict that a meal <b><u>will cause</b></u> an allergic reaction please press the <q><strong>1</strong></q> key on the keyboard.</p>'+
                '<br>'+
                '<p style="color:white;">Press either of the response keys to continue.</p>',
      choices: [48, 49], //ascii spacebar
    };
    timeline.push(instructions_2);

    var instructions_3 = {
      type: "html-keyboard-response",
      stimulus: '<p style="color:white;">Obviously you will have to guess at first.</p>'+
                '<p style="color:white;">But hopefully, as you see more meals, you will learn which foods tend to make your patient have an allergic reaction.</p>'+
                '<br>'+
                '<p style="color:white;">Food <strong><u>does not</strong></u> cause an allergy &#8594 <q><strong>0</strong></q> key </p>'+
                '<p style="color:white;">Food <strong><u>causes</strong></u> an allergy &#8594 <q><strong>1</strong></q> key</p>'+
                '<br>'+
                '<p style="color:white;">Try to make your prediction <b><u>before</b></u> the meal leaves the screen.</p>'+
                // '<p style="color:white;">Please hold the key down longer if you are more confident you are making the right choice.</p>'+
                // '<p style="color:white;">If you think you are guessing please hold the key briefly. If you are very confident you should press and hold until the meal disappears from the screen.</p>'+
                '<br>'+
                '<p style="color:white;">Press the space bar to begin the practice trials.</p>',
      choices: [32],
    };
    timeline.push(instructions_3);

    /* START TRAINING TRIAL FOR PARTICIPANTS */

    var practice_stim_array = [];
    // for (var i = 0; i < 3; i++){
    //   train_stimuli_array.push('stim/~practice/' + i + '.png');
    // }
    practice_stim_array.push('stim/~practice/lemon.png');
    practice_stim_array.push('stim/~practice/strawberry.png');
    practice_stim_array.push('stim/~practice/tangerine.png');



    var practice_stimuli = [
    {stimulus: practice_stim_array[0], data: {test_part: 'practice', correct_response: 48}}, // 0 key
    {stimulus: practice_stim_array[1], data: {test_part: 'practice', correct_response: 48}}, // 0 key
    {stimulus: practice_stim_array[2], data: {test_part: 'practice', correct_response: 49}}, // 1 key
    ]

    // create fixation point
    var fixation = {
      data: {test_part: 'fixation'},
      type: 'html-keyboard-response',
      stimulus: '<div style="color:white; font-size:60px;"></div>',
      choices: jsPsych.NO_KEYS,
      trial_duration: 1000,
    }

    // create practice trials
    var practice = {
      type: "image-keyboard-response",
      stimulus: jsPsych.timelineVariable('stimulus'), //train_stimuli_array, //jsPsych.timelineVariable('stimulus'),
      choices: [48, 49], // [0 key , 1 key]
      trial_duration: 3000,
      response_ends_trial: true,
      data: jsPsych.timelineVariable('data'),
      on_finish: function(data){
        // data.practice = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press);
        // data.practice = data.key_press == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(data.correct_response);
        if (data.key_press == data.correct_response) {
          data.accuracy = 1
        } else {
          data.accuracy = 0
        }
      }
    };

    // inter-stimulus interval
    let isi = [1000, 5000];

    // create feedback trials
    var feedback = {
      data: {test_part: 'feedback'},
      type: 'html-keyboard-response',
      // stimulus: function() {
      //     var last_trial_accuracy = jsPsych.data.get().last(1).values()[0].accuracy;
      //     if (last_trial_accuracy == 1) {
      //         return '<div style="color:red; font-size:60px;">ALLERGIC REACTION!</div>'
      //     } else {
      //         return '<div style="color:green; font-size:60px;">NO REACTION</div>'
      //     }
      //   },
      stimulus: function() {
        var last_trial_feedback = jsPsych.data.get().last(1).values()[0].correct_response;
        if (last_trial_feedback == 49) { // if last correct_response == 49 (1 key)
          return '<div style="color:red; font-size:60px;">ALLERGIC REACTION!</div>'
        } else if (last_trial_feedback == 48) { // if last correct_response == 48 (0 key)
          return '<div style="color:green; font-size:60px;">NO REACTION</div>'
        }
      },
      choices: jsPsych.NO_KEYS,
      trial_duration: 1000,
      response_ends_trial: false,
      // post_trial_gap: jsPsych.randomization.sampleWithReplacement(isi, 5, [5,1]),
      post_trial_gap: 1000, //ISI
      on_finish: function(data){
        // data.practice = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press)
        // data.c1 = data.key_press == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(data.correct_response);
        
      }
    };

    var practice_procedure = {
      timeline: [fixation, practice, feedback],
      timeline_variables: practice_stimuli,
      randomize_order: false,
    }

    timeline.push(practice_procedure);

    /* END TRAINING TRIAL FOR PARTICIPANTS */

    var instructions_4 = {
      type: "html-keyboard-response",
      stimulus: '<p style="color:white;">Let us begin! Press the space bar when you are ready to start the experiment.</p>'+
                '<p style="color:white;">It should last about 20 minutes with breaks in-between.</p>'+
                '<br>'+
                '<p style="color:white;">Good Luck!</p>',
      choices: [32],

    };
    timeline.push(instructions_4);

    // Import all stimuli for the LEARNING section
    var learning_stimuli_array = [];
    // for (var i = 0; i < 100; i++){
      test_stimuli_array.push("stim/avocado.png");
      test_stimuli_array.push("stim/banana.png");
      test_stimuli_array.push("stim/broccoli.png");
      test_stimuli_array.push("stim/carrot.png");
      test_stimuli_array.push("stim/cherries.png");
      test_stimuli_array.push("stim/coconut.png");
      test_stimuli_array.push("stim/cooked-rice.png");
      test_stimuli_array.push("stim/cut-of-meat.png");
      test_stimuli_array.push("stim/eggplant.png");
      test_stimuli_array.push("stim/glass-of-milk.png");
      test_stimuli_array.push("stim/grapes.png");
      test_stimuli_array.push("stim/hot-pepper.png");
      test_stimuli_array.push("stim/leafy-green.png");
      test_stimuli_array.push("stim/pear.png");
      test_stimuli_array.push("stim/pineapple.png");
      test_stimuli_array.push("stim/poultry-leg.png");
      test_stimuli_array.push("stim/red-apple.png");
      test_stimuli_array.push("stim/watermelon.png");
    // }

    var learning_stimuli = [
    {stimulus: practice_stim_array[0], data: {test_part: 'practice', correct_response: 48}}, // 0 key
    {stimulus: practice_stim_array[1], data: {test_part: 'practice', correct_response: 48}}, // 0 key
    {stimulus: practice_stim_array[2], data: {test_part: 'practice', correct_response: 49}}, // 1 key
    ]


        // create practice trials
    var learning = {
      type: "image-keyboard-response",
      stimulus: jsPsych.timelineVariable('stimulus'), //train_stimuli_array, //jsPsych.timelineVariable('stimulus'),
      choices: [48, 49], // [0 key , 1 key]
      trial_duration: 3000,
      response_ends_trial: true,
      data: jsPsych.timelineVariable('data'),
      on_finish: function(data){
        // data.practice = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press);
        // data.practice = data.key_press == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(data.correct_response);
        if (data.key_press == data.correct_response) {
          data.accuracy = 1
        } else {
          data.accuracy = 0
        }
      }
    };

    // }

    /* START OF PHASE I - TRAINING */

    // Import stimuli for phase I - block 1     
    var stimuli_block1 = [
      {stimulus: test_stimuli_array[0], data: {test_part: 'test', correct_response: '.'}},
      {stimulus: test_response_array[0], data: {test_part: 'test', correct_response: '.'}},      
      {stimulus: test_stimuli_array[1], data: {test_part: 'test', correct_response: ','}},
      {stimulus: test_response_array[0], data: {test_part: 'test', correct_response: '.'}}, 
      {stimulus: test_stimuli_array[2], data: {test_part: 'test', correct_response: '.'}},
      {stimulus: test_stimuli_array[3], data: {test_part: 'test', correct_response: ','}},
      {stimulus: test_stimuli_array[4], data: {test_part: 'test', correct_response: '.'}},
      {stimulus: test_stimuli_array[5], data: {test_part: 'test', correct_response: ','}},
      {stimulus: test_stimuli_array[6], data: {test_part: 'test', correct_response: '.'}},
      {stimulus: test_stimuli_array[7], data: {test_part: 'test', correct_response: ','}},
      {stimulus: test_stimuli_array[8], data: {test_part: 'test', correct_response: '.'}},
      {stimulus: test_stimuli_array[9], data: {test_part: 'test', correct_response: ','}},
      {stimulus: test_stimuli_array[10], data: {test_part: 'test', correct_response: '.'}},
      {stimulus: test_stimuli_array[11], data: {test_part: 'test', correct_response: ','}},
      {stimulus: test_stimuli_array[12], data: {test_part: 'test', correct_response: '.'}},
      {stimulus: test_stimuli_array[13], data: {test_part: 'test', correct_response: ','}},
      {stimulus: test_stimuli_array[14], data: {test_part: 'test', correct_response: '.'}},
      {stimulus: test_stimuli_array[15], data: {test_part: 'test', correct_response: ','}},
      {stimulus: test_stimuli_array[16], data: {test_part: 'test', correct_response: '.'}},
      {stimulus: test_stimuli_array[17], data: {test_part: 'test', correct_response: ','}},
      // {stimulus: test_stimuli_array[18], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[19], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[20], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[21], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[22], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[23], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[24], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[25], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[26], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[27], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[28], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[29], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[30], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[31], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[32], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[33], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[34], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[35], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[36], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[37], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[38], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[39], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[40], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[41], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[42], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[43], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[44], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[45], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[46], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[47], data: {test_part: 'train', correct_response: ','}},
      // {stimulus: test_stimuli_array[48], data: {test_part: 'train', correct_response: '.'}},
      // {stimulus: test_stimuli_array[49], data: {test_part: 'train', correct_response: ','}}, 
    ]

    //var shuffled_stimuli = jsPsych.randomization.shuffle(all_test_stimuli);

    var test = {
      type: "image-keyboard-response",
      stimulus: jsPsych.timelineVariable('stimulus'),
      choices: [',', '.'],
      data: jsPsych.timelineVariable('data'),
      on_finish: function(data){
        data.practice = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press)
        //data.correct = data.key_press == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(data.correct_response);
    }
  }

    var test_procedure_block1 = {
      timeline: [fixation, test],
      timeline_variables: stimuli_block1,
      randomize_order: false
    }

    timeline.push(test_procedure_block1);

    /* END OF PHASE I - BLOCK 1 */

//     // BREAK: Block 1 complete, start Block 2
//     var instructions_5 = {
//       type: "html-keyboard-response",
//       stimulus: '<p style="color:white;">Good job, block 1 complete! Please take a moment to rest.</p> ' +
//           '<p style="color:white;">When you are ready to continue with block 2 of 4, press the space bar.</p> ',
//       choices: [32],
//       post_trial_gap: 2000
//     };
//     timeline.push(instructions_5);


//       /* START OF PHASE I - BLOCK 2 */

//     // Import stimuli for phase I - block 2     
//     var stimuli_block2 = [
//       {stimulus: test_stimuli_array[50], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[51], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[52], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[53], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[54], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[55], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[56], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[57], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[58], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[59], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[60], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[61], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[62], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[63], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[64], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[65], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[66], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[67], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[68], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[69], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[70], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[71], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[72], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[73], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[74], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[75], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[76], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[77], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[78], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[79], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[80], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[81], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[82], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[83], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[84], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[85], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[86], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[87], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[88], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[89], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[90], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[91], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[92], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[93], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[94], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[95], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[96], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[97], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[98], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[99], data: {test_part: 'test', correct_response: ','}}, 
//     ] 

//     //var shuffled_stimuli = jsPsych.randomization.shuffle(all_test_stimuli);

//     var test_procedure_block2 = {
//       timeline: [fixation, test],
//       timeline_variables: stimuli_block2,
//       randomize_order: true
//     }

//     timeline.push(test_procedure_block2);


//     /* END OF PHASE I - BLOCK 2 */

//     // BREAK: Block 2 complete, start Block 3
//     var instructions_6 = {
//       type: "html-keyboard-response",
//       stimulus: '<p style="color:white;">Half way there! Please take a moment to rest.</p> ' +
//           '<p style="color:white;">When you are ready to continue with block 3 of 4, press the space bar.</p> ',
//       choices: [32],
//       post_trial_gap: 2000
//     };
//     timeline.push(instructions_6);

//     /* START OF PHASE I - BLOCK 3 */

//     // Import stimuli for phase I - block 3     
//     var stimuli_block3 = [
//       {stimulus: test_stimuli_array[100], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[101], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[102], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[103], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[104], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[105], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[106], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[107], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[108], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[109], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[110], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[111], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[112], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[113], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[114], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[115], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[116], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[117], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[118], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[119], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[120], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[121], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[122], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[123], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[124], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[125], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[126], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[127], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[128], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[129], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[130], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[131], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[132], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[133], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[134], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[135], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[136], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[137], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[138], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[139], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[140], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[141], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[142], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[143], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[144], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[145], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[146], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[147], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[148], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[149], data: {test_part: 'test', correct_response: ','}},
//      ]

//     //var shuffled_stimuli = jsPsych.randomization.shuffle(all_test_stimuli);

//     var test_procedure_block3 = {
//       timeline: [fixation, test],
//       timeline_variables: stimuli_block3,
//       randomize_order: true
//     }

//     timeline.push(test_procedure_block3);


//     /* END OF PHASE I - BLOCK 3 */

//     // BREAK: Block 3 complete, start Block 4
//     var instructions_7 = {
//       type: "html-keyboard-response",
//       stimulus: '<p style="color:white;">One more block to go! Please take a moment to rest.</p> ' +
//           '<p style="color:white;">When you are ready to continue with block 4 of 4, press the space bar.</p> ',
//       choices: [32],
//       post_trial_gap: 2000
//     };
//     timeline.push(instructions_7);

//         /* START OF PHASE I - BLOCK 4 */

//     // Import stimuli for phase I - block 4     
//     var stimuli_block4 = [
//       {stimulus: test_stimuli_array[150], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[151], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[152], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[153], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[154], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[155], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[156], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[157], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[158], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[159], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[160], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[161], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[162], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[163], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[164], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[165], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[166], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[167], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[168], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[169], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[170], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[171], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[172], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[173], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[174], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[175], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[176], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[177], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[178], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[179], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[180], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[181], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[182], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[183], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[184], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[185], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[186], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[187], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[188], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[189], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[190], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[191], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[192], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[193], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[194], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[195], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[196], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[197], data: {test_part: 'test', correct_response: ','}},
//       {stimulus: test_stimuli_array[198], data: {test_part: 'test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[199], data: {test_part: 'test', correct_response: ','}}, 
//     ]

//     //var shuffled_stimuli = jsPsych.randomization.shuffle(all_test_stimuli);

//     var test_procedure_block4 = {
//       timeline: [fixation, test],
//       timeline_variables: stimuli_block4,
//       randomize_order: true
//     }

//     timeline.push(test_procedure_block4);


//     /* END OF PHASE I - BLOCK 4 */ 

// /*   var debrief_block = {
//       type: "html-keyboard-response",
//       stimulus: function(){

//         var trials = jsPsych.data.get().filter({test_part: 'test'});
//         var correct_trials = trials.filter({correct: true});
//         var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
//         var rt = Math.round(correct_trials.select('rt').mean());

//         return "<p style='color:white;'> You responded correctly on "+accuracy+"% of the trials. </p>"+
//         "<p style='color:white;'>Your average response time was "+rt+"ms.</p>"+
//         "<p style='color:white;'>Press any key to complete the experiment. Thank you!</p>";
//       }
//     }; 

//      timeline.push(debrief_block); */

//     // COMPLETION MESSAGE: Completed Classification Phase
//     var instructions_8 = {
//       type: "html-keyboard-response",
//       stimulus: '<p style="color:white;">Phase I of the experiment is complete.</p> ' +
//           '<p style="color:white;">Press the space bar to proceed to Phase II of the experiment.</p> ',
//       choices: [32],
//       post_trial_gap: 2000
//     };
//     timeline.push(instructions_8);


//     /* END PHASE I OF TASK: CLASSIFICATION PHASE */


//     /* START PHASE II OF TASK: CLASSIFICATION and ANTICIPATION PHASE */

//     var instructions_9 = {
//       type: "html-keyboard-response",
//       stimulus: '<p style="color:white;">Now we are interested in how well you can predict patterns in the series of figures. You will be asked to predict whether the next figure in the series is more male-like or female-like. '+
//         'When you see the <q>Next Figure</q> prompt, press the corresponding response keys to indicate your prediction: </p>'+
//         '<p style="color:white;"> Male &#8594 <q>,</q> (comma)</p>'+
//         '<p style="color:white;"> Female &#8594 <q>.</q> (period)</p>'+
//         '<p style="color:white;">The actual figure will then appear on the screen. After you see the figure, please guess the assigned gender with response keys. </p>'+
//         '<p style="color:white;">As before, you will receive 2 cents for correctly classifying each figure.</p>'+
//         '<p style="color:white;">Press either response keys to continue.</p>',
//       choices: [',', '.'],
//     };
//     timeline.push(instructions_9);

//     var instructions_10 = {
//       type: "html-keyboard-response",
//       stimulus: '<p style="color:white;">PREDICTION BONUS</p> ' +
//           '<p style="color:white;">Your prediction accuracy is the total number of correct predictions you make over the 200 trials.</p> ' +
//           '<p style="color:white;">In addition to the 2 cents per correct figure classification, you have the chance to receive a bonus of 40 dollars IF your accuracy is above average relative to previous participants.</p>' +
//           '<p style="color:white;">If your accuracy is below average relative to previous participants, then you will not receive the 40 dollar bonus.</p>'+
//           '<p style="color:white;">Press the space bar to continue.</p>',
//       choices: [32],
//     };
//     timeline.push(instructions_10);

//     var instructions_11 = {
//       type: "html-keyboard-response",
//       stimulus: '<p style="color:white;">Here are some examples.</p> ' +
//           '<p style="color:white;">For each, predict whether the next figure looks more male-like or female-like. Then, when the figure appears, guess whether it looks more male-like or female-like and indicate your choice.</p> ' +
//           '<p style="color:white;">Press the space bar to continue.</p>',
//       choices: [32],
//       post_trial_gap: 2000
//     };
//     timeline.push(instructions_11);

//     /* START TRAINING TRIAL FOR PARTICIPANTS */

// /*     var train_stimuli_array = [];
//     for (var i = 0; i < 3; i++){
//       train_stimuli_array.push("Stimuli/Hangul_E" + i + ".bmp");
//     } */

//     var c2_train_stimuli = [
//     {stimulus: train_stimuli_array[0], data: {test_part: 'c2_train', correct_response: ','}},//{stimulus: train_stimuli_array[0]}, //{stimulus: train_stimuli_array[0], data: {test_part: 'test', correct_response: ','}},
//     {stimulus: train_stimuli_array[1], data: {test_part: 'c2_train', correct_response: ','}},  //{stimulus: train_stimuli_array[1]}, //{stimulus: train_stimuli_array[1], data: {test_part: 'test', correct_response: ','}},
//     {stimulus: train_stimuli_array[2], data: {test_part: 'c2_train', correct_response: '.'}},  //{stimulus: train_stimuli_array[2]},  //{stimulus: train_stimuli_array[2], data: {test_part: 'test', correct_response: '.'}},
//     ]

//     var prediction ={
//         type: "html-keyboard-response",
//         stimulus: '<p style="color:white;"> Next Figure: Male or Female? </p>',
//         choices: [',','.'],
//         data: {
//             test_part: 'prediction_train',
//             //correct_predicted_response: ',',
//         },
//         on_finish: function(data){
//           data.A = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press)
//         //data.correct = data.key_press == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(data.pred_response);
//       }
//     }

// /*     var fixation = {
//       type: 'html-keyboard-response',
//       stimulus: '<div style="color:white; font-size:60px;">+</div>',
//       choices: jsPsych.NO_KEYS,
//       trial_duration: 1000,
//       data: {test_part: 'fixation'}
//     } */

//     var c2_train = {
//       type: "image-keyboard-response",
//       stimulus: jsPsych.timelineVariable('stimulus'), //train_stimuli_array, //jsPsych.timelineVariable('stimulus'),
//       choices: [',', '.'],
//       data: jsPsych.timelineVariable('data'),
//       on_finish: function(data){
//         data.C2 = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press)
//       }
//     }

//     var c2_train_procedure = {
//       timeline: [prediction, fixation, c2_train],
//       timeline_variables: c2_train_stimuli,
//       randomize_order: true
//     }

//     timeline.push(c2_train_procedure);

//     var instructions_12 = {
//       type: "html-keyboard-response",
//       stimulus: '<p style="color:white;">Let us begin! Press the space bar when you are ready to start block 1 of 4.</p> ',
//       choices: [32],
//       post_trial_gap: 2000
//     };
//     timeline.push(instructions_12);

//     // Import all stimuli for the task
// /*     var test_stimuli_array = [];
//     for (var i = 0; i < 100; i++){
//       test_stimuli_array.push("Stimuli/Hangul_F" + i + ".bmp");
//       test_stimuli_array.push("Stimuli/Hangul_M" + i + ".bmp");
//     } */

//     /* START OF PHASE I - BLOCK 1 */

//     // Import stimuli for phase I - block 1     
//     var stimuli_c2block1 = [
//       {stimulus: test_stimuli_array[0], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[1], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[2], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[3], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[4], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[5], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[6], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[7], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[8], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[9], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[10], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[11], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[12], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[13], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[14], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[15], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[16], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[17], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[18], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[19], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[20], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[21], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[22], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[23], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[24], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[25], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[26], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[27], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[28], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[29], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[30], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[31], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[32], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[33], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[34], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[35], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[36], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[37], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[38], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[39], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[40], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[41], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[42], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[43], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[44], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[45], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[46], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[47], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[48], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[49], data: {test_part: 'c2_test', correct_response: ','}}, 
//     ]

//     //var shuffled_stimuli = jsPsych.randomization.shuffle(all_test_stimuli);

//     var prediction_c2 ={
//         type: "html-keyboard-response",
//         stimulus: '<p style="color:white;"> Next Figure: Male or Female? </p>',
//         choices: [',','.'],
//         data: {
//             test_part: 'prediction',
//             //correct_predicted_response: ',',
//         },
//         on_finish: function(data){
//           data.A = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press)
//         //data.correct = data.key_press == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(data.pred_response);
//       }
//     }

//     var c2test = {
//       type: "image-keyboard-response",
//       stimulus: jsPsych.timelineVariable('stimulus'),
//       choices: [',', '.'],
//       data: jsPsych.timelineVariable('data'),
//       on_finish: function(data){
//         data.C2 = jsPsych.pluginAPI.convertKeyCodeToKeyCharacter(data.key_press)
//         //data.correct = data.key_press == jsPsych.pluginAPI.convertKeyCharacterToKeyCode(data.correct_response);
//     }
//   }

//     var test_procedure_c2block1 = {
//       timeline: [prediction_c2, fixation, c2test],
//       timeline_variables: stimuli_c2block1,
//       randomize_order: true
//     }

//     timeline.push(test_procedure_c2block1);

//     /* END OF PHASE I - BLOCK 1 */

//     // BREAK: Block 1 complete, start Block 2
//     var instructions_13 = {
//       type: "html-keyboard-response",
//       stimulus: '<p style="color:white;">Good job, block 1 complete! Please take a moment to rest.</p> ' +
//           '<p style="color:white;">When you are ready to continue with block 2 of 4, press the space bar.</p> ',
//       choices: [32],
//       post_trial_gap: 2000
//     };
//     timeline.push(instructions_13);


//       /* START OF PHASE I - BLOCK 2 */

//     // Import stimuli for phase I - block 2     
//     var stimuli_c2block2 = [
//       {stimulus: test_stimuli_array[50], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[51], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[52], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[53], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[54], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[55], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[56], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[57], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[58], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[59], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[60], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[61], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[62], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[63], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[64], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[65], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[66], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[67], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[68], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[69], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[70], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[71], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[72], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[73], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[74], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[75], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[76], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[77], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[78], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[79], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[80], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[81], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[82], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[83], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[84], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[85], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[86], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[87], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[88], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[89], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[90], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[91], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[92], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[93], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[94], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[95], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[96], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[97], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[98], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[99], data: {test_part: 'c2_test', correct_response: ','}}, 
//     ] 

//     //var shuffled_stimuli = jsPsych.randomization.shuffle(all_test_stimuli);

//     var test_procedure_c2block2 = {
//       timeline: [prediction_c2, fixation, c2test],
//       timeline_variables: stimuli_c2block2,
//       randomize_order: true
//     }

//     timeline.push(test_procedure_c2block2);


//     /* END OF PHASE I - BLOCK 2 */

//     // BREAK: Block 2 complete, start Block 3
//     var instructions_14 = {
//       type: "html-keyboard-response",
//       stimulus: '<p style="color:white;">Half way there! Please take a moment to rest.</p> ' +
//           '<p style="color:white;">When you are ready to continue with block 3 of 4, press the space bar.</p> ',
//       choices: [32],
//       post_trial_gap: 2000
//     };
//     timeline.push(instructions_14);

//     /* START OF PHASE I - BLOCK 3 */

//     // Import stimuli for phase I - block 3     
//     var stimuli_c2block3 = [
//       {stimulus: test_stimuli_array[100], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[101], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[102], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[103], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[104], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[105], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[106], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[107], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[108], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[109], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[110], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[111], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[112], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[113], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[114], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[115], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[116], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[117], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[118], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[119], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[120], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[121], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[122], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[123], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[124], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[125], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[126], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[127], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[128], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[129], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[130], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[131], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[132], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[133], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[134], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[135], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[136], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[137], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[138], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[139], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[140], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[141], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[142], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[143], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[144], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[145], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[146], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[147], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[148], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[149], data: {test_part: 'c2_test', correct_response: ','}}, 
//     ]

//     //var shuffled_stimuli = jsPsych.randomization.shuffle(all_test_stimuli);

//     var test_procedure_c2block3 = {
//       timeline: [prediction_c2, fixation, c2test],
//       timeline_variables: stimuli_c2block3,
//       randomize_order: true
//     }

//     timeline.push(test_procedure_c2block3);


//     /* END OF PHASE I - BLOCK 3 */

//     // BREAK: Block 3 complete, start Block 4
//     var instructions_15 = {
//       type: "html-keyboard-response",
//       stimulus: '<p style="color:white;">One more block to go! Please take a moment to rest.</p> ' +
//           '<p style="color:white;">When you are ready to continue with block 4 of 4, press the space bar.</p> ',
//       choices: [32],
//       post_trial_gap: 2000
//     };
//     timeline.push(instructions_15);

//         /* START OF PHASE I - BLOCK 4 */

//     // Import stimuli for phase I - block 4     
//     var stimuli_c2block4 = [
//       {stimulus: test_stimuli_array[150], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[151], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[152], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[153], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[154], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[155], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[156], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[157], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[158], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[159], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[160], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[161], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[162], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[163], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[164], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[165], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[166], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[167], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[168], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[169], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[170], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[171], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[172], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[173], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[174], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[175], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[176], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[177], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[178], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[179], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[180], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[181], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[182], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[183], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[184], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[185], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[186], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[187], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[188], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[189], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[190], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[191], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[192], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[193], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[194], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[195], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[196], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[197], data: {test_part: 'c2_test', correct_response: ','}},
//       {stimulus: test_stimuli_array[198], data: {test_part: 'c2_test', correct_response: '.'}},
//       {stimulus: test_stimuli_array[199], data: {test_part: 'c2_test', correct_response: ','}}, 
//     ]

//     //var shuffled_stimuli = jsPsych.randomization.shuffle(all_test_stimuli);

//     var test_procedure_c2block4 = {
//       timeline: [prediction_c2, fixation, c2test],
//       timeline_variables: stimuli_c2block4,
//       randomize_order: true
//     }

//     timeline.push(test_procedure_c2block4);


//     /* END OF PHASE I - BLOCK 4 */ 

// /*   var debrief_block = {
//       type: "html-keyboard-response",
//       stimulus: function(){

//         var trials = jsPsych.data.get().filter({test_part: 'test'});
//         var correct_trials = trials.filter({correct: true});
//         var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
//         var rt = Math.round(correct_trials.select('rt').mean());

//         return "<p style='color:white;'> You responded correctly on "+accuracy+"% of the trials. </p>"+
//         "<p style='color:white;'>Your average response time was "+rt+"ms.</p>"+
//         "<p style='color:white;'>Press any key to complete the experiment. Thank you!</p>";
//       }
//     }; 

//      timeline.push(debrief_block); */

//     // COMPLETION MESSAGE: Completed Classification Phase
//     var link = "https://survey.az1.qualtrics.com/SE/?SID=SV_9uARDX1aXEXq1pP&Q_JFE=0&workerId="
//     var instructions_16 = {
//       type: "html-keyboard-response",
//       stimulus: '<p style="color:white;">You have now completed the task! Saving data...PLEASE DO NOT CLOSE THIS BROWSER until you complete the second part.</p> ' +
//           '<p style="color:white;">BEFORE THE LINK DISAPPEARS please move on to the second part of the task at this link to obtain your completion code:</p> ' +
//           "<a href=" + link + ' target="_blank">' + link + "</a>",
//       choices: jsPsych.NO_KEYS,
//       trial_duration: 40000
//     };
//     timeline.push(instructions_16);



//     /* END PHASE II OF TASK: CLASSIFICATION and ANTICIPATION PHASE */

// function saveData(name, data){
//   var xhr = new XMLHttpRequest();
//   xhr.open('POST', 'test-self-deception.php'); // 'write_data.php' is the path to the php file described above.
//   xhr.setRequestHeader('Content-Type', 'application/json');
//   xhr.send(JSON.stringify({filename: name, filedata: data}));
// }

//var this_seed = new Date().getTime();
    //Math.seedrandom(this_seed);

    //var randNum = Math.random() * 1000
    //var randNumRounded = Math.floor(randNum+1)
    function getParamFromURL(name)
    {
      name = name.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
      var regexS = "[\?&]"+name+"=([^&#]*)";
      var regex = new RegExp( regexS );
      var results = regex.exec( window.location.href );
      if( results == null )
        return "";
      else
        return results[1];
    }
    var workerID = getParamFromURL( 'workerId' );

    /* start the experiment */
    function startExperiment(){
      jsPsych.init({
        timeline: timeline,
        show_progress_bar: true,
        on_finish: function(){ saveData("full-self-deception_" + workerID, jsPsych.data.get().csv()); }
        //on_finish: function(){
          //jsPsych.data.get().filter([{test_part: 'test'},{test_part: 'prediction'},{test_part: 'c2_test'}]).localSave("csv", `test-self-deception-data.csv`);
            //jsPsych.data.displayData(); 
        //}
      });
    }
  </script>

<footer>

<!-- <script type="text/javascript" src="https://perceptionexperiments.net/SDU/Libraries/Timeout.js"></script> -->
<!-- <script type="text/javascript" src="https://perceptionexperiments.net/SDU/Libraries/lodash.js"></script> -->
<!-- <script type="text/javascript" src="https://perceptionexperiments.net/SDU/Libraries/seedrandom.js"></script> -->
<script type="text/javascript" src="//code.jquery.com/jquery-git.js"></script>
<!-- <script type="text/javascript" src="https://perceptionexperiments.net/SDU/Libraries/jquery.csv.js"></script> -->

<script>
// show page when loaded 
window.onload = function() {
  $(".loading").css({display: "none"});
  $(".consent").css({display: "block"});
  $(".buttonHolder").css({display: "block"});
};
</script>
</footer>
  </html>
