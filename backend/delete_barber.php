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
if (!isset($input['barber_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing barber_id']);
    exit;
}

$barber_id = intval($input['barber_id']);
if ($barber_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid barber_id']);
    exit;
}

// Safety check: do not delete barber with existing appointments
$chk = $conn->prepare("SELECT COUNT(*) AS cnt FROM appointments WHERE barber_id = ? LIMIT 1");
$chk->bind_param("i", $barber_id);
$chk->execute();
$res = $chk->get_result();
$row = $res->fetch_assoc();
$chk->close();

if ($row && intval($row['cnt']) > 0) {
    echo json_encode(['success' => false, 'message' => 'Cannot delete barber with existing appointments']);
    $conn->close();
    exit;
}

$stmt = $conn->prepare("DELETE FROM barbers WHERE barber_id = ? LIMIT 1");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
    exit;
}
$stmt->bind_param("i", $barber_id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Barber deleted']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Barber not found']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Delete failed: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
