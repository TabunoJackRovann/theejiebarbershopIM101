<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once "dtb_connect.php";

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['appointment_id']) && isset($data['status'])) {
    $appointment_id = intval($data['appointment_id']);
    $status = mysqli_real_escape_string($conn, $data['status']);

    // update status in transactions table
    $sql = "UPDATE transactions SET status='$status' WHERE appointment_id=$appointment_id";

    if (mysqli_query($conn, $sql)) {
        echo json_encode(["success" => true, "message" => "Booking status updated"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update booking"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Missing appointment_id or status"]);
}

mysqli_close($conn);
?>
