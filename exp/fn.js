/* start the experiment */

//  increment confidence bar
function moveConfidence(event) { // function definition
  var width = document.getElementById("keyBar").style.width; // variable assignment of width property of keyBar
  // $(document).ready(function(){
  //   $("input").keydown(function(){
  //     $("input").css("background-color", "yellow");
  //   });
  //   $("input").keyup(function(){
  //     $("input").css("background-color", "pink");
  //   });
  // });
  width = parseFloat(width.slice(0, -1)); // variable reassignment
    if (width >= 99) { // set to record 100 taps
      feedbackLogic = 'You completed the task!';
      tapTotal = 100;
      console.log('complete');
      trialComplete = 1;
      width = document.getElementById("keyBar").style.width="0%"; // reset to 0
      jsPsych.finishTrial();  
      // return (event.charCode == 48 || event.charCode == 49)
    } else {
      width+= 3.34;
      console.log(width);
      totalConfidence = width;
      trialComplete = 0;
      width = document.getElementById("keyBar").style.width=String(width)+"%";
      // return (event.charCode == 48 || event.charCode == 49)
    }

  }

function saveData(name, data){
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'index.php'); // 'write_data.php' is the path to the php file described above.
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({filename: name, filedata: data}));
  }

function getParamFromURL(name) {
  name = name.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
  var regexS = "[\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

function startExperiment(){
  jsPsych.init({
      timeline: timeline,
      show_progress_bar: true,
      preload_images: [stim_shuffle, 'stimuli/+.jpg', 'stimuli/-.jpg'],
      on_finish: function(){
        // saveData("food-allergy_" + workerId, jsPsych.data.get().csv());
        saveData("kamin-blocking_" + workerId, jsPsych.data.get().csv());
      }
      //on_finish: function(){
      //jsPsych.data.get().filter([{test_part: 'test'},{test_part: 'prediction'},{test_part: 'c2_test'}]).localSave("csv", `test-self-deception-data.csv`);
          //jsPsych.data.displayData(); 
      //}
  });
}



