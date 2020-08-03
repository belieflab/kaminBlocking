  
  //******************************************/
 //   FOOD ALLERGY - KAMIN BLOCKING          /
//******************************************/

/* enable subjectID prompt */
// let workerID = prompt( 'subjectID' );

let links = [];
let usernameFromParamString = getParamFromURL( 'workerId' );
links[0]="index.php"+"?workerId="+usernameFromParamString; 

let qualtrics = "https://survey.az1.qualtrics.com/SE/?SID=SV_9uARDX1aXEXq1pP&Q_JFE=0&workerId=";
