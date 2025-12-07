<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once "dtb_connect.php";

$data = json_decode(file_get_contents("php://input"), true);

if (
    !$data ||
    !isset(
        $data['user_id'],
        $data['barber_id'],
        $data['appointment_date'],
        $data['appointment_time'],
        $data['services'],
        $data['total_amount']
    )
) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$user_id = (int)$data['user_id'];
$barber_id = (int)$data['barber_id'];
$appointment_date = mysqli_real_escape_string($conn, $data['appointment_date']);
$appointment_time = mysqli_real_escape_string($conn, $data['appointment_time']);
$services = $data['services'];
$total_amount = (float)$data['total_amount'];

if (
    $user_id <= 0 ||
    $barber_id <= 0 ||
    empty($appointment_date) ||
    empty($appointment_time) ||
    !is_array($services) ||
    count($services) === 0
) {
    echo json_encode(['success' => false, 'message' => 'Missing or invalid fields']);
    exit;
}

// ✅ Check if user already has a PENDING booking
$check = $conn->prepare("
    SELECT t.transaction_id 
    FROM transactions t
    INNER JOIN appointments a ON t.appointment_id = a.appointment_id
    WHERE a.user_id = ? AND t.status = 'pending'
    LIMIT 1
");
if (!$check) {
    echo json_encode(['success' => false, 'message' => $conn->error]);
    exit;
}
$check->bind_param("i", $user_id);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    echo json_encode([
        'success' => false,
        'alreadyBooked' => true,
        'message' => 'You already have a pending booking.'
    ]);
    $check->close();
    exit;
}
$check->close();

mysqli_begin_transaction($conn);

try {
    // Insert appointment
    $stmt = $conn->prepare("INSERT INTO appointments (user_id, barber_id, appointment_date, appointment_time) VALUES (?, ?, ?, ?)");
    if (!$stmt) throw new Exception($conn->error);
    $stmt->bind_param("iiss", $user_id, $barber_id, $appointment_date, $appointment_time);
    if (!$stmt->execute()) throw new Exception($stmt->error);
    $appointment_id = $conn->insert_id;
    $stmt->close();

    // Insert appointment services
    $stmt2 = $conn->prepare("INSERT INTO appointment_services (service_id, appointment_id) VALUES (?, ?)");
    if (!$stmt2) throw new Exception($conn->error);
    foreach ($services as $s) {
        $sid = (int)$s;
        $stmt2->bind_param("ii", $sid, $appointment_id);
        if (!$stmt2->execute()) throw new Exception($stmt2->error);
    }
    $stmt2->close();

    // Insert transaction with status = pending
    $transaction_date = date('Y-m-d H:i:s');
    $status = 'pending';
    $stmt3 = $conn->prepare("INSERT INTO transactions (appointment_id, transaction_date, status) VALUES (?, ?, ?)");
    if (!$stmt3) throw new Exception($conn->error);
    $stmt3->bind_param("iss", $appointment_id, $transaction_date, $status);
    if (!$stmt3->execute()) throw new Exception($stmt3->error);
    $transaction_id = $conn->insert_id;
    $stmt3->close();

    // Insert billing
    $stmt4 = $conn->prepare("INSERT INTO billing (transaction_id, total_amount, billing_date) VALUES (?, ?, NOW())");
    if (!$stmt4) throw new Exception($conn->error);
    $stmt4->bind_param("id", $transaction_id, $total_amount);
    if (!$stmt4->execute()) throw new Exception($stmt4->error);
    $stmt4->close();

    mysqli_commit($conn);
    echo json_encode(['success' => true, 'appointment_id' => $appointment_id]);
} catch (Exception $e) {
    mysqli_rollback($conn);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

mysqli_close($conn);
?>
