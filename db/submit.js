// function to store subject number on submit
let workerID;

// let handedness;
// let antihandedness;
// let EasyKey_uCase; 
// let HardKey_uCase;

function validateIntake() {
    let intake = document.getElementById("intake");
    let consent = document.getElementById("nextButton");
    if (intake.style.display === "none") {
      intake.style.display = "block";
    } else {
      intake.style.display = "none";
      consent.style.display = "block";
    }
  }

function submitIntake() {
    let subjectID = document.getElementById("subjectid").value;
    // let rightHandedness = document.getElementById("rightHanded").checked;
    // let leftHandedness = document.getElementById("leftHanded").checked;
    let siteID = document.getElementById("siteid");
   
    // if(rightHandedness == true) {
    //     handedness = "right";
    // } else if(leftHandedness == true) {
    //     handedness = "left"
    // } 

    switch(siteID.options[siteID.selectedIndex].value){
        case "Yale":
            siteNumber = "10";
            break;
        case "Georgia":
            siteNumber = "20";
            break;
        case "Northwestern":
            siteNumber = "30";
            break;
        case "Temple":
            siteNumber = "40";
            break;
        case "Maryland":
            siteNumber = "50";
            break;
        case "Emory":
            siteNumber = "60";
            break;
        default:
            siteNumber = "00";
    }

    // if(siteID.options[siteID.selectedIndex].value == "Yale") {
    //     siteNumber = "10"
    // }

    if(subjectID == "") {
        alert("Please enter a valid subjectid")
    } else {
        alert("your subjectid is " + siteNumber + subjectID);
        workerID = parseInt(siteNumber + subjectID);
        validateIntake();
        // checkHandedness();
    }
}



