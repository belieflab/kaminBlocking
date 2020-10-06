// function to store subject number on submit
let workerId;


// let sexMale;
// let sexFemale;
// let age;
let ageAtAssessment;
// let age;
let sexAtBirth;
// let currentAge;
// let handedness;
// let antihandedness;
// let EasyKey_uCase;
// let HardKey_uCase;
let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
let yyyy = today.getFullYear();
today = mm + '/' + dd + '/' + yyyy;

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

function sexFinder() {
    // document.getElementById("sex").value = sex;
    if (document.getElementById("male").checked === true) {
        sexAtBirth = "M";
    } else if (document.getElementById("female").checked === true) {
        sexAtBirth = "F";
    }
}

function ageFinder() {
    // document.getElementById("sex").value = sex;
    if (document.getElementById("age").value !== '') {
        let currentAge = document.getElementById("age").value;
        ageAtAssessment = parseInt(currentAge);
    } else {
        alert("please enter your current age");

    }
}



function submitIntake() {
    let subjectID = document.getElementById("subjectid").value;
    let siteID = document.getElementById("siteid");
    

    switch(siteID.options[siteID.selectedIndex].value){
        case "Maryland":
            siteNumber = "10";
            break;
        case "Northwestern":
            siteNumber = "20";
            break;
        case "Temple":
            siteNumber = "30";
            break;
        case "Georgia":
            siteNumber = "40";
            break;
        case "Yale":
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
        workerId = parseInt(siteNumber + subjectID);
        validateIntake();
    }
}

// function submitIntake() {
//     // if (document.getElementById("age").value !== '') {
//     //     currentAge = document.getElementById("age").value;
//     //     ageAtAssessment = currentAge;
//     // } else {
//     //     alert("please enter your current age");

//     // }
//     let subjectID = document.getElementById("subjectid").value;
//     // let rightHandedness = document.getElementById("rightHanded").checked;
//     // let leftHandedness = document.getElementById("leftHanded").checked;
//     let siteID = document.getElementById("siteid").value;
//     // let currentAge = document.getElementById("age").value;
//     // let sexMale = document.getElementById("male").value;
//     // let sexFemale = document.getElementById("female").value;
//     // let sex = document.getElementsByName("male").value;
//     // let sexAtBirth;
//     // let sexAtBirth = document.getElementById("result").value = sex;

//     // if (sex === 'male') {
//     //     sexAtBirth = "M";
//     // } else if (sex === 'female') {
//     //     sexAtBirth = "F";
//     // }
//     // if(rightHandedness == true) {
//     //     handedness = "R";
//     // } else if(leftHandedness == true) {
//     //     handedness = "L"
//     // } 
//     switch(siteID.options[siteID.selectedIndex].value){
//         case "Maryland":
//             siteNumber = "10";
//             break;
//         case "Northwestern":
//             siteNumber = "20";
//             break;
//         case "Temple":
//             siteNumber = "30";
//             break;
//         case "Georgia":
//             siteNumber = "40";
//             break;
//         case "Yale":
//             siteNumber = "50";
//             break;
//         case "Emory":
//             siteNumber = "60";
//             break;
//         default:
//             siteNumber = "00";
//     }
//     // if(siteID.options[siteID.selectedIndex].value == "Yale") {
//     //     siteNumber = "10"
//     // }
//     if (subjectID === "") {
//         alert("Please enter a valid subjectid");
//     } else {
//         alert("your subjectid is " + siteNumber + subjectID);
//         // ageAtAssessment = parseInt(currentAge);
//         workerId = parseInt(siteNumber + subjectID);


//         // ageAtAssessment = parseInt(currentAge);
//         // ageAtAssessment = parseInt(currentAge);
//         // sexAtBirth = sex;

//         // validateIntake();
//         // checkHandedness();
//     }

//     // if (currentAge !== '') {
//     //     ageAtAssessment = document.getElementById("age").value;

//     // } else {
//     //     alert("please enter your current age");
//     // }
// }