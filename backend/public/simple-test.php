<?php
header('Content-Type: application/json');
echo json_encode([
    'message' => 'Simple PHP test working!',
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion()
]);
?> 