<?php
require_once 'wrap/lib/ids.php';
$assetVersion = time();
?>

<!DOCTYPE html>
<html>

<head>
    <!-- add the title of the experiment that would be seen in the browser -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      if (typeof experimentAlias !== "undefined") {
        document.title = `${experimentAlias.toUpperCase()}`;
      } else {
        document.title = "Kamin Blocking";
      }
    });
  </script>
  <!-- favicon -->
  <link rel="icon" type="image/ico" href="./wrap/favicon.ico">
  <!-- PHP wrapper libraries -->
  <script type="text/javascript" src="./wrap/lib/validate.js?v=<?php echo $assetVersion; ?>"></script>
  <script type="text/javascript" src="./wrap/lib/jquery-3.5.1.min.js?v=<?php echo $assetVersion; ?>"></script>
  <!-- adding webGazer.js library from CDN 
   every dependancies will be hadeled automatically from the internet -->
   <script src="https://cdn.jsdelivr.net/gh/jspsych/jspsych@jspsych@7.3.3/examples/js/webgazer/webgazer.js"></script>
  <!-- jsPsych CDN (content delivery network) libraries -->
  <script src="https://unpkg.com/jspsych@7.3.3"></script>
  <link href="https://unpkg.com/jspsych@7.3.3/css/jspsych.css" rel="stylesheet" type="text/css"/>
  <!-- jsPsych Plugins (add more here) -->
  <script src="https://unpkg.com/@jspsych/plugin-survey-multi-choice@1.1.3"></script>
  <!-- default jsPsychHtmlKeyboardResponse -->
  <!-- <script src="https://unpkg.com/@jspsych/plugin-html-keyboard-response@1.1.2"></script>   -->
  <!-- custom jsPsych Plugins -->
  <!-- custom jsPsychHtmlKeyboardResponse -->
  <script src="./wrap/plugins/plugin-html-keyboard-response.js?v=<?php echo $assetVersion; ?>"></script>
  <script src="https://unpkg.com/@jspsych/plugin-preload@1.1.3"></script>
  <!-- Pinned local vendor copies for auditability; see wrap/vendor/jspsych/SHA256SUMS.txt -->
  <!-- for inegration between jsPsych and WebGazer -->
  <script src="./wrap/vendor/jspsych/extension-webgazer-1.0.3.js?v=<?php echo $assetVersion; ?>"></script>
  <!-- for initializing the camera-->
  <script src="./wrap/vendor/jspsych/plugin-webgazer-init-camera-1.0.3.js?v=<?php echo $assetVersion; ?>"></script>
  <!-- for calibration and the gaze dot-->
  <script src="./wrap/vendor/jspsych/plugin-webgazer-calibrate-1.0.3.js?v=<?php echo $assetVersion; ?>"></script>
  <!-- for validation of the calibration accuracy-->
  <script src="./wrap/vendor/jspsych/plugin-webgazer-validate-1.0.3.js?v=<?php echo $assetVersion; ?>"></script>
  
  <!-- general styling -->
  <link rel="stylesheet" type="text/css" href="./wrap/lib/style.css">
  <!-- confidence bar styling -->
  <link rel="stylesheet" type="text/css" href="./css/confidence.css">
  <!-- stimuli styling -->
  <link rel="stylesheet" type="text/css" href="./css/exp.css">

</head>

<body id='unload' onbeforeunload="return areYouSure()">
<?php
    if (isset($_GET["workerId"]) || isset($_GET["participantId"]) || isset($_GET["PROLIFIC_PID"])) {
      include_once "./wrap/include/start.php";
    } else if (isset($_GET["src_subject_id"]) || isset($_GET["ID"])) {
      include_once "./wrap/include/nda.php";
    } else {
      include_once "./wrap/include/intake.php";
    }
    ?>
</body>
<footer>
  <!-- load config first! -->
  <script type="text/javascript" src="./wrap/lib/redirect.js?v=<?php echo $assetVersion; ?>"></script>

  <script type="text/javascript" src="./exp/conf.js?v=<?php echo $assetVersion; ?>"></script>
  <!-- load wrapper dependencies -->
  <script type="text/javascript" src="./wrap/lib/fn.js?v=<?php echo $assetVersion; ?>"></script>
  <!-- load experiment dependencies -->
  <script type="text/javascript" src="./exp/fn.js?v=<?php echo $assetVersion; ?>"></script>

  <!-- now handled by include/ -->
  <!-- <script type="text/javascript" src="./exp/var.js"></script> -->

</footer>

</html>
