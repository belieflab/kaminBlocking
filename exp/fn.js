/**
 * Updates the width of a progress bar to reflect the confidence level in a trial.
 * Increments the bar's width up to a maximum of 100%. Once the progress bar reaches 100%,
 * it resets the bar to 0%, marks the trial as complete, and ends the trial.
 *
 * @returns {number} The updated confidence level as a percentage of the progress bar's width.
 */
const moveConfidence = () => {
    let progressBar = document.getElementById("keyBar");
    let currentWidth = parseFloat(progressBar.style.width); // Get current width percentage

    if (currentWidth >= 100) {
        progressBar.style.width = "0%"; // Reset progress bar to 0%
        totalConfidence = 100; // Set total confidence level to 100%
        // trialComplete = 1;
        jsPsych.finishTrial(); // Finish the trial if width reaches 100%
    } else {
        const increment = 3.7;
        currentWidth = Math.min(currentWidth + increment, 100); // Cap increment at 100%
        progressBar.style.width = `${currentWidth}%`; // Update the progress bar's width
        totalConfidence = currentWidth; // Update total confidence level
        // trialComplete = 0;
    }
    // console.log("Confidence level: ", totalConfidence);
    return totalConfidence;
};
