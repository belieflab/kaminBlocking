/**
 * Playwright automation for jsPsych Kamin Blocking experiment
 * URL: http://localhost/kaminBlocking/
 * Eye tracking: OFF (vanilla flow)
 *
 * Timeline:
 *   preload → welcome → instructions(1-5) → practice → instruction6
 *   → learning → blocking → testing → ratings → dataSave
 *
 * Usage:
 *   npx playwright test playwright-kamin.js
 *   -- OR run directly --
 *   node playwright-kamin.js
 */

const { chromium } = require("playwright");

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const EXPERIMENT_URL = "http://localhost/kaminBlocking/?PROLIFIC_PID=test123";
const HEADLESS = true; // no browser window = faster
const SLOW_MO = 0; // was 100 — remove inter-action delay
const RESPONSE_DELAY_MS = 50; // base delay; stimulus trials add 200-800ms random human-like RT on top
const TRIAL_TIMEOUT_MS = 15000; // max wait per screen before erroring
const SURVEY_CHOICE = "Unsure"; // label text OR index (0-4): "Definitely Not","Probably Not","Unsure","Probably Yes","Definitely Yes"

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Wait for the jsPsych display to update (new content in #jspsych-content) */
async function waitForNewTrial(page, previousHTML, timeout = TRIAL_TIMEOUT_MS) {
  await page.waitForFunction(
    (prev) => {
      const el = document.querySelector("#jspsych-content");
      return el && el.innerHTML !== prev && el.innerHTML.trim().length > 0;
    },
    previousHTML,
    { timeout }
  );
}

/** Get current innerHTML of the jspsych content area */
async function getTrialHTML(page) {
  return page.evaluate(() => {
    const el = document.querySelector("#jspsych-content");
    return el ? el.innerHTML : "";
  });
}

/** Press a key on the document level (for jsPsychHtmlKeyboardResponse trials) */
async function pressKey(page, key, delay = RESPONSE_DELAY_MS) {
  await page.waitForTimeout(delay);
  await page.keyboard.press(key);
}

/**
 * Press a key for stimulus trials using Playwright's native keyboard API.
 * Native keyboard.press() generates trusted events that jsPsych can measure RT from.
 * Adds a random delay (200-800ms) to simulate realistic human response times.
 */
async function pressTrialKey(page, keyChar, delay = RESPONSE_DELAY_MS) {
  // Random delay to simulate human RT (200-800ms, roughly log-normal-ish)
  const humanDelay = Math.floor(200 + Math.random() * 600);
  await page.waitForTimeout(delay + humanDelay);

  // Focus the hidden input if it exists, then use native keyboard
  await page.evaluate(() => {
    const el = document.getElementById("tapTap");
    if (el && el.focus) el.focus();
  });

  // Native press — generates trusted keydown/keyup that jsPsych's RT timer captures
  await page.keyboard.press(keyChar);
}

/** Wait for a trial that auto-advances (fixation, feedback, dataSave) */
async function waitForAutoAdvance(page, timeout = TRIAL_TIMEOUT_MS) {
  const before = await getTrialHTML(page);
  await waitForNewTrial(page, before, timeout);
}

/** Detect what kind of screen we're on */
async function detectScreen(page) {
  return page.evaluate(() => {
    const content = document.querySelector("#jspsych-content");
    if (!content) return { type: "unknown", text: "" };
    const html = content.innerHTML;
    const text = content.innerText || "";

    // Stimuli trial: has the hidden tapTap input
    if (document.getElementById("tapTap")) return { type: "stimuli", text };

    // Survey multi-choice
    if (html.includes("jspsych-survey-multi-choice"))
      return { type: "survey", text };

    // Fixation cross (just a "+" and nothing else significant)
    if (text.trim() === "+") return { type: "fixation", text };

    // Data save animation
    if (html.includes("dataSave") || html.includes("Saving") || html.includes("saving") || html.includes("save-animation") || html.includes("spinner") || html.includes("loading"))
      return { type: "datasave", text };

    // Camera init screen (has a button, not keyboard response)
    if (html.includes("webgazer") || html.includes("eye tracker") || html.includes("Initializing eye"))
      return { type: "camera_init", text };

    // Keyboard response — check for the plugin's wrapper div
    const kbWrapper = content.querySelector("#jspsych-html-keyboard-response-stimulus");
    if (kbWrapper) {
      const stimHtml = kbWrapper.innerHTML;
      const stimHtmlLower = stimHtml.toLowerCase();
      
      // Feedback screen: contains feedback-container with outcome image (+.jpg or -.jpg)
      if (stimHtml.includes("feedback-container") || stimHtml.includes("stim/kamin/+") || stimHtml.includes("stim/kamin/-")) {
        return { type: "feedback", text };
      }
      
      // Other feedback indicators
      const isFeedback = (
        (stimHtmlLower.includes("outcome") || stimHtmlLower.includes("allergic") || 
         stimHtmlLower.includes("safe") || stimHtmlLower.includes("fever") ||
         stimHtmlLower.includes("no reaction")) &&
        !stimHtmlLower.includes("press") && !stimHtmlLower.includes("instruction")
      );
      if (isFeedback) return { type: "feedback", text };
      
      // If it has "press" in the text, it's waiting for user input
      if (text.toLowerCase().includes("press")) return { type: "keyboard", text };
      
      // Fixation inside wrapper
      if (text.trim() === "+") return { type: "fixation", text };
      
      // Empty stimulus div — likely a transition, just wait
      if (text.trim().length === 0) return { type: "empty_transition", text, html: stimHtml.substring(0, 200) };
      
      // Default: treat as keyboard (try pressing a key)
      return { type: "keyboard", text };
    }

    // Fallback: any screen with a visible button might need clicking
    const buttons = content.querySelectorAll("button, input[type='button'], input[type='submit']");
    if (buttons.length > 0) return { type: "button_screen", text, buttonCount: buttons.length };

    return { type: "unknown", text: text.substring(0, 200) };
  });
}

/** Handle a survey-multi-choice screen (screenRating1 / screenRating2) */
async function handleSurvey(page, choice = SURVEY_CHOICE) {
  // Wait for the survey form to be present
  await page.waitForSelector(".jspsych-survey-multi-choice-question", {
    timeout: TRIAL_TIMEOUT_MS,
  });

  // Grab all radio inputs in the question
  const radios = await page.$$(".jspsych-survey-multi-choice-question input[type='radio']");
  if (radios.length === 0) {
    console.log("  ⚠️  Survey: no radio buttons found");
    return;
  }

  let clicked = false;

  // Strategy 1: match by value attribute (plugin sets value = option text)
  if (typeof choice === "string") {
    const byValue = await page.$(`input[type="radio"][value="${choice}"]`);
    if (byValue) {
      await byValue.check();  // .check() is more reliable than .click() for radios
      clicked = true;
      console.log(`    [survey] Checked radio by value="${choice}"`);
    }
  }

  // Strategy 2: match by label text (handles whitespace/encoding mismatches)
  if (!clicked && typeof choice === "string") {
    const labels = await page.$$(".jspsych-survey-multi-choice-text label");
    for (const label of labels) {
      const labelText = await label.innerText();
      if (labelText.trim() === choice) {
        // Click the label's associated radio input directly
        const forId = await label.getAttribute("for");
        if (forId) {
          const radio = await page.$(`#${forId}`);
          if (radio) { await radio.check(); clicked = true; }
        }
        if (!clicked) { await label.click(); clicked = true; }
        console.log(`    [survey] Clicked label matching "${choice}"`);
        break;
      }
    }
  }

  // Strategy 3: numeric index fallback (0-4)
  if (!clicked) {
    const idx = typeof choice === "number" ? choice : 2; // default to "Unsure" (index 2)
    if (idx < radios.length) {
      await radios[idx].check();
      clicked = true;
      console.log(`    [survey] Checked radio by index=${idx} (of ${radios.length})`);
    }
  }

  if (!clicked) {
    console.log("  ⚠️  Survey: could not select any option — clicking first radio as last resort");
    await radios[0].check();
  }

  // Wait for jsPsych to register the change event before submitting
  await page.waitForTimeout(500);

  // Click submit — the plugin renders either an input[type=submit] or a button with id
  const submitBtn = await page.$(
    '#jspsych-survey-multi-choice-next, input[type="submit"].jspsych-btn, button.jspsych-btn'
  );
  if (submitBtn) {
    await submitBtn.click();
    console.log("    [survey] Clicked submit");
  } else {
    // Fallback: click any submit-like element in the form
    const anySubmit = await page.$('input[type="submit"], button[type="submit"]');
    if (anySubmit) {
      await anySubmit.click();
      console.log("    [survey] Clicked fallback submit");
    } else {
      console.log("  ⚠️  Survey: no submit button found");
    }
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log("🚀 Launching browser...");
  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: SLOW_MO,
  });

  const context = await browser.newContext({
    // Grant permissions that might be requested
    permissions: ["camera"],
    viewport: { width: 1280, height: 900 },
  });

  const page = await context.newPage();

  // Log console messages from the experiment
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`  ❌ PAGE ERROR: ${msg.text()}`);
    } else if (msg.text().includes("Experiment complete")) {
      console.log(`  ✅ ${msg.text()}`);
    }
  });

  console.log(`📡 Navigating to ${EXPERIMENT_URL}`);
  await page.goto(EXPERIMENT_URL, { waitUntil: "networkidle" });

  // Handle dominant hand selection screen
  console.log("🖐️  Selecting dominant hand...");
  await page.waitForSelector("#right", { timeout: 10000 });
  await page.click("#right");
  console.log("  ✅ Selected: Right hand");
  await page.waitForTimeout(300);

  // Click SUBMIT button (calls validateStart())
  await page.click("#submitButton");
  console.log("  ✅ Clicked SUBMIT");

  // Wait for jsPsych to initialize — validateStart() loads experiment scripts
  await page.waitForSelector("#jspsych-content", { timeout: 60000 });
  console.log("✅ jsPsych loaded");

  // Give preload a moment
  await page.waitForTimeout(2000);

  let trialCount = 0;
  let running = true;
  let consecutiveUnknowns = 0;
  const MAX_UNKNOWN = 10;

  while (running) {
    try {
      const screen = await detectScreen(page);
      trialCount++;
      
      // Debug: log first 80 chars of text for every screen
      if (screen.type !== "fixation") {
        const preview = screen.text.replace(/\n/g, " ").substring(0, 80);
        // If text is empty, also log raw HTML snippet
        if (preview.trim().length < 5) {
          const rawHtml = await page.evaluate(() => {
            const el = document.querySelector("#jspsych-html-keyboard-response-stimulus");
            return el ? el.innerHTML.substring(0, 200) : "(no stimulus div)";
          });
          console.log(`    [debug] type=${screen.type} text="" html="${rawHtml}"`);
        } else {
          console.log(`    [debug] type=${screen.type} text="${preview}"`);
        }
      }

      switch (screen.type) {
        case "fixation":
          // Auto-advances after fixationDuration
          console.log(`  [${trialCount}] ⊕ Fixation — waiting...`);
          await waitForAutoAdvance(page);
          consecutiveUnknowns = 0;
          break;

        case "stimuli":
          // Press "1" (keyCode 49) or "0" (keyCode 48) — randomize or always pick one
          const responseKey = Math.random() > 0.5 ? "1" : "0";
          console.log(
            `  [${trialCount}] 🧪 Stimulus — pressing "${responseKey}"`
          );
          await pressTrialKey(page, responseKey);
          // Stimulus auto-advances after stimuliDuration even if response registered
          await waitForAutoAdvance(page);
          consecutiveUnknowns = 0;
          break;

        case "feedback":
          // Auto-advances after feedbackDuration
          console.log(`  [${trialCount}] 💬 Feedback — waiting...`);
          await waitForAutoAdvance(page);
          consecutiveUnknowns = 0;
          break;

        case "empty_transition":
          // Brief transition screen — just wait for it to auto-advance
          console.log(`  [${trialCount}] ⏳ Transition — waiting...`);
          await page.waitForTimeout(500);
          consecutiveUnknowns = 0;
          break;

        case "survey":
          console.log(`  [${trialCount}] 📋 Survey (Rating) — selecting "${SURVEY_CHOICE}"`);
          const surveyHTMLBefore = await getTrialHTML(page);
          await handleSurvey(page, SURVEY_CHOICE);
          // Wait for the DOM to actually change (next trial or second survey)
          try {
            await waitForNewTrial(page, surveyHTMLBefore, TRIAL_TIMEOUT_MS);
          } catch {
            // If DOM didn't change, give it a beat — might be transitioning
            await page.waitForTimeout(1000);
          }
          consecutiveUnknowns = 0;
          break;

        case "datasave":
          console.log(`  [${trialCount}] 💾 Data save — waiting for completion...`);
          // dataSave has trial_duration: 5000, then triggers writeCsvRedirect
          await page.waitForTimeout(7000);
          running = false;
          consecutiveUnknowns = 0;
          break;

        case "camera_init":
          // Eye tracker init — try clicking the continue button
          console.log(`  [${trialCount}] 📷 Camera init — clicking continue button`);
          try {
            await page.click("button, #jspsych-webgazer-init-camera-btn", { timeout: 5000 });
          } catch {
            await pressKey(page, " ");
          }
          await page.waitForTimeout(1000);
          consecutiveUnknowns = 0;
          break;

        case "button_screen":
          // Screen with clickable button(s)
          console.log(`  [${trialCount}] 🔘 Button screen — clicking first button`);
          try {
            await page.click("#jspsych-content button, #jspsych-content input[type='button'], #jspsych-content input[type='submit']", { timeout: 5000 });
          } catch {
            await pressKey(page, " ");
          }
          await page.waitForTimeout(500);
          consecutiveUnknowns = 0;
          break;

        case "keyboard":
          // Instruction screens — figure out which key to press
          const text = screen.text.toLowerCase();
          
          // Check if this screen specifically needs 0 or 1 (not space)
          if (
            (text.includes("press the 0") || text.includes("press 0")) &&
            (text.includes("press the 1") || text.includes("press 1"))
          ) {
            // Screen expects 0 or 1 — press 1 (predict allergy)
            console.log(`  [${trialCount}] 📖 Instruction (needs 0/1) — pressing "1"`);
            await pressKey(page, "1");
          } else if (text.includes("press space") || text.includes("press any key") || text.includes("spacebar")) {
            console.log(`  [${trialCount}] 📖 Instruction — pressing Space`);
            await pressKey(page, " ");
          } else {
            // Default: try space first, if screen doesn't change try other keys
            console.log(
              `  [${trialCount}] 📖 Screen (fallback Space) — "${screen.text.replace(/\n/g, " ").substring(0, 60)}..."`
            );
            await pressKey(page, " ");
          }
          await page.waitForTimeout(300);
          consecutiveUnknowns = 0;
          break;

        case "unknown":
          consecutiveUnknowns++;
          console.log(
            `  [${trialCount}] ❓ Unknown screen (${consecutiveUnknowns}/${MAX_UNKNOWN}): "${screen.text.substring(0, 80)}..."`
          );
          if (consecutiveUnknowns >= MAX_UNKNOWN) {
            console.log("  ⚠️  Too many unknowns — stopping.");
            running = false;
          } else {
            // Try space as a catch-all, wait for change
            await pressKey(page, " ", 500);
            await page.waitForTimeout(1000);
          }
          break;
      }
    } catch (err) {
      console.log(`  ⚠️  Error at trial ${trialCount}: ${err.message}`);
      // Check if experiment ended (redirect or page change)
      const url = page.url();
      if (!url.includes("kaminBlocking")) {
        console.log("  ↪ Redirected — experiment likely complete.");
        running = false;
      } else {
        // Try to recover
        await page.waitForTimeout(1000);
      }
    }
  }

  // Extract final data if still on the page
  try {
    const data = await page.evaluate(() => {
      if (typeof jsPsych !== "undefined" && jsPsych.data) {
        return jsPsych.data.get().json();
      }
      return null;
    });

    if (data) {
      const fs = require("fs");
      const outPath = "kamin-playwright-data.json";
      fs.writeFileSync(outPath, data);
      console.log(`\n📊 Data saved to ${outPath}`);
    }
  } catch (e) {
    console.log("  (Could not extract jsPsych data — may have redirected)");
  }

  console.log(`\n✅ Done. ${trialCount} screens processed.`);
  await browser.close();
})();
