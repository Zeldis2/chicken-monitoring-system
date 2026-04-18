<?php
// FILE: api/save_settings.php
session_start();
header("Content-Type: application/json");
require "db.php";

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "Session expired."]);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "error" => "No data received."]);
    exit;
}

// 1. Update USERS Table (Owner Info)
$stmt1 = $conn->prepare("UPDATE users SET fullname=?, email=?, phone=? WHERE id=?");
$stmt1->bind_param("sssi", $data['owner_name'], $data['owner_email'], $data['owner_phone'], $user_id);

if (!$stmt1->execute()) {
    echo json_encode(["success" => false, "error" => "Failed to update User info."]);
    exit;
}
$stmt1->close();

// 2. Update FARMS Table (Farm Info)
// Note: Hindi natin ina-update ang farm_code (Farm ID) dahil permanent na yun once generated.
$stmt2 = $conn->prepare("UPDATE farms SET farm_name=?, farm_type=?, chicken_count=?, location=? WHERE user_id=?");
$stmt2->bind_param("ssisi", 
    $data['farm_name'], 
    $data['farm_type'], 
    $data['number_of_chickens'], 
    $data['farm_location'], 
    $user_id
);

if ($stmt2->execute()) {
    echo json_encode(["success" => true, "message" => "Settings updated successfully!"]);
} else {
    echo json_encode(["success" => false, "error" => "Failed to update Farm info."]);
}

$stmt2->close();
$conn->close();
?>