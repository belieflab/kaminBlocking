//***********************************//
//   EXPERIMENT CONFIGURATION FILE   //
//***********************************//

// Debug Mode
// Options: true, false
let debug = true; // Default debug mode setting for the experiment

// if you want to ask questions at the end of the task then true
let lastQuestion = false;

// design trials
let learningRepetition;
let blockingRepetition;
let testingRepetition;

// we create this function to communicate with wrap/lib/fn.js getRepetitions()
const initializedRepetitions = () => {
    // set default values (learning 10, blocking and testing 6)
    learningRepetition = 10;
    blockingRepetition = 6; 
    testingRepetition = 6;

    // when debug then made this very quickly (1 repetition only)
    if (debug) {
        learningRepetition = 1;
        blockingRepetition = 1;
        testingRepetition = 1;
    }
}
// set the initial values depending on what the user respond to the WARNING debug
initializedRepetitions()


// Experiment Name
const experimentName = "Kamin Blocking"; // Name displayed in the browser title bar
const experimentAlias = "kamin"; // Unique identifier for the experiment, used in data saving

// Experiment Language
const language = "english"; // Language setting for the experiment

// User Interface Theme
// Options: "light", "dark"
const theme = "light"; // Default theme setting for the user interface

// taskVersion choices: "social_kamin", "kamin", "kamin_gain", "kamin_loss"
// social_kamin involves avatars and focuses on sabotage
// kamin_loss and kamin_gain focus on learning which fractal images gain or lose points
const version = "kamin";

// Add additional global configuration constants here

// Note: Uncomment the desired options. Ensure only one option per setting is active at a time.
const adminEmail = undefined;
const feedbackLink = "https://yalesurvey.ca1.qualtrics.com/jfe/form/SV_0xGKiCrNbAUGwoC?participantId=" + subjectId;