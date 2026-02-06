//***********************************//
//   EXPERIMENT CONFIGURATION FILE   //
//***********************************//

// Debug Mode
// Options: false, true
let debug = false; // Default debug mode setting for the experiment

let webgazer = false; // Set to true to enable eye-tracking with WebGazer.js

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

let phase = undefined;

const counterbalance = false;

// Experiment Name
const experimentName = "Kamin Blocking"; // Name displayed in the browser title bar
const experimentAlias = version; // Unique identifier for the experiment, used in data saving

// Experiment Language
const language = "english"; // Language setting for the experiment

// User Interface Theme
// Options: "light", "dark", "white"
const theme = "white"; // Default theme setting for the user interface

// Add additional global configuration constants here
const consentLink =
    "https://yalesurvey.ca1.qualtrics.com/jfe/form/SV_9H0WmX4yKv4jz4a";

// Note: Uncomment the desired options. Ensure only one option per setting is active at a time.
const adminEmail = "joshua.kenney@yale.edu";
// Redirect Configuration (Daisy Chaining)
const urlConfig = {
    // redirect only
    kamin: "https://yalesurvey.ca1.qualtrics.com/jfe/form/SV_0xGKiCrNbAUGwoC",
};

// Intake Settings
const intake = {
    subject: {
        minLength: 4,
        maxLength: 4,
        prefix: "",
    },
    sites: ["CBCR"],
    phenotypes: ["C1", "C2"],
    visits: ["1", "2", "3", "4"],
    weeks: [],
};

const KLOOJE_API = "https://api.belieflab.yale.edu/task/upload";
const database = "apitest";
const collection = version;
