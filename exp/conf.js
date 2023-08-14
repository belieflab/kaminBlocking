  
  //******************************************/
 //   FOOD ALLERGY - KAMIN BLOCKING          /
//******************************************/

/* enable subjectID prompt */
// let workerId = prompt( 'subjectID' );

// let workerId = getParamFromURL( 'workerId' );


const qualtrics = "https://yalesurvey.ca1.qualtrics.com/jfe/form/SV_0U3wW3G3HfY8Ie1?Q_JFE=qdg&workerId=";

// goal 1: alter instructions to be socially salient
const taskVersion="allergy";
let instructions1;

switch(taskVersion) {
  case "social":
    instructions1='<h2 style="color:black;">You are being harassed by your co-workers, who is it???</h2>' +
    '<p style="color:black;">Press the spacebar to continue.</p>';    
    // '<h2 style="color:black;">You are being harassed by your co-workers, who is it???.</p>';
    break;
  case "allergy":
   instructions1='<h2 style="color:black;">In the first part of the experiment, you are asked to imagine that you are an allergist (someone who tries to discover the cause of allergic reactions in people).</h2>' +
    // '<h3 style="color:black;">You have been presented with a new patient who suffers from allergic reactions following some meals, but not others.</h3> '+
    // '<h3 style="color:black;">You arrange for them to eat a number of different meals, containing one or two foods, and observe whether or not they have an allergic reaction.</h3>'+
    '<p style="color:black;">Press the spacebar to continue.</p>';
    break;
  case "nonsocial":
    break;
}


// goal 2: swap food stimuli for avatars



// goal 3: add 2 screens at end of task, each with a question + rating scale