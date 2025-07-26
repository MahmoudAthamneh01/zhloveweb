<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Only POST method allowed']);
    exit;
}

$uploadDir = __DIR__ . '/../uploads/forum/';
$webPath = '/uploads/forum/';

// Create upload directory if it doesn't exist
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
$maxSize = 5 * 1024 * 1024; // 5MB
$uploadedUrls = [];

try {
    if (empty($_FILES['images'])) {
        echo json_encode(['error' => 'No images uploaded']);
        exit;
    }
    
    $files = $_FILES['images'];
    
    // Handle multiple files
    if (is_array($files['name'])) {
        for ($i = 0; $i < count($files['name']); $i++) {
            if ($files['error'][$i] !== UPLOAD_ERR_OK) {
                continue;
            }
            
            $fileName = $files['name'][$i];
            $fileType = $files['type'][$i];
            $fileSize = $files['size'][$i];
            $fileTmpName = $files['tmp_name'][$i];
            
            // Validate file
            if (!in_array($fileType, $allowedTypes)) {
                throw new Exception("نوع الملف $fileName غير مدعوم");
            }
            
            if ($fileSize > $maxSize) {
                throw new Exception("حجم الملف $fileName كبير جداً");
            }
            
            // Generate unique filename
            $extension = pathinfo($fileName, PATHINFO_EXTENSION);
            $newFileName = uniqid('forum_', true) . '.' . $extension;
            $filePath = $uploadDir . $newFileName;
            
            if (move_uploaded_file($fileTmpName, $filePath)) {
                $uploadedUrls[] = $webPath . $newFileName;
            } else {
                throw new Exception("فشل في رفع الملف $fileName");
            }
        }
    } else {
        // Single file
        if ($files['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('خطأ في رفع الملف');
        }
        
        $fileName = $files['name'];
        $fileType = $files['type'];
        $fileSize = $files['size'];
        $fileTmpName = $files['tmp_name'];
        
        // Validate file
        if (!in_array($fileType, $allowedTypes)) {
            throw new Exception("نوع الملف $fileName غير مدعوم");
        }
        
        if ($fileSize > $maxSize) {
            throw new Exception("حجم الملف $fileName كبير جداً");
        }
        
        // Generate unique filename
        $extension = pathinfo($fileName, PATHINFO_EXTENSION);
        $newFileName = uniqid('forum_', true) . '.' . $extension;
        $filePath = $uploadDir . $newFileName;
        
        if (move_uploaded_file($fileTmpName, $filePath)) {
            $uploadedUrls[] = $webPath . $newFileName;
        } else {
            throw new Exception("فشل في رفع الملف $fileName");
        }
    }
    
    echo json_encode([
        'success' => true,
        'urls' => $uploadedUrls,
        'message' => 'تم رفع الصور بنجاح'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?>
