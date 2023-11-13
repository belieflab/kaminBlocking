<?php
// check for configuration file on server; if does not exist, set db_connection_status to false.
if ($_GET["src_subject_id"]) {
 // these are omnibus data base variables which will get passed from participant portal
 $studyId = $_GET["studyId"];
 $candidateId = $_GET["candidateId"];
 // these are NDA required variables which will get passed from participant portal
 $subjectKey = $_GET["subjectkey"];
 $consortId = $_GET["src_subject_id"];
 $sexAtBirth = $_GET["sex"];
 $institutionAlias = $_GET["site"];
 $ageInMonths = $_GET["interview_age"];
 $groupStatus = $_GET["phenotype"];
 $visit = $_GET["visit"];
} 

/**
 * Get the hash of the current git HEAD
 * @param str $branch The git branch to check
 * @return mixed Either the hash or a boolean false
 */
function get_current_git_commit( $branch='master' ) {
  if ( $hash = file_get_contents( sprintf( '.git/refs/heads/%s', $branch ) ) ) {
    return "version: ".strval(substr(trim($hash),-7));
  } else {
    return false;
  }
}