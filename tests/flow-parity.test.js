"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const mainSource = fs.readFileSync(path.join(__dirname, "..", "exp", "main.js"), "utf8");

function buildScenario(options) {
    const timeline = [];
    const flowState = {
        runCalibration: options.runCalibration,
        runMainTask: options.runMainTask,
        runChinrestExit: options.runChinrestExit,
        runCameraGateExit: options.runCameraGateExit,
        hardCameraFail: options.hardCameraFail,
    };

    const context = {
        timeline: timeline,
        preload: { id: "preload" },
        welcome: { id: "welcome" },
        eyeTrackingEnabled: true,
        cameraInit: { id: "cameraInit" },
        virtualChinrestProcedure: { id: "virtualChinrestProcedure" },
        chinrestFailureExit: {
            id: "chinrestFailureExit",
            conditional_function: () => flowState.runChinrestExit,
        },
        calibrationProcedure: { id: "calibrationProcedure" },
        cameraGateFailureExit: {
            id: "cameraGateFailureExit",
            conditional_function: () => flowState.runCameraGateExit,
        },
        readyToStart: { id: "readyToStart" },
        instructionSet: [{ id: "instructionSet" }],
        practice_procedure: { id: "practice" },
        instruction6: { id: "instruction6" },
        learning_procedure: { id: "learning" },
        blocking_procedure: { id: "blocking" },
        testing_procedure: { id: "testing" },
        ratingQuestions: false,
        screenRating1: { id: "screenRating1" },
        screenRating2: { id: "screenRating2" },
        dataSave: { id: "dataSave" },
        subjectId: "TEST",
        jsPsych: { run: () => {} },
        window: {
            kbChinrestFlowController: {
                shouldRunCalibration: () => flowState.runCalibration,
                shouldRunMainTask: () => flowState.runMainTask,
            },
            kbCameraGateState: {
                isHardFail: () => flowState.hardCameraFail,
            },
        },
    };

    vm.runInNewContext(mainSource, context, { filename: "exp/main.js" });
    return context.timeline;
}

function findWrappedNode(timeline, containsId) {
    return timeline.find(
        (entry) =>
            entry &&
            Array.isArray(entry.timeline) &&
            entry.timeline.some((child) => child && child.id === containsId),
    );
}

function testITFLOW01_ChinrestFailedOnlyExitPath() {
    const timeline = buildScenario({
        runCalibration: false,
        runMainTask: false,
        runChinrestExit: true,
        runCameraGateExit: false,
        hardCameraFail: false,
    });

    assert.strictEqual(timeline[0].id, "preload");
    assert.strictEqual(timeline[1].id, "welcome");
    assert.strictEqual(timeline[2].id, "cameraInit");
    assert.strictEqual(timeline[3].id, "virtualChinrestProcedure");
    assert.strictEqual(timeline[4].id, "chinrestFailureExit");
    assert.ok(findWrappedNode(timeline, "calibrationProcedure"));
    assert.strictEqual(timeline[6].id, "cameraGateFailureExit");
    assert.strictEqual(timeline[7].id, "readyToStart");

    const calibrationWrapper = findWrappedNode(timeline, "calibrationProcedure");
    const mainTaskWrapper = findWrappedNode(timeline, "instructionSet");
    assert.strictEqual(calibrationWrapper.conditional_function(), false);
    assert.strictEqual(mainTaskWrapper.conditional_function(), false);
    assert.strictEqual(timeline[4].conditional_function(), true);
    assert.strictEqual(timeline[6].conditional_function(), false);
}

function testITFLOW02_CameraHardFailBlocksMainTask() {
    const timeline = buildScenario({
        runCalibration: true,
        runMainTask: false,
        runChinrestExit: false,
        runCameraGateExit: true,
        hardCameraFail: true,
    });
    const calibrationWrapper = findWrappedNode(timeline, "calibrationProcedure");
    const mainTaskWrapper = findWrappedNode(timeline, "instructionSet");

    assert.strictEqual(calibrationWrapper.conditional_function(), false);
    assert.strictEqual(mainTaskWrapper.conditional_function(), false);
    assert.strictEqual(timeline[4].conditional_function(), false);
    assert.strictEqual(timeline[6].conditional_function(), true);
}

function testITFLOW03_NormalPathIncludesAllStages() {
    const timeline = buildScenario({
        runCalibration: true,
        runMainTask: true,
        runChinrestExit: false,
        runCameraGateExit: false,
        hardCameraFail: false,
    });
    const calibrationWrapper = findWrappedNode(timeline, "calibrationProcedure");
    const mainTaskWrapper = findWrappedNode(timeline, "instructionSet");

    assert.strictEqual(calibrationWrapper.conditional_function(), true);
    assert.strictEqual(mainTaskWrapper.conditional_function(), true);
    assert.strictEqual(timeline[4].conditional_function(), false);
    assert.strictEqual(timeline[6].conditional_function(), false);
}

testITFLOW01_ChinrestFailedOnlyExitPath();
testITFLOW02_CameraHardFailBlocksMainTask();
testITFLOW03_NormalPathIncludesAllStages();

console.log("IT-FLOW-01..03 passed");
