<?php
// Handle CORS
header('Access-Control-Allow-Origin: http://localhost:4321');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Simple upload test without authentication
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $uploadDir = '../../uploads/clans/';
    
    echo json_encode([
        'debug' => [
            'upload_dir' => $uploadDir,
            'real_path' => realpath($uploadDir),
            'dir_exists' => file_exists($uploadDir),
            'dir_writable' => is_writable($uploadDir),
            'files_received' => $_FILES,
            'post_data' => $_POST
        ]
    ]);
    
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $results = [];
    
    // Handle logo upload
    if (isset($_FILES['logo']) && $_FILES['logo']['error'] === UPLOAD_ERR_OK) {
        $logoFile = $_FILES['logo'];
        $logoExt = strtolower(pathinfo($logoFile['name'], PATHINFO_EXTENSION));
        $allowedExts = ['jpg', 'jpeg', 'png', 'gif'];
        
        if (in_array($logoExt, $allowedExts)) {
            $logoFilename = 'test_logo_' . time() . '.' . $logoExt;
            $logoPath = $uploadDir . $logoFilename;
            
            if (move_uploaded_file($logoFile['tmp_name'], $logoPath)) {
                $results['logo'] = [
                    'success' => true,
                    'filename' => $logoFilename,
                    'path' => $logoPath,
                    'url' => '/uploads/clans/' . $logoFilename,
                    'exists_after_upload' => file_exists($logoPath)
                ];
            } else {
                $results['logo'] = [
                    'success' => false,
                    'error' => 'Failed to move uploaded file'
                ];
            }
        } else {
            $results['logo'] = [
                'success' => false,
                'error' => 'Invalid file type'
            ];
        }
    }
    
    // Handle banner upload
    if (isset($_FILES['banner']) && $_FILES['banner']['error'] === UPLOAD_ERR_OK) {
        $bannerFile = $_FILES['banner'];
        $bannerExt = strtolower(pathinfo($bannerFile['name'], PATHINFO_EXTENSION));
        $allowedExts = ['jpg', 'jpeg', 'png', 'gif'];
        
        if (in_array($bannerExt, $allowedExts)) {
            $bannerFilename = 'test_banner_' . time() . '.' . $bannerExt;
            $bannerPath = $uploadDir . $bannerFilename;
            
            if (move_uploaded_file($bannerFile['tmp_name'], $bannerPath)) {
                $results['banner'] = [
                    'success' => true,
                    'filename' => $bannerFilename,
                    'path' => $bannerPath,
                    'url' => '/uploads/clans/' . $bannerFilename,
                    'exists_after_upload' => file_exists($bannerPath)
                ];
            } else {
                $results['banner'] = [
                    'success' => false,
                    'error' => 'Failed to move uploaded file'
                ];
            }
        } else {
            $results['banner'] = [
                'success' => false,
                'error' => 'Invalid file type'
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Upload test completed',
        'results' => $results
    ]);
    
} else {
    echo json_encode(['error' => 'Only POST method allowed']);
}
?>
