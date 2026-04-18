<?php
// FILE: api/get_settings.php
session_start();
header("Content-Type: application/json");
require "db.php";

// 1. Check kung naka-login
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["redirect" => true]);
    exit;
}

$user_id = $_SESSION['user_id'];

// 2. Kunin ang data sa USERS table at FARMS table (JOIN)
$sql = "SELECT 
            u.fullname, u.email, u.phone, u.username, 
            f.farm_name, f.farm_code, f.farm_type, f.chicken_count, f.location 
        FROM users u 
        LEFT JOIN farms f ON u.id = f.user_id 
        WHERE u.id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // 3. Ibalik ang data sa JSON format na tugma sa HTML IDs mo
    echo json_encode([
        "found" => true,
        "username" => $row['username'],
        "farm_name" => $row['farm_name'],
        "farm_id" => $row['farm_code'], // farm_code ang tawag sa DB, farm_id sa HTML
        "farm_type" => $row['farm_type'],
        "number_of_chickens" => $row['chicken_count'],
        "farm_location" => $row['location'],
        "owner_name" => $row['fullname'],
        "owner_email" => $row['email'],
        "owner_phone" => $row['phone']
    ]);
} else {
    echo json_encode(["found" => false]);
}

$stmt->close();
$conn->close();
?>