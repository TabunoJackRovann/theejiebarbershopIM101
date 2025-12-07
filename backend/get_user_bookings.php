<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once "dtb_connect.php";

$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if ($user_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid user ID', 'user' => null, 'bookings' => []]);
    exit;
}

// Fetch user info
$userStmt = $conn->prepare("SELECT user_id, name, phoneNo FROM users WHERE user_id = ?");
$userStmt->bind_param("i", $user_id);
$userStmt->execute();
$userResult = $userStmt->get_result();
$user = $userResult->fetch_assoc();
$userStmt->close();

if (!$user) {
    echo json_encode(['success' => false, 'message' => 'User not found', 'user' => null, 'bookings' => []]);
    exit;
}

// Fetch bookings with appointment info, barber, services, transaction, billing
$sql = "
    SELECT 
        a.appointment_id,
        a.appointment_date,
        a.appointment_time,
        b.name AS barber_name,
        t.status,
        IFNULL(bl.total_amount, 0) AS total_amount,
        GROUP_CONCAT(s.serv_name SEPARATOR ', ') AS services
    FROM appointments a
    INNER JOIN transactions t ON a.appointment_id = t.appointment_id
    INNER JOIN barbers b ON a.barber_id = b.barber_id
    LEFT JOIN appointment_services aps ON a.appointment_id = aps.appointment_id
    LEFT JOIN services s ON aps.service_id = s.service_id
    LEFT JOIN billing bl ON t.transaction_id = bl.transaction_id
    WHERE a.user_id = ?
    GROUP BY a.appointment_id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while ($row = $result->fetch_assoc()) {
    // Convert services string to array
    $row['services'] = $row['services'] ? explode(", ", $row['services']) : [];
    $bookings[] = $row;
}

echo json_encode([
    'success' => true,
    'user' => $user,
    'bookings' => $bookings
]);

$stmt->close();
$conn->close();
?>
