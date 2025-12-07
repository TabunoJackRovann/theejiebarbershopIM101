<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once "dtb_connect.php";

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['email']) && isset($data['password'])) {
    $email = mysqli_real_escape_string($conn, $data['email']);
    $password = $data['password'];

    $sql = "SELECT * FROM users WHERE email='$email'";
    $result = mysqli_query($conn, $sql);

    if ($result && mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);

        // Compare hashed password
        if (password_verify($password, $user['password'])) {

            echo json_encode([
                "success" => true,
                "message" => "Login successful",
                "user" => [
                    "user_id" => $user['user_id'],
                    "name" => $user['name'],
                    "email" => $user['email'],
                    "role" => $user['role']
                ]
            ]);

        } else {
            echo json_encode(["success" => false, "message" => "Invalid password"]);
        }

    } else {
        echo json_encode(["success" => false, "message" => "No account found with that email"]);
    }

} else {
    echo json_encode(["success" => false, "message" => "Email and password required"]);
}

mysqli_close($conn);
?>
