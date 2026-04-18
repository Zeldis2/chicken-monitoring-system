<?php
// api/db.php
$servername = "localhost"; // Palaging "localhost" 
$username = "chicgfug_hawk"; // <-- Yung username na ginawa mo kanina
$password = "5!?Kzx6=y0vI"; // <-- Yung password ng user mo
$dbname = "chicgfug_hawk"; // <-- Yung database name mo

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
?>