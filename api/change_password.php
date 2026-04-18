<?php
// FILE: api/change_password.php
session_start();
header("Content-Type: application/json");
require "db.php";

// 1. Check kung naka-login
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "Session expired. Please login again."]);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) { 
    echo json_encode(["success" => false, "error" => "No data received"]); 
    exit; 
}

$current_pass = $data['current_password'];
$new_pass = $data['new_password'];

// 2. Kunin ang lumang hash sa database gamit ang User ID
$stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "error" => "User not found."]); 
    exit;
}

$row = $result->fetch_assoc();
$hashed_password_db = $row['password'];

// 3. Verify kung tama ang Current Password
if (password_verify($current_pass, $hashed_password_db)) {
    
    // 4. Hash ang New Password at i-update sa DB
    $new_hashed = password_hash($new_pass, PASSWORD_DEFAULT);
    
    $upd = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $upd->bind_param("si", $new_hashed, $user_id);
    
    if ($upd->execute()) { 
        echo json_encode(["success" => true, "message" => "Password changed successfully!"]); 
    } else { 
        echo json_encode(["success" => false, "error" => "Database Error: " . $conn->error]); 
    }
    
    $upd->close();

} else {
    echo json_encode(["success" => false, "error" => "Incorrect current password."]);
}

$stmt->close(); 
$conn->close();
?>