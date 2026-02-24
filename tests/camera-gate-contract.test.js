"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const timelineFile = fs.readFileSync(
    path.join(__dirname, "..", "exp", "timeline-webgazer.js"),
    "utf8",
);

const requiredTaskTags = [
    "virtual_chinrest_gate",
    "virtual_chinrest",
    "camera_quality_gate",
    "calibration",
    "validation",
    "validation_result",
    "chinrest_failure_exit",
    "camera_gate_failure_exit",
];

requiredTaskTags.forEach((taskTag) => {
    assert.ok(
        timelineFile.includes(`task: "${taskTag}"`),
        `Missing required task tag: ${taskTag}`,
    );
});

console.log("Camera-gate contract task tags passed");
