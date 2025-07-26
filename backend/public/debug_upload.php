<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>🔍 اختبار رفع الملفات</h2>";

// Test upload directory
$uploadDir = '../../uploads/clans/';
echo "<p><strong>مجلد الرفع:</strong> $uploadDir</p>";
echo "<p><strong>المسار الحقيقي:</strong> " . realpath($uploadDir) . "</p>";
echo "<p><strong>المجلد موجود:</strong> " . (file_exists($uploadDir) ? '✅ نعم' : '❌ لا') . "</p>";
echo "<p><strong>المجلد قابل للكتابة:</strong> " . (is_writable($uploadDir) ? '✅ نعم' : '❌ لا') . "</p>";

// Test file creation
$testFile = $uploadDir . 'test_' . time() . '.txt';
echo "<p><strong>مسار ملف الاختبار:</strong> $testFile</p>";

if (file_put_contents($testFile, 'Test content')) {
    echo "<p style='color: green;'>✅ تم إنشاء ملف الاختبار بنجاح!</p>";
    echo "<p><strong>الملف موجود:</strong> " . (file_exists($testFile) ? 'نعم' : 'لا') . "</p>";
    
    // Clean up
    unlink($testFile);
    echo "<p>تم حذف ملف الاختبار.</p>";
} else {
    echo "<p style='color: red;'>❌ فشل في إنشاء ملف الاختبار!</p>";
}

// Test PHP upload settings
echo "<h3>⚙️ إعدادات PHP للرفع:</h3>";
echo "<p><strong>upload_max_filesize:</strong> " . ini_get('upload_max_filesize') . "</p>";
echo "<p><strong>post_max_size:</strong> " . ini_get('post_max_size') . "</p>";
echo "<p><strong>max_file_uploads:</strong> " . ini_get('max_file_uploads') . "</p>";
echo "<p><strong>file_uploads:</strong> " . (ini_get('file_uploads') ? 'مفعل' : 'معطل') . "</p>";

// Test FILES array if present
if (!empty($_FILES)) {
    echo "<h3>📤 الملفات المرفوعة:</h3>";
    echo "<pre>";
    print_r($_FILES);
    echo "</pre>";
    
    foreach ($_FILES as $fieldName => $file) {
        if ($file['error'] === UPLOAD_ERR_OK) {
            $filename = 'test_upload_' . time() . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
            $destination = $uploadDir . $filename;
            
            echo "<p>محاولة نقل {$file['tmp_name']} إلى $destination</p>";
            
            if (move_uploaded_file($file['tmp_name'], $destination)) {
                echo "<p style='color: green;'>✅ تم رفع الملف بنجاح!</p>";
                echo "<p><strong>الملف موجود:</strong> " . (file_exists($destination) ? 'نعم' : 'لا') . "</p>";
                echo "<p><strong>حجم الملف:</strong> " . filesize($destination) . " بايت</p>";
            } else {
                echo "<p style='color: red;'>❌ فشل في رفع الملف!</p>";
            }
        } else {
            echo "<p style='color: red;'>خطأ في الرفع: " . $file['error'] . "</p>";
        }
    }
}
?>

<form method="post" enctype="multipart/form-data">
    <h3>🧪 اختبار رفع ملف:</h3>
    <input type="file" name="test_file" accept="image/*">
    <button type="submit">رفع للاختبار</button>
</form>
