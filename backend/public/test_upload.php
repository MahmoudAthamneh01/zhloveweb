<?php
// Simple image upload test
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['test_image'])) {
    $uploadDir = '../uploads/clans/';
    
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $file = $_FILES['test_image'];
    $filename = 'test_' . time() . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
    $uploadPath = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        echo json_encode([
            'success' => true,
            'message' => 'تم رفع الصورة بنجاح',
            'path' => $uploadPath,
            'url' => '/uploads/clans/' . $filename
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'فشل في رفع الصورة'
        ]);
    }
    exit;
}
?>

<!DOCTYPE html>
<html dir="rtl">
<head>
    <title>اختبار رفع الصور</title>
    <meta charset="utf-8">
</head>
<body>
    <h1>اختبار رفع الصور</h1>
    
    <form id="uploadForm" enctype="multipart/form-data">
        <input type="file" name="test_image" accept="image/*" required>
        <button type="submit">رفع الصورة</button>
    </form>
    
    <div id="result"></div>
    
    <script>
        document.getElementById('uploadForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData();
            const fileInput = this.querySelector('input[type="file"]');
            formData.append('test_image', fileInput.files[0]);
            
            try {
                const response = await fetch('', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                document.getElementById('result').innerHTML = JSON.stringify(result, null, 2);
            } catch (error) {
                document.getElementById('result').innerHTML = 'خطأ: ' + error.message;
            }
        });
    </script>
</body>
</html>
