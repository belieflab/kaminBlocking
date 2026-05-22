<?php
 // Ensure the response is treated as JSON
header('Content-Type: application/json');

$post_data = json_decode(file_get_contents('php://input'), true);
$response = ['success' => false];

if ($post_data !== null) {
    $name = "data/" . $post_data['filename'] . ".csv";
    $data = $post_data['filedata'];
    if (file_put_contents($name, $data) !== false) {
        $response['success'] = true;
    }
}

// Send the JSON response back to the client
echo json_encode($response); 




?>


