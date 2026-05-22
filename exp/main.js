"use strict";

// Preload images
timeline.push(preload);

// Instructions
timeline.push(welcome, ...instructionSet);

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
