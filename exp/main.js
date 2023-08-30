let practice_procedure = {
    timeline: [fixation, stimuli, feedback],
    timeline_variables: practice_stimuli,
    randomize_order: false,
}

let learning_procedure;
switch(taskVersion) {
    case "allergy":
        learning_procedure = {
            timeline: [fixation, stimuli, feedback],
            timeline_variables: learning_stimuli_standard,
            randomize_order: true,
            type: 'fixed-repititions',
            repetitions: 10
        };
    break;
    case "social":
        learning_procedure = {
            timeline: [fixation, stimuli, feedback],
            timeline_variables: learning_stimuli_short,
            randomize_order: true,
            type: 'fixed-repititions',
            repetitions: 10
        };
    break;
}

let blocking_procedure;
switch(taskVersion) {
    case "allergy": 
        blocking_procedure = {
            timeline: [fixation, stimuli, feedback],
            timeline_variables: blocking_stimuli_standard,
            randomize_order: true,
            type: 'fixed-repititions',
            repetitions: 6
        };
    break;
    case "social":
        blocking_procedure = {
            timeline: [fixation, stimuli, feedback],
            timeline_variables: blocking_stimuli_short,
            randomize_order: true,
            type: 'fixed-repititions',
            repetitions: 6
        };
    break;
}

let testing_procedure;
switch(taskVersion) {
    case "allergy":
        testing_procedure = {
            timeline: [fixation, stimuli, feedback],
            timeline_variables: testing_stimuli_standard,
            randomize_order: true,
            type: 'fixed-repititions',
            repetitions: 6
        };
    break;
    case "social":
        testing_procedure = {
            timeline: [fixation, stimuli, feedback],
            timeline_variables: testing_stimuli_short,
            randomize_order: true,
            type: 'fixed-repititions',
            repetitions: 6
        }; 
    break;
}
timeline.push(welcome);

timeline.push(instructions_1);
// timeline.push(instructions_2);
// timeline.push(instructions_3);
// timeline.push(instructions_4);
// timeline.push(instructions_5);

// timeline.push(practice_procedure);

// timeline.push(instructions_6);

// timeline.push(learning_procedure);
// timeline.push(blocking_procedure);
timeline.push(testing_procedure);

// timeline.push(save_data);
timeline.push(screenRating1);
timeline.push(screenRating2);
timeline.push(end);