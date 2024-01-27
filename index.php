<?php
require_once 'jsPsychWrapper-v6.3/db/data.php';
require_once 'jsPsychWrapper-v6.3/exp/conf.php';
?>

<!DOCTYPE html>
<html>

<head>
  <!-- add the title of the experiment that would be seen in the browser -->
  <title><?php echo $experimentName; ?></title>
  <!-- PHP wrapper libraries -->
  <script type="text/javascript" src="jsPsychWrapper-v6.3/db/validate.js"></script>
  <script type="text/javascript" src="jsPsychWrapper-v6.3/db/jquery-3.5.1.min.js"></script>
  <!-- jsPsych library -->
  <script type="text/javascript" src="jsPsych/jspsych.js"></script>
  <!-- jsPsych Plugins (add more here) -->
  <script type="text/javascript" src="jsPsych/plugins/jspsych-html-keyboard-response.js"></script>
  <script type="text/javascript" src="jsPsych/plugins/jspsych-image-keyboard-response.js"></script>
  <script type="text/javascript" src="jsPsych/plugins/jspsych-video-keyboard-response.js"></script>
  <link href="jsPsych/css/jspsych.css" rel="stylesheet" type="text/css">
  <!-- general styling -->
  <link rel="stylesheet" type="text/css" href="css/style.css">
  <!-- confidence bar styling -->
  <link rel="stylesheet" type="text/css" href="css/confidence.css">
</head>

<body id='unload' onbeforeunload="return areYouSure()">
<?php
    if (isset($_GET["workerId"]) || isset($_GET["PROLIFIC_PID"]) || isset($_GET["participantId"])) {
      switch ($language) {
        case 'english':
          include_once "jsPsychWrapper-v6.3/include/consent/english.php";
          break;
  
        case 'french':
          include_once "jsPsychWrapper-v6.3/include/consent/french.php";
          break;
  
        case 'german':
          include_once "jsPsychWrapper-v6.3/include/consent/german.php";
          break;
        }
    } else if (isset($_GET["src_subject_id"])) {
      include_once "jsPsychWrapper-v6.3/include/nda.php";
    } else {
      include_once "jsPsychWrapper-v6.3/include/intake.php";
    }
  ?>
</body>
<footer>
  <!-- load wrapper dependencies -->
  <script type="text/javascript" src="jsPsychWrapper-v6.3/exp/fn.js"></script>
  <script type="text/javascript" src="jsPsychWrapper-v6.3/exp/lang.js"></script>
  <!-- load experiment dependencies -->
  <script type="text/javascript" src="exp/conf.js"></script>
  <script type="text/javascript" src="exp/fn.js"></script>
  <script type="text/javascript" src="exp/var.js"></script>
  <script>
    // show page when loaded 
    window.onload = function() {
      $(".loading").css({
        display: "none"
      });
      $(".consent").css({
        display: "block"
      });
      $(".buttonHolder").css({
        display: "block"
      });
    };
  </script>
</footer>

</html>