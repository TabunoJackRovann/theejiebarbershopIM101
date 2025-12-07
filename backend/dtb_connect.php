<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = "localhost";
$user = "root"; // default XAMPP username
$pass = "";     // default XAMPP password is empty
$db   = "barbershop_newdb"; // your database name

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// echo "Connected successfully!"; // this is without the connected successfully when testing connect
?>
