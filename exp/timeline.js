// $.getScript("exp/conf.js");
/* create timeline */
let timeline = [];


/* define welcome message trial */
let welcome = {
    type: "html-keyboard-response",
    stimulus: '<h1 style="color:black;">Welcome to the experiment!</h1>'+
    '<p>Press any key to begin.</p>',
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
    type: 'html-keyboard-response',
    stimulus: '<div style="color:black; font-size:60px;"></div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 1000,
}

// create  trials
let stimuli = {
    type: "html-keyboard-response",
     
    
    stimulus: function(){
      var html;
      var stimulus2 = jsPsych.timelineVariable('stimulus2', true);

      if (stimulus2 !== null) {
          html = "<div class='image-container'>"+
                 "<img class='stimuli-left' src='" + jsPsych.timelineVariable('stimulus', true) + "'>" +
                 "<img class='stimuli-right' src='" + stimulus2 + "'>"+
                 "</div>";
      } else {
          html = "<img class='stimuli' src='" + jsPsych.timelineVariable('stimulus', true) + "'>";
      }
      return html;
  },





    // jsPsych.timelineVariable('stimulus'),
    choices: [jsPsych.NO_KEYS], // key_press handled instead by responseKey
    trial_duration: 3000,
    // stimulus_duration: 3000,
    response_ends_trial: false,
    prompt: progressBar + fillUp + feedbackGenerator + timeRemaining + '<form autocomplete="off" action=""> <input autocomplete="false" name="hidden" id="tapTap" type="text" style="background-color:black; color: transparent; outline:none; border:none; background:none;" onkeypress="">',
    data: jsPsych.timelineVariable('data'),
    on_load: function buttonPress(data){
        barFill = document.getElementById("fillUp");
        barFill.innerHTML = responseOptions;
        document.getElementById("tapTap").focus(); //gives focus to the text box
        $(document).ready(function(){
            $("#tapTap").keypress(function(event){
                var keycode = event.which;
                if (barFill.innerHTML = responseOptions) { 
                  if (keycode == 48) {
                    document.getElementById("counter").setAttribute("onkeydown", "return moveConfidence()"); // event.charCode allows us to set specific keys to use
                    responseKey = 48;
                    // console.log(responseKey);
                  } else if (keycode == 49) {
                    document.getElementById("counter").setAttribute("onkeydown", "return moveConfidence()"); // event.charCode allows us to set specific keys to use
                    responseKey = 49;
                    // console.log(responseKey);
                  } else { // all other keys ignored
                    document.getElementById("counter").setAttribute("onkeydown", "return false"); // event.charCode allows us to set specific keys to use 
                  }
              }
            });
        });
    },
    on_finish: function(data){

    data.subjectkey = GUID;
    data.src_subject_id = workerId;
    data.site = siteNumber;
    data.interview_date = today;
    data.interview_age = ageAtAssessment;
    data.sex = sexAtBirth;
    data.phenotype = groupStatus;
    data.handedness = handedness;
    data.response = responseKey;
    data.version = version;

    if (responseKey == data.correct_response) {
        data.accuracy = 1;
        data.confidence = totalConfidence;
        responseKey = '';
    } else if (responseKey == data.incorrect_response) {
        data.accuracy = 0;
        data.confidence = totalConfidence;
        responseKey = '';
    } else {
        data.accuracy = '';
        data.confidence = '';
        responseKey = '';
    }
    data.index = trialIterator;
    trialIterator ++;
    }
};


// create feedback trials
let feedback = {
    // data: {test_part: 'feedback'},
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
        // return '<img src=stimuli/social/+.jpg ></img>'
        return feedbackPositive
    } else if (last_trial_feedback == 48) { // if last correct_response == 48 (0 key)
        // return '<div style="color:green; font-size:60px;">NO REACTION</div>'
        // return '<img src=stimuli/social/-.jpg ></img>'
        return feedbackNegative
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



/* END TRAINING TRIAL FOR PARTICIPANTS */



/* BEGIN EXPERIMENT */

let instructions_6 = {
    type: "html-keyboard-response",
    stimulus: '<h2 style="color:black;">Let us begin!</h2>'+
            '<p style="color:black;">Press the spacebar when you are ready to start the experiment.</p>',
    choices: [32],

};

//COMPLETION MESSAGE: Completed Classification Phase

let save_data = {
    type: "html-keyboard-response",
    stimulus: "<p>Data saving...</p>"+
    '<div class="sk-cube-grid">'+
  '<div class="sk-cube sk-cube1"></div>'+
  '<div class="sk-cube sk-cube2"></div>'+
  '<div class="sk-cube sk-cube3"></div>'+
  '<div class="sk-cube sk-cube4"></div>'+
  '<div class="sk-cube sk-cube5"></div>'+
  '<div class="sk-cube sk-cube6"></div>'+
  '<div class="sk-cube sk-cube7"></div>'+
  '<div class="sk-cube sk-cube8"></div>'+
  '<div class="sk-cube sk-cube9"></div>'+
  '</div>'+
    "<p>Do not close this window until the text dissapears.</p>",
  
    choices: jsPsych.NO_KEYS,
    trial_duration: 5000,
    on_finish: function(){
      saveData("kamin_" + workerId, jsPsych.data.get().csv());
      document.getElementById("unload").onbeforeunload='';
      $(document).ready(function(){
      $("body").addClass("showCursor"); // returns cursor functionality
      closeFullscreen(); // kill fullscreen
  });
    }
  };


  
let end = {
  type: "html-keyboard-response",
  stimulus:   "<p>Thank you!</p>"+
  "<p>You have successfully completed the experiment and your data has been saved.</p>"+
  "<p>To leave feedback on this task, please click the following link:</p>"+
  "<p><a href="+feedbackLink+">Leave Task Feedback!</a></p>"+
  // "<p>Please wait for the experimenter to continue.</p>"+
  "<p><i>You may now close the expriment window at anytime.</i></p>",
  choices: jsPsych.NO_KEYS,
  // trial_duration: 60000,
};




let screenRating1;
switch(taskVersion) {
  case "allergy":
  screenRating1 = {
    type: "survey-multi-choice",
    questions: [
      {
        prompt: "Did you strongly consider the patient-doctor relationship when making choices?", 
        name: 'rating_random', 
        options: ['Definitely Not', 'Probably Not', 'Unsure', 'Probably Yes', 'Definitely Yes'], 
        required: true,
        horizontal: true
      }
    ],
    choices: jsPsych.NO_KEYS,
    on_finish: function(){
        document.getElementById("unload").onbeforeunload='';
        $(document).ready(function(){
        $("body").addClass("showCursor"); // returns cursor functionality
    });
      }
  };
  break;
  case "social":
    screenRating1 = {
      type: "survey-multi-choice",
      questions: [
        {
          prompt: "Were you concerned about your relationships with co-workers throughout the task?", 
          name: 'rating_random', 
          options: ['Definitely Not', 'Probably Not', 'Unsure', 'Probably Yes', 'Definitely Yes'], 
          required: true,
          horizontal: true
        }
      ],
      choices: jsPsych.NO_KEYS,
      on_finish: function(){
          document.getElementById("unload").onbeforeunload='';
          $(document).ready(function(){
          $("body").addClass("showCursor"); // returns cursor functionality
      });
        }
    };
    break;
  case "nonsocial":
    screenRating1 = {
      type: "survey-multi-choice",
      questions: [
        {
          prompt: "Do you feel that these shapes had emotions, personality, or a will of their own?", 
          name: 'rating_random', 
          options: ['Definitely Not', 'Probably Not', 'Unsure', 'Probably Yes', 'Definitely Yes'], 
          required: true,
          horizontal: true
        }
      ],
      choices: jsPsych.NO_KEYS,
      on_finish: function(){
          document.getElementById("unload").onbeforeunload='';
          $(document).ready(function(){
          $("body").addClass("showCursor"); // returns cursor functionality
      });
        }
    };
    break;
}


let screenRating2;
switch(taskVersion) {
  case "allergy":
  screenRating2 = {
    type: "survey-multi-choice",
    questions: [
      {
        prompt: "Did any of your co-workers deliberately sabotage you?", 
        name: 'rating_sabotage', 
        options: ['Definitely Not', 'Probably Not', 'Unsure', 'Probably Yes', 'Definitely Yes'], 
        required: true,
        horizontal: true
      }
    ],
    choices: jsPsych.NO_KEYS,
    on_finish: function(){
        document.getElementById("unload").onbeforeunload='';
        $(document).ready(function(){
        $("body").addClass("showCursor"); // returns cursor functionality
    });
    }
  };
  break;
  case "social":
    screenRating2 = {
      type: "survey-multi-choice",
      questions: [
        {
          prompt: "Did any of your co-workers deliberately sabotage you?", 
          name: 'rating_sabotage', 
          options: ['Definitely Not', 'Probably Not', 'Unsure', 'Probably Yes', 'Definitely Yes'], 
          required: true,
          horizontal: true
        }
      ],
      choices: jsPsych.NO_KEYS,
      on_finish: function(){
          document.getElementById("unload").onbeforeunload='';
          $(document).ready(function(){
          $("body").addClass("showCursor"); // returns cursor functionality
      });
      }
    };
    break;
  case "nonsocial":
    screenRating2 = {
      type: "survey-multi-choice",
      questions: [
        {
          prompt: "Did any of your co-workers deliberately sabotage you?", 
          name: 'rating_sabotage', 
          options: ['Definitely Not', 'Probably Not', 'Unsure', 'Probably Yes', 'Definitely Yes'], 
          required: true,
          horizontal: true
        }
      ],
      choices: jsPsych.NO_KEYS,
      on_finish: function(){
          document.getElementById("unload").onbeforeunload='';
          $(document).ready(function(){
          $("body").addClass("showCursor"); // returns cursor functionality
      });
      }
    };
    break;
}

// screenRating1 = {
//   type: "survey-multi-choice",
//   questions: [
//     {
//       prompt: "Were you concerned about your relationships with co-workers throughout the task?", 
//       name: 'rating_random', 
//       options: ['Definitely Not', 'Probably Not', 'Unsure', 'Probably Yes', 'Definitely Yes'], 
//       required: true,
//       horizontal: true
//     }
//   ],
//   choices: jsPsych.NO_KEYS,
//   on_finish: function(){
//       document.getElementById("unload").onbeforeunload='';
//       $(document).ready(function(){
//       $("body").addClass("showCursor"); // returns cursor functionality
//   });
//     }
// }
// let screenRating2 = {
//   type: "survey-multi-choice",
//   questions: [
//     {
//       prompt: "Did any of your co-workers deliberately sabotage you?", 
//       name: 'rating_sabotage', 
//       options: ['Definitely Not', 'Probably Not', 'Unsure', 'Probably Yes', 'Definitely Yes'], 
//       required: true,
//       horizontal: true
//     }
//   ],
//   choices: jsPsych.NO_KEYS,
//   on_finish: function(){
//       document.getElementById("unload").onbeforeunload='';
//       $(document).ready(function(){
//       $("body").addClass("showCursor"); // returns cursor functionality
//   });
//   }
// }



let blocking_procedure;
switch(taskVersion) {
    case "allergy": 
        blocking_procedure = {
            timeline: [fixation, stimuli, feedback],
            timeline_variables: blocking_stimuli_standard,
            randomize_order: true,
            type: 'fixed-repititions',
            repetitions: 6
        };
    break;
    case "social":
        blocking_procedure = {
            timeline: [fixation, stimuli, feedback],
            timeline_variables: blocking_stimuli_short,
            randomize_order: true,
            type: 'fixed-repititions',
            repetitions: 6
        };
    break;
    case "nonsocial":
        blocking_procedure = {
            timeline: [fixation, stimuli, feedback],
            timeline_variables: blocking_stimuli_short,
            randomize_order: true,
            type: 'fixed-repititions',
            repetitions: 6
        };
    break;
}



// call main
$.getScript("exp/main.js");


