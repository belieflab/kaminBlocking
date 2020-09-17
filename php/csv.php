<?php
$post_data = json_decode(file_get_contents('php://input'), true); 
// the directory "data" must be writable by the server
$csv = "data/".$post_data['filename'].".csv"; 
$csvData = $post_data['filedata'];
// write the file to disk
file_put_contents($csv, $csvData);
?>