  
  //******************************************/
 //   FOOD ALLERGY - KAMIN BLOCKING          /
//******************************************/

/* enable subjectID prompt */
// let workerID = prompt( 'subjectID' );

let links = [];
let workerID = getParamFromURL( 'workerId' );
links[0]="index.php"+"?workerId="+workerID; 

let qualtrics = "https://yalesurvey.ca1.qualtrics.com/jfe/form/SV_0U3wW3G3HfY8Ie1?Q_JFE=qdg&workerId=";

