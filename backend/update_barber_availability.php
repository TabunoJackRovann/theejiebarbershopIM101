<?php
// update_barber_availability.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'dtb_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // preflight
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$barber_id = isset($input['barber_id']) ? intval($input['barber_id']) : 0;
$availability = isset($input['availability']) ? intval($input['availability']) : null;

if ($barber_id <= 0 || !in_array($availability, [0,1], true)) {
    echo json_encode(['success' => false, 'message' => 'Invalid barber_id or availability (expected 0 or 1)']);
    $conn->close();
    exit;
}

$stmt = $conn->prepare("UPDATE barbers SET availability = ? WHERE barber_id = ?");
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => $conn->error]);
    $conn->close();
    exit;
}
$stmt->bind_param("ii", $availability, $barber_id);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Availability updated']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update: ' . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
