<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once "dtb_connect.php";

$sql = "SELECT service_id, serv_name, amount FROM services";
$result = $conn->query($sql);

$services = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $services[] = $row;
    }
}

echo json_encode($services);

$conn->close();
?>
