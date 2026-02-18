"use strict";

// Preload images
timeline.push(preload);
timeline.push(welcome); // welcome page
// here adding the WebGazer initiation and calibration process
if (webgazer) {
    timeline.push(cameraInit);
    timeline.push(calibrationProcedure); //calibration info
    timeline.push(readyToStart);
}

// Instructions
timeline.push(...instructionSet);

// // Practice
timeline.push(practice_procedure, instruction6);

// Main experiment
timeline.push(learning_procedure, blocking_procedure, testing_procedure);

if (ratingQuestions) {
    timeline.push(screenRating1, screenRating2);
}

timeline.push(dataSave);

// don't allow experiment to start unless subjectId is set
if (subjectId) {
    // New jsPsych 7.x syntax
    jsPsych.run(timeline);
}
