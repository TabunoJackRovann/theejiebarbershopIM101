<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once "dtb_connect.php";

$sql = "SELECT barber_id, name, availability FROM barbers";
$result = $conn->query($sql);

$barbers = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $barbers[] = [
            "barber_id" => $row["barber_id"],
            "name" => $row["name"],
            "availability" => (int)$row["availability"] // 1 = available, 0 = unavailable
        ];
    }
}

echo json_encode($barbers);

$conn->close();
?>
