"use strict";

const negative = `stim/${version}/-.jpg`;
const positive = `stim/${version}/+.jpg`;

const negativeFeedback = `<div class='feedback-container'><img src='${negative}'></div>`;
const positiveFeedback = `<div class='feedback-container'><img src='${positive}'></div>`;

/* START TRAINING TRIAL FOR PARTICIPANTS */

// version number
const iteration = "corrected"; // fixed testing stimuli pairing per PRC ec3c20c

// feedback contrainer
let feedbackGenerator = '<p id="feedbackGenerator" style="color:black;"></p>';

// tracks total taps per trial
let totalConfidence = [0]; // must be 0 to compensate for participant should they miss first trial

// // user selection of allergy or no-allergy
let responseKey;

// trial index
let trialIterator = 1;

let score = 0;
let earnings = 0;
// durations of trial components:
const fixationDuration = 1000;
const stimuliDuration = 3000;
const feedbackDuration = 1000;

// progress bar container
let progressBar =
    '<div id="counter" class="w3-container" style="max-width: 600px; margin: 0 auto;"><div class="w3-light-grey"><div class="w3-grey" id="keyBar" style="height:24px;width:0%;"></div></div><br><div>';
let fillUp = '<p id="fillUp" style="color:black;"></p>';

// set the time remaining notification for participant
let timeRemaining =
    '<p id="timeRemaining" style="text-align:center; color:black;"></p>';

/**
 * Function to determine stimulus set based on visit/week index
 * @returns {string|null} The stimulus set name or null if not available
 */
function getStimulusSet() {
    let setIndex = null;
    let visitOrWeekValue = null;

    // Check if visit is defined and valid
    if (typeof visit !== "undefined" && visit !== null) {
        visitOrWeekValue = parseInt(visit);

        // Check if this visit number exists in the intake.visits array
        if (
            typeof intake !== "undefined" &&
            intake.visits &&
            intake.visits.length > 0
        ) {
            // Get the specific index for this visit in the array
            const visitIndex = intake.visits.indexOf(visitOrWeekValue);

            if (visitIndex !== -1) {
                setIndex = visitIndex;
                console.log(
                    `Visit ${visit} found at index ${visitIndex} in intake.visits`
                );
            } else {
                // This is critical - the visit number doesn't exist in the allowed visits
                console.error(
                    `Visit ${visit} not found in allowed visits: ${intake.visits.join(
                        ", "
                    )}`
                );
                setIndex = null; // Explicitly set to null to indicate error
            }
        }
    }

    // Check if week is defined and valid (only if visit wasn't valid)
    if (setIndex === null && typeof week !== "undefined" && week !== null) {
        visitOrWeekValue = parseInt(week);

        // Check if this week number exists in the intake.weeks array
        if (
            typeof intake !== "undefined" &&
            intake.weeks &&
            intake.weeks.length > 0
        ) {
            // Get the specific index for this week in the array
            const weekIndex = intake.weeks.indexOf(visitOrWeekValue);

            if (weekIndex !== -1) {
                setIndex = weekIndex;
                console.log(
                    `Week ${week} found at index ${weekIndex} in intake.weeks`
                );
            } else {
                // This is critical - the week number doesn't exist in the allowed weeks
                console.error(
                    `Week ${week} not found in allowed weeks: ${intake.weeks.join(
                        ", "
                    )}`
                );
                setIndex = null; // Explicitly set to null to indicate error
            }
        }
    }

    // Available stimulus sets
    const availableSets = ["set1", "set2"];

    // If no valid visit/week was found, or if the index is out of bounds
    if (setIndex === null || setIndex >= availableSets.length) {
        // Create detailed error message
        let errorMessage = "";

        if (setIndex === null) {
            // Invalid visit/week
            if (typeof visit !== "undefined" && visit !== null) {
                errorMessage = `Error: Visit ${visit} is not in the allowed visits: ${intake.visits.join(
                    ", "
                )}`;
            } else if (typeof week !== "undefined" && week !== null) {
                errorMessage = `Error: Week ${week} is not in the allowed weeks: ${intake.weeks.join(
                    ", "
                )}`;
            } else {
                errorMessage = "Error: No valid visit or week specified";
            }
        } else {
            // Valid visit/week but no corresponding stimulus set
            errorMessage = `Error: No stimulus set available for ${
                visit ? "visit " + visit : ""
            }${week ? "week " + week : ""} (index: ${setIndex})`;
        }

        console.error(errorMessage);

        // Display error message and stop execution
        document.body.innerHTML = `
            <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif; max-width: 600px; margin-left: auto; margin-right: auto;">
                <h2>Stimulus Set Not Available</h2>
                <p>${errorMessage}</p>
                <p>Only sets 1-2 are available for this experiment.</p>
                <p>Available visits: ${
                    intake.visits ? intake.visits.join(", ") : "None"
                }</p>
                <p>Available weeks: ${
                    intake.weeks ? intake.weeks.join(", ") : "None"
                }</p>
                <p>Please contact the administrator at: <a href="mailto:${adminEmail}">${adminEmail}</a></p>
            </div>
        `;

        // Throw an error to stop execution
        throw new Error("Required stimulus set not available");
    }

    // If we get here, the set is available
    const stimulusSet = availableSets[setIndex];
    console.log("Using stimulus set:", stimulusSet, "(index:", setIndex + ")");
    return stimulusSet;
}

// Try to get the stimulus set and proceed only if successful
let stimArray = [];
let shuffledStim = [];

try {
    const currentStimulusSet = getStimulusSet();

    // Only proceed if we got a valid stimulus set
    if (currentStimulusSet) {
        for (let i = 1; i < 19; i++) {
            stimArray.push(
                "stim/" +
                    version +
                    "/" +
                    currentStimulusSet +
                    "/s" +
                    i +
                    fileExtension
            );
        }

        console.log("Generated stimArray:", stimArray);
        shuffledStim = shuffleArray(stimArray); //shuffled array no repeats
    }
} catch (error) {
    console.error("Failed to initialize experiment:", error);
    // The error message is already displayed to the user in getStimulusSet
}

// cues within shuffledStim: standard version (until 11), short (until 13). SCdO 07/may/2024
//                 0   1   2   3   4   5   6   7    8   9   10  11  12  13
// shuffledStim = [A1, A2, B1, B2, C1, C2, D1, D2,  E,  F,  I,  J,  K,  L]

let practice_stimuli = [
    {
        stimulus: shuffledStim[15],
        stimulus2: null,
        data: {
            test_part: "practice",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[15].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: shuffledStim[16],
        stimulus2: null,
        data: {
            test_part: "practice",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[16].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: shuffledStim[17],
        stimulus2: null,
        data: {
            test_part: "practice",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[17].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
];

let learning_stimuli_standard = [
    {
        stimulus: shuffledStim[0],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "allergy",
            condition: "single-positive",
            trial_type: "A1+",
            correct_response: 49, // allergy (1)
            incorrect_response: 48, // no-allergy (0)
            stim_left: shuffledStim[0].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[1],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "allergy",
            condition: "single-positive",
            trial_type: "A2+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[1].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[4],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "no-reaction",
            condition: "single-negative",
            trial_type: "C1-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[4].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: shuffledStim[5],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "no-reaction",
            condition: "single-negative",
            trial_type: "C2-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[5].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: shuffledStim[9],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "no-reaction",
            condition: "single-negative",
            trial_type: "F-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[9].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: shuffledStim[10],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "allergy",
            condition: "single-positive",
            trial_type: "I+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[10].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[11],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "no-reaction",
            condition: "single-negative",
            trial_type: "J-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[11].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
];

let learning_stimuli_short = [
    {
        stimulus: shuffledStim[0],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "allergy",
            condition: "single-positive",
            trial_type: "A1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[0].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[1],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "allergy",
            condition: "single-positive",
            trial_type: "A2+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[1].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[4],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "no-reaction",
            condition: "single-negative",
            trial_type: "C1-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[4].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: shuffledStim[5],
        stimulus2: null,
        data: {
            test_part: "learning",
            reaction: "no-reaction",
            condition: "single-negative",
            trial_type: "C2-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[5].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
];

let blocking_stimuli_standard = [
    {
        stimulus: shuffledStim[0],
        stimulus2: shuffledStim[2],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking",
            trial_type: "A1B1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[0].slice(8),
            stim_right: shuffledStim[2].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[1],
        stimulus2: shuffledStim[3],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking",
            trial_type: "A2B2+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[1].slice(8),
            stim_right: shuffledStim[3].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[4],
        stimulus2: shuffledStim[6],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking-control",
            trial_type: "C1D1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[4].slice(8),
            stim_right: shuffledStim[6].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[5],
        stimulus2: shuffledStim[7],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking-control",
            trial_type: "C2D2+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[5].slice(8),
            stim_right: shuffledStim[7].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[8],
        stimulus2: shuffledStim[9],
        data: {
            test_part: "blocking",
            reaction: "no-reaction",
            condition: "no-allergy-control",
            trial_type: "EF-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[8].slice(8),
            stim_right: shuffledStim[9].slice(8),
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: shuffledStim[10],
        stimulus2: null,
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "consistent-allergy",
            trial_type: "I+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[10].slice(8),
            stim_right: "",
        },
    }, // 1 key
    {
        stimulus: shuffledStim[11],
        stimulus2: null,
        data: {
            test_part: "blocking",
            reaction: "no-reaction",
            condition: "consistent-no-allergy",
            trial_type: "J-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[11].slice(8),
            stim_right: "",
        },
    }, // 0 key
];

let blocking_stimuli_short = [
    {
        stimulus: shuffledStim[0],
        stimulus2: shuffledStim[2],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking",
            trial_type: "A1B1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[0].slice(8),
            stim_right: shuffledStim[2].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[1],
        stimulus2: shuffledStim[3],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking",
            trial_type: "A2B2+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[1].slice(8),
            stim_right: shuffledStim[3].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[4],
        stimulus2: shuffledStim[6],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking-control",
            trial_type: "C1D1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[4].slice(8),
            stim_right: shuffledStim[6].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[5],
        stimulus2: shuffledStim[7],
        data: {
            test_part: "blocking",
            reaction: "allergy",
            condition: "blocking-control",
            trial_type: "C2D2+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[5].slice(8),
            stim_right: shuffledStim[7].slice(8),
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[8],
        stimulus2: shuffledStim[9],
        data: {
            test_part: "blocking",
            reaction: "no-reaction",
            condition: "no-allergy-control",
            trial_type: "EF-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[8].slice(8),
            stim_right: shuffledStim[9].slice(8),
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: shuffledStim[10],
        stimulus2: shuffledStim[12],
        data: {
            test_part: "blocking",
            reaction: "no-reaction",
            condition: "no-allergy-control",
            trial_type: "IK-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[10].slice(8),
            stim_right: shuffledStim[12].slice(8),
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: shuffledStim[11],
        stimulus2: shuffledStim[13],
        data: {
            test_part: "blocking",
            reaction: "no-reaction",
            condition: "no-allergy-control",
            trial_type: "JL-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[11].slice(8),
            stim_right: shuffledStim[13].slice(8),
            version: iteration,
        },
    }, // 0 key
];

// cues within shuffledStim: standard version (until 11), short (until 13). SCdO 07/may/2024
//                 0   1   2   3   4   5   6   7    8   9   10  11  12  13
// shuffledStim = [A1, A2, B1, B2, C1, C2, D1, D2,  E,  F,  I,  J,  K,  L]

let testing_stimuli_standard = [
    {
        stimulus: shuffledStim[2],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "allergy",
            condition: "blocking-violation",
            trial_type: "B1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[2].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[3],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "no-reaction",
            condition: "blocking-confirmation",
            trial_type: "B2-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[3].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: shuffledStim[6],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "allergy",
            condition: "blocking-confirmation-control",
            trial_type: "D1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[6].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[7],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "no-reaction",
            condition: "blocking-violation-control",
            trial_type: "D2-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[7].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: shuffledStim[8],
        stimulus2: shuffledStim[9],
        data: {
            test_part: "testing",
            reaction: "no-reaction",
            condition: "no-allergy-control",
            trial_type: "EF-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[8].slice(8),
            stim_right: shuffledStim[9].slice(8),
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: shuffledStim[10],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "allergy",
            condition: "consistent-allergy",
            trial_type: "I+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[10].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[11],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "no-reaction",
            condition: "consistent-no-allergy",
            trial_type: "J-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[11].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
];

// unclear what to do with the c2d2 trial in testing, when it is d2 ('blocking-violation-control')
// in Corlett in Fletcher 2012, this is a "-"
// in original CAPR task above, it is also a "-"
// in Ongchoco, it appears to be "+" in the code and is not listed as in article table!
let testing_stimuli_short = [
    {
        stimulus: shuffledStim[2],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "allergy",
            condition: "blocking-violation",
            trial_type: "B1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[2].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[3],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "no-reaction",
            condition: "blocking-confirmation",
            trial_type: "B2-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[3].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: shuffledStim[6],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "allergy",
            condition: "blocking-confirmation-control",
            trial_type: "D1+",
            correct_response: 49,
            incorrect_response: 48,
            stim_left: shuffledStim[6].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 1 key
    {
        stimulus: shuffledStim[7],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "no-reaction",
            condition: "blocking-violation-control",
            trial_type: "D2-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[7].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
    {
        stimulus: shuffledStim[13],
        stimulus2: null,
        data: {
            test_part: "testing",
            reaction: "no-reaction",
            condition: "no-allergy-control",
            trial_type: "L-",
            correct_response: 48,
            incorrect_response: 49,
            stim_left: shuffledStim[11].slice(8),
            stim_right: "",
            version: iteration,
        },
    }, // 0 key
];
