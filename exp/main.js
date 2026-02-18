"use strict";

// Preload images
timeline.push(preload);
timeline.push(welcome); // welcome page
// here adding the WebGazer initiation and calibration process
if (eyeTrackingEnabled) {
    // SPEC: init-camera must run before calibrate/validate trials when auto_initialize=false.
    // REPO: cameraInit then calibrationProcedure ensures extension readiness.
    // LINK: https://www.jspsych.org/v7/overview/eye-tracking/
    // Source (Spec): https://www.jspsych.org/v7/overview/eye-tracking/
    // Source (Paper): Papoutsaki et al. 2016 (WebGazer) https://cs.brown.edu/people/apapouts/papers/ijcai2016webgazer.pdf
    // Source (Paper): Steffan et al. 2024 (jsPsych + WebGazer validation) https://pmc.ncbi.nlm.nih.gov/articles/PMC10841511/
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
