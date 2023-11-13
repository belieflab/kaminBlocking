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
