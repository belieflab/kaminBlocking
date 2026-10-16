"use strict";

/**
 * Increases the confidence bar by a fixed increment, capped at 100%.
 * Unlike moveConfidence() in the wrapper, it never ends the trial early,
 * so the cue always lasts the full stimuliDuration (fixed fMRI timing).
 *
 * @returns {number} The updated confidence level as a percentage of the bar's width.
 */
function moveConfidenceCapped() {
    const progressBar = document.getElementById("keyBar");
    const increment = 3.7;
    const currentWidth = Math.min(
        parseFloat(progressBar.style.width) + increment,
        100
    );
    progressBar.style.width = `${currentWidth}%`;
    totalConfidence = currentWidth;
    return totalConfidence;
}

/**
 * Handles responses during the cue: the first key pressed (key1 or key2) is the
 * participant's choice, and only that key can increase the confidence bar.
 * Pressing the other key afterwards is ignored.
 *
 * @param {number} key1 - Key code of the first response key (e.g., 48 for "0").
 * @param {number} key2 - Key code of the second response key (e.g., 49 for "1").
 */
function buttonPressLocked(key1, key2) {
    const barFill = document.getElementById("fillUp");
    if (barFill) {
        barFill.innerHTML = responseOptions;
    }

    const tapTapElement = document.getElementById("tapTap");
    if (!tapTapElement) {
        return;
    }
    tapTapElement.focus(); // Focus on the text box to capture key events

    let lockedKey = null; // first key pressed in this trial

    $(tapTapElement).keydown(function (event) {
        const keycode = event.which;
        if (keycode !== key1 && keycode !== key2) {
            return;
        }
        event.preventDefault();

        if (lockedKey === null) {
            lockedKey = keycode;
            responseKey = keycode;
        }
        if (keycode === lockedKey) {
            totalConfidence = moveConfidenceCapped();
        }
    });

    $(tapTapElement).keyup(function (event) {
        const keycode = event.which;
        if (keycode === key1 || keycode === key2) {
            event.preventDefault();
        }
    });
}
