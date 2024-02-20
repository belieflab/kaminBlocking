<?php
require_once 'wrap/lib/ids.php';
?>

<!DOCTYPE html>
<html>

<head>
    <!-- add the title of the experiment that would be seen in the browser -->
    <script>
    document.addEventListener('DOMContentLoaded', () => {
      document.title = `${experimentAlias.toUpperCase()}`;
    });
  </script>
  <!-- favicon -->
  <link rel="icon" type="image/ico" href="./wrap/favicon.ico">
  <!-- PHP wrapper libraries -->
  <script type="text/javascript" src="./wrap/lib/validate.js"></script>
  <script type="text/javascript" src="./wrap/lib/jquery-3.5.1.min.js"></script>
  <!-- jsPsych library -->
  <script type="text/javascript" src="./wrap/jspsych/jspsych.js"></script>
  <!-- jsPsych Plugins (add more here) -->
  <script type="text/javascript" src="./wrap/jspsych/plugins/jspsych-html-keyboard-response.js"></script>
  <script type="text/javascript" src="./wrap/jspsych/plugins/jspsych-image-keyboard-response.js"></script>
  <script type="text/javascript" src="./wrap/jspsych/plugins/jspsych-video-keyboard-response.js"></script>
  <script type="text/javascript" src="./wrap/jspsych/plugins/jspsych-survey-multi-choice.js"></script>
  <link href="./wrap/jspsych/css/jspsych.css" rel="stylesheet" type="text/css">
  <!-- general styling -->
  <link rel="stylesheet" type="text/css" href="./wrap/lib/style.css">
  <!-- confidence bar styling -->
  <link rel="stylesheet" type="text/css" href="./css/exp.css">
</head>

<body id='unload' onbeforeunload="return areYouSure()">
<?php
    if (isset($_GET["workerId"]) || isset($_GET["PROLIFIC_PID"]) || isset($_GET["participantId"])) {
      include_once "./wrap/include/consent.php";
    } else if (isset($_GET["src_subject_id"])) {
      include_once "./wrap/include/nda.php";
    } else {
      include_once "./wrap/include/intake.php";
    }
  ?>
</body>
<footer>
  <!-- load config first! -->
  <script type="text/javascript" src="./exp/conf.js"></script>
  <!-- load wrapper dependencies -->
  <script type="text/javascript" src="./wrap/lib/fn.js"></script>
  <!-- load experiment dependencies -->
  <!-- <script type="text/javascript" src="exp/conf.js"></script> -->
  <script type="text/javascript" src="./exp/fn.js"></script>
  <script type="text/javascript" src="./exp/lang.js"></script>

  <script type="text/javascript" src="./exp/var.js"></script>

</footer>

</html>