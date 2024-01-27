//  increment confidence bar
const moveConfidence = () => { // function definition
  let width = document.getElementById("keyBar").style.width; // variable assignment of width property of keyBar

  width = parseFloat(width.slice(0, -1)); // variable reassignment
    if (width >= 99) { // set to record 100 taps
      trialComplete = 1;
      width = document.getElementById("keyBar").style.width="0%"; // reset to 0
      jsPsych.finishTrial();  
      // return (event.charCode == 48 || event.charCode == 49)
    } else {
      width+= 3.70; // approximation to reach 99.9% confidence in 3s
      console.log(width);
      totalConfidence = width;
      trialComplete = 0;
      width = document.getElementById("keyBar").style.width=String(width)+"%";
      // return (event.charCode == 48 || event.charCode == 49)
    }

  }
