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
  <body  style="background-color:white;">  
  
  <div class="loading centeredDiv">
    <h1 class="loading">Loading...</h1>
  </div>
  <div id="consentHolder" class="consent centeredDiv">
  <h3 id="consentPreamble" class="consent" style="color:black;">In order for us to conduct this test online, we need to include the standard consent form below. <br /> <br /> </h3>
  <div id="consentForm" class="consent consent-box"> 
    <h2 id="consentHeading" class="consent">
      CONSENT FOR PARTICIPATION IN A RESERCH PROJECT 200 FR. 1 (2016-2)
      <br>
      YALE UNIVERSITY SCHOOL OF MEDICINE CONNECTICUT MENTAL HEALTH CENTER
    </h2> 

    <h2>
      
    </h2>
    <p id="consentInstructions" class="consent">
      <b>Study Title:</b> Computerized Assessment of Psychosis Risk (CAPR)
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
    let timeline = [];

    /* define welcome message trial */
    let welcome = {
      type: "html-keyboard-response",
      stimulus: '<p style="color:black;">Welcome to the experiment! Press any key to begin.</p>'
    };
    timeline.push(welcome);

    /* define instructions trial */
    let instructions_1 = {
      type: "html-keyboard-response",
      stimulus: '<p style="color:black;">In this experiment, you are asked to imagine that you are an allergist (someone who tries to discover the cause of allergic reactions in people).</p>' +
                '<p style="color:black;">You have been presented with a new patient who suffers from allergic reactions following some meals, but not others.</p> '+
                '<p style="color:black;">You arrange for them to eat a number of different meals, containing one or two foods, and observe whether or not they have an allergic reaction.</p>'+
                '<br>'+
                '<p style="color:black;">Press the space bar to continue.</p>',
      choices: [32], //ascii spacebar
    };
    timeline.push(instructions_1);

    let instructions_2 = {
      type: "html-keyboard-response",
      stimulus: '<p style="color:black;">During the experiment, you will be shown pictures of the foods given to your patient for each meal.</p>'+
                '<p style="color:black;">You will then be shown whether or not they suffered an allergic reaction after eating the meal.</p>' + 
                '<p style="color:black;">When you see each meal, please predict whether or not you believe they will suffer an allergic reaction after eating the meal.</p>'+
                '<br>'+
                '<p style="color:black;">To predict that a particular meal <strong><u>will not</strong></u> cause an allergy please press the <q><strong>0</strong></q> key on the keyboard.</p>'+
                '<p style="color:black;">To predict that a meal <b><u>will cause</b></u> an allergic reaction please press the <q><strong>1</strong></q> key on the keyboard.</p>'+
                '<br>'+
                '<p style="color:black;">Press either of the response keys to continue.</p>',
      choices: [48, 49], //ascii spacebar
    };
    timeline.push(instructions_2);

    let instructions_3 = {
      type: "html-keyboard-response",
      stimulus: '<p style="color:black;">Obviously you will have to guess at first.</p>'+
                '<p style="color:black;">But hopefully, as you see more meals, you will learn which foods tend to make your patient have an allergic reaction.</p>'+
                '<br>'+
                '<p style="color:black;">Food <strong><u>does not</strong></u> cause an allergy &#8594 <q><strong>0</strong></q> key </p>'+
                '<p style="color:black;">Food <strong><u>causes</strong></u> an allergy &#8594 <q><strong>1</strong></q> key</p>'+
                '<br>'+
                '<p style="color:black;">Try to make your prediction <b><u>before</b></u> the meal leaves the screen.</p>'+
                // '<p style="color:black;">Please hold the key down longer if you are more confident you are making the right choice.</p>'+
                // '<p style="color:black;">If you think you are guessing please hold the key briefly. If you are very confident you should press and hold until the meal disappears from the screen.</p>'+
                '<br>'+
                '<p style="color:black;">Press the space bar to begin the practice trials.</p>',
      choices: [32],
    };
    timeline.push(instructions_3);

    /* START TRAINING TRIAL FOR PARTICIPANTS */

    let stim_array = [];
    for (let i = 1; i < 19; i++){
      stim_array.push('stimuli/s' + i + '.jpg');
    }

    let stim_shuffle = jsPsych.randomization.repeat(stim_array, 1); //shuffled array no repeats

    let pract_run = stim_shuffle;

    let stage_one = stim_shuffle;

    let stage_two = stim_shuffle;

    let stage_three = stim_shuffle;

    // let feedback_array = [];
    //   feedback_array.push('stimuli/-.jpg');
    //   feedback_array.push('stimuli/+.jpg');

    // let feedback_stimuli = [
    //   {feedback: feedback_array[0], data: {test_part: 'feedback', correct_response: 48}}, // 0 key
    //   {feedback: feedback_array[1], data: {test_part: 'feedback', correct_response: 49}}, // 1 key
    // ]

    let practice_stimuli = [
      {stimulus: pract_run[15], stimulus2: '', data: {test_part: 'practice', correct_response: 48}}, // 0 key
      {stimulus: pract_run[16], stimulus2: '', data: {test_part: 'practice', correct_response: 48}}, // 0 key
      {stimulus: pract_run[17], stimulus2: '', data: {test_part: 'practice', correct_response: 49}}, // 1 key
    ]

    let learning_stimuli = [
      {stimulus: stage_one[0], stimulus2: '',  data: {test_part: 'learning', reaction: 'allergy', role: 'singlePositive', correct_response: 49}}, // 1 key
      {stimulus: stage_one[1], stimulus2: '', data: {test_part: 'learning', reaction: 'allergy', role: 'singlePositive', correct_response: 49}}, // 1 key
      {stimulus: stage_one[4], stimulus2: '', data: {test_part: 'learning', reaction: 'noReaction', role: 'singleNegative', correct_response: 48}}, // 0 key
      {stimulus: stage_one[5], stimulus2: '', data: {test_part: 'learning', reaction: 'noReaction', role: 'singleNegative',correct_response: 48}}, // 0 key
      {stimulus: stage_one[9], stimulus2: '', data: {test_part: 'learning', reaction: 'noReaction', role: 'singleNegative',correct_response: 48}}, // 0 key
      {stimulus: stage_one[10], stimulus2: '', data: {test_part: 'learning', reaction: 'allergy', role: 'singlePositive', correct_response: 49}}, // 1 key
      {stimulus: stage_one[11], stimulus2: '', data: {test_part: 'learning', reaction: 'noReaction', role: 'singleNegative',correct_response: 48}}, // 0 key
    ]

    let blocking_stimuli = [
      {stimulus: stage_two[0], stimulus2: stage_two[2], data: {test_part: 'blocking', reaction: 'allergy', role: 'blocking', correct_response: 49}}, // 1 key
      {stimulus: stage_two[1], stimulus2: stage_two[3], data: {test_part: 'blocking', reaction: 'allergy', role: 'blocking', correct_response: 49}}, // 1 key
      {stimulus: stage_two[4], stimulus2: stage_two[6], data: {test_part: 'blocking', reaction: 'allergy', role: 'blockingControl', correct_response: 49}}, // 1 key
      {stimulus: stage_two[5], stimulus2: stage_two[7], data: {test_part: 'blocking', reaction: 'allergy', role: 'blockingControl', correct_response: 49}}, // 1 key
      {stimulus: stage_two[8], stimulus2: stage_two[9], data: {test_part: 'blocking', reaction: 'noReaction', role: 'noAllergyControl', correct_response: 48}}, // 0 key
      {stimulus: stage_two[10], stimulus2: '', data: {test_part: 'blocking', reaction: 'allergy', role: 'consistentAllergy', correct_response: 49}}, // 1 key
      {stimulus: stage_two[11], stimulus2: '', data: {test_part: 'blocking', reaction: 'noReaction', role: 'consistentNoAllergy', correct_response: 48}}, // 0 key
    ]

    let testing_stimuli = [
      {stimulus: stage_three[2], stimulus2: '', data: {test_part: 'testing', reaction: 'allergy', role: 'blockingViolation',correct_response: 49}}, // 1 key
      {stimulus: stage_three[3], stimulus2: '', data: {test_part: 'testing', reaction: 'noReaction', role: 'blockingConfirmation',correct_response: 48}}, // 0 key
      {stimulus: stage_three[6], stimulus2: '', data: {test_part: 'testing', reaction: 'allergy', role: 'blockingConfirmationControl',correct_response: 49}}, // 1 key
      {stimulus: stage_three[7], stimulus2: '', data: {test_part: 'testing', reaction: 'noReaction', role: 'blockingViolationControl',correct_response: 48}}, // 0 key
      {stimulus: stage_three[8], stimulus2: '', data: {test_part: 'testing', reaction: 'noReaction', role: 'noAllergyControl',correct_response: 48}}, // 0 key
      {stimulus: stage_three[10], stimulus2: stage_three[9], data: {test_part: 'testing', reaction: 'allergy', role: 'consistentAllergy',correct_response: 49}}, // 1 key
      {stimulus: stage_three[11], stimulus2: '', data: {test_part: 'testing', reaction: 'noReaction', role: 'consistentNoAllergy',correct_response: 48}}, // 0 key
    ]

    // create fixation point
    let fixation = {
      data: {test_part: 'fixation'},
      type: 'html-keyboard-response',
      stimulus: '<div style="color:black; font-size:60px;"></div>',
      choices: jsPsych.NO_KEYS,
      trial_duration: 1000,
    }

    // create  trials
    let stimuli = {
      type: "html-keyboard-response",
      stimulus: function(){
                var html="<img src='"+jsPsych.timelineVariable('stimulus', true)+"'>" +
                "<img src='"+jsPsych.timelineVariable('stimulus2', true)+"'>";
                return html;
      }, 
      
      // jsPsych.timelineVariable('stimulus'),
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
    let feedback = {
      data: {test_part: 'feedback'},
      type: 'html-keyboard-response',
      // stimulus: function() {
      //     let last_trial_accuracy = jsPsych.data.get().last(1).values()[0].accuracy;
      //     if (last_trial_accuracy == 1) {
      //         return '<div style="color:red; font-size:60px;">ALLERGIC REACTION!</div>'
      //     } else {
      //         return '<div style="color:green; font-size:60px;">NO REACTION</div>'
      //     }
      //   },
      stimulus: function() {
        let last_trial_feedback = jsPsych.data.get().last(1).values()[0].correct_response;
        if (last_trial_feedback == 49) { // if last correct_response == 49 (1 key)
          // return '<div style="color:red; font-size:60px;">ALLERGIC REACTION!</div>'
          return '<img src=stimuli/+.jpg ></img>'
        } else if (last_trial_feedback == 48) { // if last correct_response == 48 (0 key)
          // return '<div style="color:green; font-size:60px;">NO REACTION</div>'
          return '<img src=stimuli/-.jpg ></img>'
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

    let practice_procedure = {
      timeline: [fixation, stimuli, feedback],
      timeline_variables: practice_stimuli,
      randomize_order: false,
    }

    timeline.push(practice_procedure);

    /* END TRAINING TRIAL FOR PARTICIPANTS */

    let instructions_4 = {
      type: "html-keyboard-response",
      stimulus: '<p style="color:black;">Let us begin! Press the space bar when you are ready to start the experiment.</p>'+
                '<p style="color:black;">It should last about 20 minutes with breaks in-between.</p>'+
                '<br>'+
                '<p style="color:black;">Good Luck!</p>',
      choices: [32],

    };
    timeline.push(instructions_4);


    let learning_procedure = {
      timeline: [fixation, stimuli, feedback],
      timeline_variables: learning_stimuli,
      randomize_order: true,
      type: 'fixed-repititions',
      repetitions: 10
    }

    timeline.push(learning_procedure);

    let blocking_procedure = {
      timeline: [fixation, stimuli, feedback],
      timeline_variables: blocking_stimuli,
      randomize_order: true,
      type: 'fixed-repititions',
      repetitions: 6
    }

    timeline.push(blocking_procedure);

    let testing_procedure = {
      timeline: [fixation, stimuli, feedback],
      timeline_variables: testing_stimuli,
      randomize_order: true,
      type: 'fixed-repititions',
      repetitions: 6
    }

    timeline.push(testing_procedure);

    

//     /* END PHASE II OF TASK: CLASSIFICATION and ANTICIPATION PHASE */

function saveData(name, data){
  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'index.php'); // 'write_data.php' is the path to the php file described above.
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({filename: name, filedata: data}));
}

//let this_seed = new Date().getTime();
    //Math.seedrandom(this_seed);

    //let randNum = Math.random() * 1000
    //let randNumRounded = Math.floor(randNum+1)
    function getParamFromURL(name)
    {
      name = name.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
      let regexS = "[\?&]"+name+"=([^&#]*)";
      let regex = new RegExp( regexS );
      let results = regex.exec( window.location.href );
      if( results == null )
        return "";
      else
        return results[1];
    }
    let workerID = prompt( 'subjectID' );

    /* start the experiment */
    function startExperiment(){
      jsPsych.init({
        timeline: timeline,
        show_progress_bar: true,
        on_finish: function(){ saveData("food-allergy_" + workerID, jsPsych.data.get().csv()); }
        //on_finish: function(){
          //jsPsych.data.get().filter([{test_part: 'test'},{test_part: 'prediction'},{test_part: 'c2_test'}]).localSave("csv", `test-self-deception-data.csv`);
            //jsPsych.data.displayData(); 
        //}
      });
    }
  </script>

<footer>

<script type="text/javascript" src="//code.jquery.com/jquery-git.js"></script>


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
