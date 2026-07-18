"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const HOST = "127.0.0.1";
const DEFAULT_TIMEOUT_MS = 120000;

const contentTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
};

const baseGlobals = `
window.subjectId = "HEADLESS001";
window.src_subject_id = "HEADLESS001";
window.workerId = undefined;
window.participantId = undefined;
window.PROLIFIC_PID = undefined;
window.visit = "1";
window.week = null;
window.phase = null;
window.site = "CBCR";
window.phenotype = "C1";
window.sex = "F";
window.handedness = "right";
window.antihandedness = "left";
window.redirectLink = undefined;
window.alert = (message) => console.log("ALERT", message);
window.writeCandidateKeys = (data) => {
    data.src_subject_id = window.src_subject_id;
    data.subjectId = window.subjectId;
    data.visit = window.visit;
    data.week = window.week;
    data.site = window.site;
    data.phenotype = window.phenotype;
    data.sex = window.sex;
    data.handedness = window.handedness;
    data.interview_date = new Date().toLocaleDateString("en-US");
};
window.addEventListener("error", (event) => {
    console.error("WINDOW_ERROR", event.message, event.filename, event.lineno, event.colno);
});
window.addEventListener("unhandledrejection", (event) => {
    console.error("UNHANDLED_REJECTION", event.reason && event.reason.message || event.reason);
});
`;

function experimentHarness() {
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Kamin Playwright E2E</title>
  <script>${baseGlobals}</script>
  <link rel="stylesheet" href="/wrap/lib/style.css">
  <link rel="stylesheet" href="/css/confidence.css">
  <link rel="stylesheet" href="/css/exp.css">
  <script src="/wrap/lib/validate.js"></script>
  <script src="/wrap/lib/jquery-3.5.1.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/jspsych/jspsych@jspsych@7.3.3/examples/js/webgazer/webgazer.js"></script>
  <script src="https://unpkg.com/jspsych@7.3.3"></script>
  <link href="https://unpkg.com/jspsych@7.3.3/css/jspsych.css" rel="stylesheet">
  <script src="https://unpkg.com/@jspsych/plugin-survey-multi-choice@1.1.3"></script>
  <script src="/wrap/plugins/plugin-html-keyboard-response.js"></script>
  <script src="https://unpkg.com/@jspsych/plugin-preload@1.1.3"></script>
  <script src="https://unpkg.com/@jspsych/plugin-virtual-chinrest@2.0.3"></script>
  <script src="/wrap/vendor/jspsych/extension-webgazer-1.0.3.js"></script>
  <script src="/wrap/vendor/jspsych/plugin-webgazer-init-camera-1.0.3.js"></script>
  <script src="/wrap/vendor/jspsych/plugin-webgazer-calibrate-1.0.3.js"></script>
  <script src="/wrap/vendor/jspsych/plugin-webgazer-validate-1.0.3.js"></script>
  <script src="/exp/conf.js"></script>
  <script src="/wrap/lib/redirect.js"></script>
  <script src="/wrap/lib/fn.js"></script>
  <script src="/exp/fn.js"></script>
  <script src="/exp/chinrest-core.js"></script>
  <script src="/exp/camera-gate-core.js"></script>
  <script src="/exp/var.js"></script>
  <script src="/exp/lang.js"></script>
  <script src="/exp/timeline.js"></script>
</head>
<body id="unload"></body>
</html>`;
}

function transformServedScript(urlPath, source) {
    let out = source;

    if (urlPath === "/exp/conf.js") {
        out = out
            .replace("const debug = false;", "const debug = true;")
            .replace("enable: true,", "enable: false,")
            .replace("enabled: true,", "enabled: false,");
    }

    if (urlPath === "/exp/var.js") {
        out = out
            .replace("const fixationDuration = 1000;", "const fixationDuration = 1;")
            .replace("const stimuliDuration = 3000;", "const stimuliDuration = 60;")
            .replace("const feedbackDuration = 1000;", "const feedbackDuration = 1;");
    }

    if (urlPath === "/exp/timeline-no-webgazer.js") {
        out = out
            .replace("trial_duration: 5000,", "trial_duration: 1,")
            .replace("const dataSave = {", 'const dataSave = { data: { task: "data_save" },');
    }

    if (urlPath === "/exp/timeline.js") {
        out = out.replace("const jsPsych = initJsPsych({", "window.jsPsych = initJsPsych({");
    }

    return out;
}

function createServer() {
    return http.createServer((req, res) => {
        const urlPath = decodeURIComponent(req.url.split("?")[0]);
        if (urlPath === "/" || urlPath === "/playwright-e2e.html") {
            res.writeHead(200, { "content-type": "text/html" });
            res.end(experimentHarness());
            return;
        }

        if (urlPath === "/data.php") {
            req.resume();
            res.writeHead(200, { "content-type": "application/json" });
            res.end(JSON.stringify({ success: true, headless: true }));
            return;
        }

        const filePath = path.normalize(path.join(root, urlPath));
        if (!filePath.startsWith(root)) {
            res.writeHead(403);
            res.end("forbidden");
            return;
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end("not found");
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            const body = ext === ".js" ? transformServedScript(urlPath, data.toString()) : data;
            res.writeHead(200, {
                "content-type": contentTypes[ext] || "application/octet-stream",
            });
            res.end(body);
        });
    });
}

function listen(server) {
    return new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, HOST, () => resolve(server.address().port));
    });
}

async function jsPsychRows(page) {
    return page
        .evaluate(() => {
            if (!window.jsPsych || !window.jsPsych.data) {
                return [];
            }
            return window.jsPsych.data.get().values();
        })
        .catch(() => []);
}

function classifyScreen(text, hasTapInput) {
    if (
        text.includes("successfully completed") ||
        text.includes("data has been saved") ||
        text.includes("Thank you!")
    ) {
        return "complete";
    }
    if (hasTapInput) {
        return "stimulus";
    }
    if (text.includes("Press either")) {
        return "choice-instruction";
    }
    if (text.includes("Press") || text.includes("Welcome") || text.includes("Let us begin")) {
        return "space-instruction";
    }
    return "wait";
}

async function sendJsPsychKey(page, key) {
    await page.evaluate((pressedKey) => {
        const code = pressedKey === " " ? "Space" : `Digit${pressedKey}`;
        const numeric = pressedKey === " " ? 32 : pressedKey.charCodeAt(0);
        for (const target of [document, document.body, window]) {
            if (!target) continue;
            target.dispatchEvent(
                new KeyboardEvent("keydown", {
                    key: pressedKey,
                    code,
                    keyCode: numeric,
                    which: numeric,
                    bubbles: true,
                }),
            );
            target.dispatchEvent(
                new KeyboardEvent("keyup", {
                    key: pressedKey,
                    code,
                    keyCode: numeric,
                    which: numeric,
                    bubbles: true,
                }),
            );
        }
    }, key);
}

async function sendTapTapResponse(page, key) {
    await page.evaluate((pressedKey) => {
        const input = document.getElementById("tapTap");
        if (!input) {
            return false;
        }
        input.focus();
        const numeric = pressedKey.charCodeAt(0);
        const code = `Digit${pressedKey}`;
        for (const type of ["keydown", "keyup"]) {
            input.dispatchEvent(
                new KeyboardEvent(type, {
                    key: pressedKey,
                    code,
                    keyCode: numeric,
                    which: numeric,
                    bubbles: true,
                }),
            );
        }
        return true;
    }, key);
}

async function driveExperiment(page, timeoutMs) {
    const started = Date.now();
    let actionCount = 0;
    let lastText = "";
    let lastRows = 0;
    let stagnantSince = Date.now();

    await page.locator("body").click({ timeout: 1000 }).catch(() => {});
    await page.waitForTimeout(250);

    while (Date.now() - started < timeoutMs) {
        const text = await page.locator("body").innerText().catch(() => "");
        const hasTapInput = (await page.locator("#tapTap").count().catch(() => 0)) > 0;
        const rows = await jsPsychRows(page);
        const screen = classifyScreen(text, hasTapInput);

        if (screen === "complete") {
            return {
                completed: true,
                actionCount,
                rows,
                finalText: text,
            };
        }

        if (text !== lastText || rows.length !== lastRows) {
            lastText = text;
            lastRows = rows.length;
            stagnantSince = Date.now();
        } else if (Date.now() - stagnantSince > 5000) {
            if (text.includes("Let us begin")) {
                await page.evaluate(() => {
                    if (window.jsPsych && typeof window.jsPsych.finishTrial === "function") {
                        window.jsPsych.finishTrial({
                            rt: null,
                            response: "headless-advance",
                            stimulus: "headless advanced instruction6",
                        });
                    }
                });
                await page.waitForTimeout(100);
                stagnantSince = Date.now();
                continue;
            }
            await page.locator("body").click({ timeout: 500 }).catch(() => {});
            stagnantSince = Date.now();
        }

        if (screen === "stimulus") {
            await sendTapTapResponse(page, actionCount % 2 === 0 ? "1" : "0");
            await page.waitForTimeout(90);
        } else if (screen === "choice-instruction") {
            await sendJsPsychKey(page, "1");
            await page.waitForTimeout(180);
        } else if (screen === "space-instruction") {
            await sendJsPsychKey(page, " ");
            await page.waitForTimeout(180);
        } else {
            await page.waitForTimeout(50);
        }
        actionCount += 1;
    }

    return {
        completed: false,
        actionCount,
        rows: await jsPsychRows(page),
        finalText: await page.locator("body").innerText().catch(() => ""),
    };
}

function summarizeRows(rows) {
    return {
        count: rows.length,
        tasks: Array.from(new Set(rows.map((row) => row.task || row.test_part || "unknown"))),
    };
}

async function main() {
    const server = createServer();
    let browser;

    try {
        const port = await listen(server);
        browser = await chromium.launch({
            headless: true,
            args: [
                "--disable-gpu",
                "--use-fake-device-for-media-stream",
                "--use-fake-ui-for-media-stream",
                "--autoplay-policy=no-user-gesture-required",
            ],
        });

        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
        const errors = [];
        const missingResources = [];

        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
            const text = message.text();
            if (/WINDOW_ERROR|UNHANDLED_REJECTION|Uncaught|error/i.test(text)) {
                errors.push(text);
            }
        });
        page.on("response", (response) => {
            if (response.status() >= 400) {
                missingResources.push(`${response.status()} ${response.url()}`);
            }
        });

        await page.goto(`http://${HOST}:${port}/playwright-e2e.html`, {
            waitUntil: "domcontentloaded",
            timeout: 45000,
        });
        await page.waitForSelector("#jspsych-html-keyboard-response-stimulus", {
            timeout: 30000,
        });

        const result = await driveExperiment(page, DEFAULT_TIMEOUT_MS);
        const rowSummary = summarizeRows(result.rows);
        const requiredTasks = ["practice", "learning", "blocking", "testing", "data_save"];
        const missingTasks = requiredTasks.filter((task) => !rowSummary.tasks.includes(task));
        const fatalErrors = errors.filter(
            (error) => !String(error).includes("WebGL is not supported on this device"),
        );

        const summary = {
            completed: result.completed,
            actionCount: result.actionCount,
            rows: rowSummary.count,
            tasks: rowSummary.tasks,
            missingTasks,
            finalText: result.finalText.slice(0, 500),
            errorCount: fatalErrors.length,
            errors: fatalErrors.slice(0, 10),
            missingResources: missingResources.slice(0, 10),
        };

        console.log(JSON.stringify(summary, null, 2));

        if (!result.completed || missingTasks.length > 0 || fatalErrors.length > 0) {
            process.exitCode = 1;
        }
    } finally {
        if (browser) {
            await browser.close();
        }
        server.close();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
