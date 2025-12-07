<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once "dtb_connect.php";

$barber_id = isset($_GET['barber_id']) ? intval($_GET['barber_id']) : 0;
$date = $_GET['appointment_date'] ?? '';
$time = $_GET['appointment_time'] ?? '';

if (!$barber_id || !$date || !$time) {
    echo json_encode(['success' => false, 'message' => 'Missing parameters']);
    exit;
}

// ✅ Only count pending appointments
$sql = "SELECT COUNT(*) AS count 
        FROM appointments a
        INNER JOIN transactions t ON a.appointment_id = t.appointment_id
        WHERE barber_id = ? 
          AND appointment_date = ? 
          AND appointment_time = ? 
          AND t.status = 'pending'";


$stmt = $conn->prepare($sql);
$stmt->bind_param('iss', $barber_id, $date, $time);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

$available = ($row['count'] == 0);  // true if no pending appointment exists

echo json_encode(['success' => true, 'available' => $available]);

$stmt->close();
$conn->close();
?>
