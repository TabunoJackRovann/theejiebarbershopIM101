<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once "dtb_connect.php";

// Fetch all bookings with appointment info, barber, services, transaction, billing, and user
$sql = "
    SELECT 
    a.appointment_id,
    a.appointment_date,
    a.appointment_time,
    u.user_id,
    u.name AS customer_name,
    u.phoneNo,
    b.name AS barber_name,
    t.status,
    IFNULL(bl.billing_id, 0) AS billing_id,
    IFNULL(bl.total_amount, 0) AS total_amount,
    p.payment_id,
    p.payment_method,
    p.amount_paid,
    p.date_paid,
    GROUP_CONCAT(s.serv_name SEPARATOR ', ') AS services
    FROM appointments a
    INNER JOIN users u ON a.user_id = u.user_id
    INNER JOIN transactions t ON a.appointment_id = t.appointment_id
    INNER JOIN barbers b ON a.barber_id = b.barber_id
    LEFT JOIN appointment_services aps ON a.appointment_id = aps.appointment_id
    LEFT JOIN services s ON aps.service_id = s.service_id
    LEFT JOIN billing bl ON t.transaction_id = bl.transaction_id
    LEFT JOIN payments p ON bl.billing_id = p.billing_id
    GROUP BY a.appointment_id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
";


$result = $conn->query($sql);

$bookings = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Convert services string to array
        $row['services'] = $row['services'] ? explode(", ", $row['services']) : [];
        $bookings[] = $row;
    }
}

echo json_encode([
    'success' => true,
    'bookings' => $bookings
]);

$conn->close();
?>
