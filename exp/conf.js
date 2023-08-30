  
  //******************************************/
 //   FOOD ALLERGY - KAMIN BLOCKING          /
//******************************************/

/* enable subjectID prompt */
// let workerId = prompt( 'subjectID' );

// let workerId = getParamFromURL( 'workerId' );


const qualtrics = "https://yalesurvey.ca1.qualtrics.com/jfe/form/SV_0U3wW3G3HfY8Ie1?Q_JFE=qdg&workerId=";

// goal 1: alter instructions to be socially salient
const taskVersion="social";
let fileExtension;
let instructions1;
let instructions2;
let instructions3;
let instructions4;
let instructions5;
let feedbackNegative;
let feedbackPositive;
let responseOptions;



switch(taskVersion) {
  case "allergy":
   fileExtension='.jpg';
   instructions1='<h2 style="color:black;">In the first part of the experiment, you are asked to imagine that you are an allergist (someone who tries to discover the cause of allergic reactions in people).</h2>' +
    '<h3 style="color:black;">You have been presented with a new patient who suffers from allergic reactions following some meals, but not others.</h3> '+
    '<h3 style="color:black;">You arrange for them to eat a number of different meals, containing one or two foods, and observe whether or not they have an allergic reaction.</h3>'+
    '<p style="color:black;">Press the spacebar to continue.</p>';
   instructions2='<h2 style="color:black;">During the first part of the experiment, you will be shown pictures of the foods given to your patient for each meal.</h2>'+
    '<h3 style="color:black;">You will then be shown whether or not they suffered an allergic reaction after eating the meal.</h3>' + 
    '<h3 style="color:black;">When you see each meal, you will have three seconds to predict whether or not you believe they will suffer an allergic reaction after eating the meal.</h3>'+
    '<p style="color:black;">Press the spacebar to continue.</p>';
   instructions3='<h2 style="color:black;">To predict that a particular meal <strong><u>will not</strong></u> cause an allergy please press the <q><strong>0</strong></q> key on the keyboard.</h2>'+
   '<h2 style="color:black;">To predict that a meal <b><u>will cause</b></u> an allergic reaction please press the <q><strong>1</strong></q> key on the keyboard.</h2>'+
   '<p style="color:black;">Press either of the response keys to continue.</p>';
   instructions4='<h2 style="color:black;">Obviously you will have to guess at first.</h2>'+
   '<h3 style="color:black;">But hopefully, as you see more meals, you will learn which foods tend to make your patient have an allergic reaction.</h3>'+
   '<br>'+
   '<h2 style="color:black;">Please hold the key down longer if you are more confident you are making the right choice.</h2>'+
   '<h3 style="color:black;">If you think you are guessing please hold the key briefly.</h3>'+
   '<h3 style="color:black;">If you are very confident you should press and hold until the meal disappears from the screen.</h3>'+
   '<p style="color:black;">Press the spacebar to continue.</p>';
   instructions5='<h2 style="color:black;">Try to make your prediction <b><u>before</b></u> the meal leaves the screen.</h2>'+
   '<br>'+
   '<h2 style="color:black;">Food <strong><u>does not</strong></u> cause an allergy &#8594 <q><strong>0</strong></q> key </h2>'+
   '<h2 style="color:black;">Food <strong><u>causes</strong></u> an allergy &#8594 <q><strong>1</strong></q> key</h2>'+
   '<p style="color:black;">Press the spacebar to begin the practice trials.</p>';
   feedbackNegative='<img src=stimuli/allergy/-.jpg ></img>';
   feedbackPositive='<img src=stimuli/allergy/+.jpg ></img>';
   responseOptions='1 Allergy&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp0 No Reaction <br><br> Hold response key to indicate confidence level.';
  //  learning_stimuli=learning_stimuli_standard;
  //  blocking_stimuli=blocking_stimuli_standard;
  //  testing_stimuli=testing_stimuli_standard; 
   break;
  case "social":
    fileExtension='.png';
    instructions1='<h2 style="color:black;">In the first part of this experiment, you are asked to imagine that you are beginning a new job and your boss regularly evaluates you.</h2>' +
    '<h3 style="color:black;">You also have new co-workers, who you have to rely on for help with tasks. Nonetheless, some co-workers will actively wish for you to fail!</h3> '+
    '<h3 style="color:black;">Over the first part of this experiment, you will work with your new co-workers, 1-2 at a time, and observe whether they are helpful or sabotage your work.</h3>'+
    '<p style="color:black;">Press the spacebar to continue.</p>';  
    instructions2='<h2 style="color:black;">During the first part of the experiment, you will be shown pictures of co-workers that you are currently working with.</h2>'+
    '<h3 style="color:black;">You will then be shown whether or not they helped you with your work or sabotaged you.</h3>' + 
    '<h3 style="color:black;">When you see co-workers, you will have three seconds to predict whether or not you believe they will sabotage you.</h3>'+
    '<p style="color:black;">Press the spacebar to continue.</p>';  
    instructions3='<h2 style="color:black;">To predict that a co-worker <strong><u>will not</strong></u> sabotage you, please press the <q><strong>0</strong></q> key on the keyboard.</h2>'+
    '<h2 style="color:black;">To predict that a co-worker <b><u>will sabotage</b></u> you please press the <q><strong>1</strong></q> key on the keyboard.</h2>'+
    '<p style="color:black;">Press either of the response keys to continue.</p>';
    instructions4='<h2 style="color:black;">Obviously you will have to guess at first.</h2>'+
   '<h3 style="color:black;">But hopefully, as you work with more people, you will learn which people tend to sabotage you.</h3>'+
   '<br>'+
   '<h2 style="color:black;">Please hold the key down longer if you are more confident you are making the right choice.</h2>'+
   '<h3 style="color:black;">If you think you are guessing please hold the key briefly.</h3>'+
   '<h3 style="color:black;">If you are very confident you should press and hold until the person disappears from the screen.</h3>'+
   '<p style="color:black;">Press the spacebar to continue.</p>';
   instructions5='<h2 style="color:black;">Try to make your prediction <b><u>before</b></u> the person leaves the screen.</h2>'+
   '<br>'+
   '<h2 style="color:black;">Co-worker <strong><u>does NOT</strong></u> sabotage you (helpful) &#8594 <q><strong>0</strong></q> key </h2>'+
   '<h2 style="color:black;">Co-worker <strong><u>does</strong></u> sabotage you &#8594 <q><strong>1</strong></q> key</h2>'+
   '<p style="color:black;">Press the spacebar to begin the practice trials.</p>';
   feedbackNegative='<img src=stimuli/social/-.jpg ></img>';
   feedbackPositive='<img src=stimuli/social/+.jpg ></img>';
   responseOptions='1 Sabotaged&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp0 Helped <br><br> Hold response key to indicate confidence level.';
  //  learning_stimuli=learning_stimuli_short;
  //  blocking_stimuli=blocking_stimuli_short;
  //  testing_stimuli=testing_stimuli_short;
    break;
  case "nonsocial":
    break;
}


// goal 2: swap food stimuli for avatars




// goal 3: add 2 screens at end of task, each with a question + rating scale