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
if (!isset($input['barber_id']) || !isset($input['name'])) {
    echo json_encode(['success' => false, 'message' => 'Missing barber_id or name']);
    exit;
}

$barber_id = intval($input['barber_id']);
$name = trim($input['name']);

if ($barber_id <= 0 || $name === '') {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$stmt = $conn->prepare("UPDATE barbers SET name = ? WHERE barber_id = ?");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
    exit;
}
$stmt->bind_param("si", $name, $barber_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows >= 0) {
        echo json_encode(['success' => true, 'message' => 'Barber updated', 'barber' => ['barber_id' => $barber_id, 'name' => $name]]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No changes made']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Update failed: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
