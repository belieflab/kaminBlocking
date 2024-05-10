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
    console.log("Confidence level: ", totalConfidence);
    return totalConfidence;
};

/**
 * Handles key press events to dynamically update the confidence bar based on user input.
 * This function sets up event listeners on a specified text box to detect and manage keydown and keyup events,
 * adjusting the confidence level accordingly. The function assumes the presence of a progress bar (`barFill`)
 * and a text input (`tapTapElement`) in the DOM.
 *
 * When keys '0' (key code 48) or '1' (key code 49) are pressed, it either increases or maintains a level of
 * 'totalConfidence' and updates the display through `moveConfidence()`. The function ensures the UI elements
 * are properly focused and handles the key events to prevent default behaviors and stop event propagation.
 */ function buttonPress() {
    const barFill = document.getElementById("fillUp");
    if (barFill) {
        barFill.innerHTML = responseOptions; // Assuming 'responseOptions' is defined
    }
    const tapTapElement = document.getElementById("tapTap");
    if (tapTapElement) {
        tapTapElement.focus(); // Focus on the text box to capture key events
        let keyHeld48 = false;
        let keyHeld49 = false;

        const handleKeyPress = (keycode, isKeyDown) => {
            if (keycode === 48) {
                keyHeld48 = isKeyDown;
            } else if (keycode === 49) {
                keyHeld49 = isKeyDown;
            }
            responseKey = keycode;

            if (keyHeld48 || keyHeld49) {
                totalConfidence = moveConfidence();
            }
        };

        $(tapTapElement).keydown(function (event) {
            const keycode = event.which;
            if (keycode === 48 || keycode === 49) {
                handleKeyPress(keycode, true);
                event.preventDefault(); // Prevent default action and stop propagation
            }
        });

        $(tapTapElement).keyup(function (event) {
            const keycode = event.which;
            if (keycode === 48 || keycode === 49) {
                handleKeyPress(keycode, false);
                event.preventDefault(); // Prevent default action and stop propagation
            }
        });
    }
}
