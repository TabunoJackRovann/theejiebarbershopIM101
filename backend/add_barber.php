<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once "dtb_connect.php";

$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['name']) || trim($input['name']) === '') {
    echo json_encode(['success' => false, 'message' => 'Barber name is required']);
    exit;
}

$name = trim($input['name']);

$stmt = $conn->prepare("INSERT INTO barbers (name) VALUES (?)");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
    exit;
}

$stmt->bind_param("s", $name);
if ($stmt->execute()) {
    $newId = $conn->insert_id;
    echo json_encode(['success' => true, 'barber' => ['barber_id' => $newId, 'name' => $name]]);
} else {
    echo json_encode(['success' => false, 'message' => 'Insert failed: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
