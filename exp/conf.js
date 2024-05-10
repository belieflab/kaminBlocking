//***********************************//
//   EXPERIMENT CONFIGURATION FILE   //
//***********************************//

// Debug Mode
// Options: true, false
let debug = true; // Default debug mode setting for the experiment

// if you want to ask questions at the end of the task then true
let lastQuestion = false;

// we create this object to communicate with wrap/lib/fn.js getRepetitions()
const repetitions = {
    production: { learning: 10, blocking: 6, testing: 6 },
    debug: { learning: 1, blocking: 1, testing: 1 },
};

// durations of trial components:
const fixationDuration = 1000;
const stimuliDuration = 3000;
const feedbackDuration = 1000;

// Experiment Name
const experimentName = "Kamin Blocking"; // Name displayed in the browser title bar
const experimentAlias = "kamin"; // Unique identifier for the experiment, used in data saving

// Experiment Language
const language = "english"; // Language setting for the experiment

// User Interface Theme
// Options: "light", "dark", "white"
const theme = "white"; // Default theme setting for the user interface

// taskVersion choices: "social_kamin", "kamin", "kamin_gain", "kamin_loss"
// social_kamin involves avatars and focuses on sabotage
// kamin_loss and kamin_gain focus on learning which fractal images gain or lose points
const version = "kamin";

// Add additional global configuration constants here

// Note: Uncomment the desired options. Ensure only one option per setting is active at a time.
const adminEmail = undefined;
const feedbackLink =
    "https://yalesurvey.ca1.qualtrics.com/jfe/form/SV_0xGKiCrNbAUGwoC?participantId=" +
    subjectId;
