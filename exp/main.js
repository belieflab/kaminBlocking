let practice_procedure = {
    timeline: [fixation, stimuli, feedback],
    timeline_variables: practice_stimuli,
    randomize_order: false,
}

let learning_procedure = {
    timeline: [fixation, stimuli, feedback],
    timeline_variables: learning_stimuli,
    randomize_order: true,
    type: 'fixed-repititions',
    repetitions: 1
}

let blocking_procedure = {
    timeline: [fixation, stimuli, feedback],
    timeline_variables: blocking_stimuli,
    randomize_order: true,
    type: 'fixed-repititions',
    repetitions: 6
}

let testing_procedure = {
    timeline: [fixation, stimuli, feedback],
    timeline_variables: testing_stimuli,
    randomize_order: true,
    type: 'fixed-repititions',
    repetitions: 6
}

timeline.push(welcome);

timeline.push(instructions_1);
timeline.push(instructions_2);
timeline.push(instructions_3);
timeline.push(instructions_4);
timeline.push(instructions_5);

// timeline.push(practice_procedure);

timeline.push(instructions_6);

timeline.push(learning_procedure);
timeline.push(blocking_procedure);
timeline.push(testing_procedure);

timeline.push(save_data);
timeline.push(end);