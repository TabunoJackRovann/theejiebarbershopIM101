<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once "dtb_connect.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$user_id = (int)$data['user_id'];

if ($user_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid user ID']);
    exit;
}

mysqli_begin_transaction($conn);

try {
    // ✅ Find appointment with PENDING transaction for this user
    $stmt = $conn->prepare("
        SELECT a.appointment_id, t.transaction_id
        FROM appointments a
        INNER JOIN transactions t ON a.appointment_id = t.appointment_id
        WHERE a.user_id = ? AND t.status = 'pending'
        LIMIT 1
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($appointment_id, $transaction_id);
    $stmt->fetch();
    $stmt->close();

    if (!$transaction_id) {
        throw new Exception("No pending booking found for this user.");
    }

    // ✅ Update transaction status to 'cancelled'
    $status = "cancelled";
    $stmt = $conn->prepare("UPDATE transactions SET status = ? WHERE transaction_id = ?");
    $stmt->bind_param("si", $status, $transaction_id);
    $stmt->execute();
    $stmt->close();

    mysqli_commit($conn);

    echo json_encode(['success' => true, 'message' => 'Booking cancelled successfully.']);
} catch (Exception $e) {
    mysqli_rollback($conn);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

mysqli_close($conn);
?>
