//  increment confidence bar
const moveConfidence = () => {
    let progressBar = document.getElementById("keyBar");
    let currentWidth = parseFloat(progressBar.style.width); // Get current width percentage

    if (currentWidth >= 99) {
        trialComplete = 1;
        progressBar.style.width = "0%"; // Reset progress bar to 0%
        jsPsych.finishTrial(); // Finish the trial if width reaches 99% or more
    } else {
        currentWidth += 3.7; // Increment by 3.70% towards a max of 99.9%
        progressBar.style.width = currentWidth + "%"; // Update the progress bar's width
        totalConfidence = currentWidth; // Update total confidence level
        trialComplete = 0;
    }
};
