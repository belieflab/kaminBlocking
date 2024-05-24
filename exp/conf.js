//***********************************//
//   EXPERIMENT CONFIGURATION FILE   //
//***********************************//

// Debug Mode
// Options: false, true
let debug = false; // Default debug mode setting for the experiment

// if you want to ask questions at the end of the task then true
let ratingQuestions = false;

/**
 * Configuration for trial repetitions:
 * - `production`: Standard repetitions for the full experiment
 * - `debug`: Reduced repetitions for faster testing
 *
 * Usage:
 * - For object configs: getRepetitions().learning, getRepetitions().blocking, getRepetitions().testing
 * - For single number configs: getRepetitions()
 */
const repetitions = {
    production: { learning: 10, blocking: 6, testing: 6 },
    debug: { learning: 1, blocking: 1, testing: 1 },
};

// taskVersion choices: "social_kamin", "kamin", "kamin_gain", "kamin_loss"
// social_kamin involves avatars and focuses on sabotage
// kamin_loss and kamin_gain focus on learning which fractal images gain or lose points
const version = "kamin";

// Experiment Name
const experimentName = "Kamin Blocking"; // Name displayed in the browser title bar
const experimentAlias = version; // Unique identifier for the experiment, used in data saving

// Experiment Language
const language = "english"; // Language setting for the experiment

// User Interface Theme
// Options: "light", "dark", "white"
const theme = "white"; // Default theme setting for the user interface

// Add additional global configuration constants here

// Note: Uncomment the desired options. Ensure only one option per setting is active at a time.
const adminEmail = undefined;

// Set feedback link based on workerId, PROLIFIC_PID, or participantId
const identifiers = { workerId, PROLIFIC_PID, participantId };
const identifierKey = Object.keys(identifiers).find(
    (key) => identifiers[key] !== undefined
);

const feedbackLink = `https://yalesurvey.ca1.qualtrics.com/jfe/form/SV_0xGKiCrNbAUGwoC?${identifierKey}=${subjectId}`;
