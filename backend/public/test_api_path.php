<?php
// Create a simple test for the exact path used in clan_api.php
$uploadDir = '../../uploads/clans/';

echo "Testing upload directory path:<br>";
echo "Relative path: $uploadDir<br>";
echo "Real path: " . realpath($uploadDir) . "<br>";
echo "Directory exists: " . (file_exists($uploadDir) ? 'YES' : 'NO') . "<br>";
echo "Directory writable: " . (is_writable($uploadDir) ? 'YES' : 'NO') . "<br>";

// List current files
if (file_exists($uploadDir)) {
    $files = scandir($uploadDir);
    echo "<br>Current files in directory:<br>";
    foreach ($files as $file) {
        if ($file != '.' && $file != '..') {
            echo "- $file<br>";
        }
    }
}

// Try to create a test file
$testFile = $uploadDir . 'api_test_' . time() . '.txt';
if (file_put_contents($testFile, 'API test')) {
    echo "<br>✅ Successfully created test file: $testFile<br>";
    unlink($testFile);
    echo "Test file deleted.<br>";
} else {
    echo "<br>❌ Failed to create test file: $testFile<br>";
}
?>
