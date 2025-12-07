<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include 'dtb_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['billing_id'], $data['payment_method'])) {
    echo json_encode(["success" => false, "message" => "Missing billing_id or payment_method"]);
    exit();
}

$billing_id = intval($data['billing_id']);
$payment_method = trim($data['payment_method']);

if ($billing_id <= 0 || empty($payment_method)) {
    echo json_encode(["success" => false, "message" => "Invalid billing_id or payment_method"]);
    exit();
}

// Check if payment already exists
$check_sql = "SELECT payment_id FROM payments WHERE billing_id = $billing_id LIMIT 1";
$check_result = $conn->query($check_sql);

if ($check_result && $check_result->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Payment already recorded for this billing"]);
    $conn->close();
    exit();
}

// Get total amount from billing
$billingQuery = "SELECT total_amount FROM billing WHERE billing_id = $billing_id LIMIT 1";
$billingResult = $conn->query($billingQuery);

if ($billingResult && $billingResult->num_rows > 0) {
    $billing = $billingResult->fetch_assoc();
    $amount_paid = floatval($billing['total_amount']);

    $insert_sql = "INSERT INTO payments (billing_id, payment_method, amount_paid, date_paid)
                   VALUES ($billing_id, '$payment_method', $amount_paid, NOW())";

    if ($conn->query($insert_sql) === TRUE) {
        echo json_encode(["success" => true, "message" => "Payment recorded successfully!"]);
    } else {
        // Return actual SQL error
        echo json_encode(["success" => false, "message" => "Error inserting payment: " . $conn->error]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Billing record not found"]);
}

$conn->close();
?>
