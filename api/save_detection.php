<?php
// api/save_detection.php
// Ito ang tatawagin ng Python script niyo sa Raspberry Pi / Computer
header("Content-Type: application/json");
require "db.php";

// 🔥 Pilitin ang Database (MySQL) na gumamit ng Philippine Time (UTC+8)
$conn->query("SET time_zone = '+08:00';");

// 🔥 I-set din ang PHP para parehas sila
date_default_timezone_set('Asia/Manila');

// Tumatanggap ng JSON data
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if(isset($input['status'])) {
    $status = $input['status'];     // Example: "Critical"
    $symptoms = $input['symptoms']; // Example: "Coughing"
    $remarks = $input['remarks'];   // Example: "Loud noise detected"
    $zone = isset($input['zone']) ? $input['zone'] : ''; // Example: "A"
    
    // DINAGDAG ANG DETECTION TYPE (Visual, Vocal, o Both)
    $detection_type = isset($input['detection_type']) ? $input['detection_type'] : 'Unknown';

    // UPDATED QUERY: Isinama ang detection_type column
    $stmt = $conn->prepare("INSERT INTO detection_history (detection_type, health_status, symptoms, remarks, zone) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("sssss", $detection_type, $status, $symptoms, $remarks, $zone);

    if ($stmt->execute()) {
        echo json_encode(["message" => "Record saved successfully"]);
    } else {
        echo json_encode(["error" => "Database error: " . $stmt->error]);
    }
} else {
    echo json_encode(["error" => "Invalid data received"]);
}
?>