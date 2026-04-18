<?php
// FILE: api/signup.php

ini_set('display_errors', 0);
error_reporting(E_ALL);
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// Error Handler para JSON pa rin kahit mag-crash
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error && ($error['type'] === E_ERROR || $error['type'] === E_PARSE)) {
        if (ob_get_length()) ob_clean(); 
        echo json_encode(["status" => "error", "message" => "Server Fatal Error: " . $error['message']]);
        exit;
    }
});

ob_start();

try {
    if (!file_exists("db.php")) throw new Exception("db.php not found!");
    require "db.php"; 

    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (!$data) throw new Exception("No data received.");

    // 1. Check Duplicates (Username/Email)
    $check = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $check->bind_param("ss", $data['username'], $data['email']);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        throw new Exception("Username or Email already taken!");
    }
    $check->close();

    // 2. Insert User
    $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO users (fullname, email, phone, username, password) VALUES (?, ?, ?, ?, ?)");
    
    // NOTE: Dinagdag ko na dito yung 'phone' dahil sa fix natin kanina
    $stmt->bind_param("sssss", $data['fullname'], $data['email'], $data['phone'], $data['username'], $hashed_password);

    if ($stmt->execute()) {
        $new_user_id = $conn->insert_id;

        // 3. GENERATE RANDOM FARM ID (Format: FRM-XXXXXX)
        // Gumagawa ito ng random letters at numbers
        $random_str = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
        $farm_code = "FRM-" . $random_str;

        // 4. Insert Farm (Kasama na ang farm_code)
        $sms = !empty($data['notify_sms']) ? 1 : 0;
        $email_notif = !empty($data['notify_email']) ? 1 : 0;
        $system = !empty($data['enable_system']) ? 1 : 0;

        $stmt_farm = $conn->prepare("INSERT INTO farms (user_id, farm_code, farm_name, location, farm_type, chicken_count, units, notify_sms, notify_email, enable_system) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        // Pansinin mo, nagdagdag ako ng "s" sa bind_param para sa farm_code
        $stmt_farm->bind_param("issssisiii", 
            $new_user_id, 
            $farm_code, // <--- Eto yung bago
            $data['farm_name'], 
            $data['farm_location'], 
            $data['farm_type'], 
            $data['chicken_count'], 
            $data['units'],
            $sms, 
            $email_notif, 
            $system
        );

        if ($stmt_farm->execute()) {
            ob_clean();
            // Ibabalik natin yung Farm Code sa JS para mapakita sa user
            echo json_encode([
                "status" => "success", 
                "message" => "Success! Your Farm ID is: " . $farm_code
            ]);
        } else {
            throw new Exception("Farm Error: " . $stmt_farm->error);
        }
        $stmt_farm->close();
    } else {
        throw new Exception("User Error: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    if (ob_get_length()) ob_clean();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>