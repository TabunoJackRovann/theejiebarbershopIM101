<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once "dtb_connect.php"; // using your connection file

// Read the JSON input
$data = json_decode(file_get_contents("php://input"), true);

if (
    isset($data['name']) && 
    isset($data['email']) && 
    isset($data['password']) &&
    isset($data['phoneNo'])
) {
    $name = mysqli_real_escape_string($conn, $data['name']);
    $email = mysqli_real_escape_string($conn, $data['email']);
    $password = mysqli_real_escape_string($conn, $data['password']);
    $phoneNo = mysqli_real_escape_string($conn, $data['phoneNo']);

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Check if email already exists
    $checkQuery = "SELECT * FROM users WHERE email = '$email'";
    $result = mysqli_query($conn, $checkQuery);

    if (mysqli_num_rows($result) > 0) {
        echo json_encode(["success" => false, "message" => "Email already registered"]);
        exit();
    }

    // Insert new user
    $query = "INSERT INTO users (name, email, password, phoneNo) 
              VALUES ('$name', '$email', '$hashedPassword', '$phoneNo')";

    if (mysqli_query($conn, $query)) {
        echo json_encode(["success" => true, "message" => "Registration successful"]);
    } else {
        echo json_encode(["success" => false, "message" => "Registration failed"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
}

mysqli_close($conn);
?>
