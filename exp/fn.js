/* start the experiment */
function startExperiment(){
    jsPsych.init({
        timeline: timeline,
        show_progress_bar: true,
        preload_images: [stim_shuffle],
        on_finish: function(){ saveData("food-allergy_" + workerID, jsPsych.data.get().csv()); }
        //on_finish: function(){
        //jsPsych.data.get().filter([{test_part: 'test'},{test_part: 'prediction'},{test_part: 'c2_test'}]).localSave("csv", `test-self-deception-data.csv`);
            //jsPsych.data.displayData(); 
        //}
    });
}

function saveData(name, data){
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'index.php'); // 'write_data.php' is the path to the php file described above.
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({filename: name, filedata: data}));
  }


function getParamFromURL(name){
  name = name.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
  var regexS = "[\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

// Take the user to a random URL, selected from the pool below 

function randomizeURL(linkArray) {
	window.location=linkArray[Math.floor(Math.random()*linkArray.length)];
}



