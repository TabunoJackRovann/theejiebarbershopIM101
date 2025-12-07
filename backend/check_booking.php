<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
require_once "dtb_connect.php";

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if ($user_id <= 0) {
    echo json_encode(['alreadyBooked' => false]);
    exit;
}

// ✅ Only check if user has a transaction with status = 'pending'
$sql = "
    SELECT t.transaction_id
    FROM transactions t
    INNER JOIN appointments a ON t.appointment_id = a.appointment_id
    WHERE a.user_id = ? AND t.status = 'pending'
    LIMIT 1
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['alreadyBooked' => true]);
} else {
    echo json_encode(['alreadyBooked' => false]);
}

$stmt->close();
$conn->close();
?>
