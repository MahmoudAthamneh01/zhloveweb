import React, { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle, Eye, Tags, Users, Map, Clock } from 'lucide-react';

interface ReplayUploadProps {
  onUpload?: (replayData: UploadReplayData) => void;
  onCancel?: () => void;
  maxFileSize?: number; // in MB
  className?: string;
}

interface UploadReplayData {
  file: File;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  allowComments: boolean;
  gameInfo: {
    map: string;
    mode: string;
    players: Array<{
      name: string;
      faction: string;
      result: string;
    }>;
  };
}

const ReplayUpload: React.FC<ReplayUploadProps> = ({
  onUpload,
  onCancel,
  maxFileSize = 50,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'upload' | 'details' | 'preview'>('upload');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'showcase',
    tags: [] as string[],
    isPublic: true,
    allowComments: true,
    gameInfo: {
      map: '',
      mode: 'multiplayer',
      players: [] as Array<{
        name: string;
        faction: string;
        result: string;
      }>
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file
    const validExtensions = ['.rep', '.replay'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      setErrors({ file: 'يجب أن يكون الملف من نوع .rep أو .replay' });
      return;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      setErrors({ file: `حجم الملف يجب أن يكون أقل من ${maxFileSize} MB` });
      return;
    }

    setUploadedFile(file);
    setErrors({});
    
    // Parse file name to extract potential info
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    if (!formData.title) {
      setFormData(prev => ({ ...prev, title: fileName }));
    }
    
    setCurrentStep('details');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'العنوان مطلوب';
    }
    
    if (!formData.gameInfo.map.trim()) {
      newErrors.map = 'اسم الخريطة مطلوب';
    }
    
    if (formData.tags.length === 0) {
      newErrors.tags = 'يجب إضافة تاق واحد على الأقل';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedFile || !validateForm()) {
      return;
    }
    
    setUploading(true);
    setCurrentStep('preview');
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          onUpload?.({
            file: uploadedFile,
            ...formData
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addPlayer = () => {
    setFormData(prev => ({
      ...prev,
      gameInfo: {
        ...prev.gameInfo,
        players: [...prev.gameInfo.players, { name: '', faction: 'USA', result: 'win' }]
      }
    }));
  };

  const removePlayer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gameInfo: {
        ...prev.gameInfo,
        players: prev.gameInfo.players.filter((_, i) => i !== index)
      }
    }));
  };

  const updatePlayer = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      gameInfo: {
        ...prev.gameInfo,
        players: prev.gameInfo.players.map((player, i) => 
          i === index ? { ...player, [field]: value } : player
        )
      }
    }));
  };

  if (currentStep === 'upload') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">رفع ريبلاي جديد</h2>
          <p className="text-muted-foreground">شارك أفضل مبارياتك مع المجتمع</p>
        </div>

        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Upload className="text-muted-foreground" size={32} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                اسحب وأفلت ملف الريبلاي هنا
              </h3>
              <p className="text-muted-foreground mb-4">
                أو انقر لاختيار ملف من جهازك
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary"
              >
                اختيار ملف
              </button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>الملفات المدعومة: .rep, .replay</p>
              <p>الحد الأقصى للحجم: {maxFileSize} MB</p>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".rep,.replay"
          onChange={handleFileInput}
          className="hidden"
        />

        {errors.file && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-alert-red">
            <AlertCircle size={16} />
            <span className="text-sm">{errors.file}</span>
          </div>
        )}

        {onCancel && (
          <div className="flex justify-center">
            <button onClick={onCancel} className="btn btn-outline">
              إلغاء
            </button>
          </div>
        )}
      </div>
    );
  }

  if (currentStep === 'details') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">تفاصيل الريبلاي</h2>
          <button
            onClick={() => setCurrentStep('upload')}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={24} />
          </button>
        </div>

        {uploadedFile && (
          <div className="bg-muted rounded-lg p-4 flex items-center space-x-3 rtl:space-x-reverse">
            <FileText className="text-tactical-green" size={20} />
            <div className="flex-1">
              <div className="font-medium text-foreground">{uploadedFile.name}</div>
              <div className="text-sm text-muted-foreground">
                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
              </div>
            </div>
            <button
              onClick={() => {
                setUploadedFile(null);
                setCurrentStep('upload');
              }}
              className="text-muted-foreground hover:text-alert-red"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                العنوان *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="أدخل عنوان الريبلاي"
                className={`w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${errors.title ? 'border-alert-red' : ''}`}
                maxLength={100}
              />
              {errors.title && (
                <p className="text-sm text-alert-red mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                الوصف
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="وصف المباراة أو أي تفاصيل أخرى..."
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/500 حرف
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  الفئة
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="showcase">عرض</option>
                  <option value="tournament">بطولة</option>
                  <option value="training">تدريب</option>
                  <option value="funny">مضحك</option>
                  <option value="epic">ملحمي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  نوع المباراة
                </label>
                <select
                  value={formData.gameInfo.mode}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    gameInfo: { ...prev.gameInfo, mode: e.target.value }
                  }))}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="multiplayer">متعدد اللاعبين</option>
                  <option value="skirmish">مناوشة</option>
                  <option value="tournament">بطولة</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                اسم الخريطة *
              </label>
              <input
                type="text"
                value={formData.gameInfo.map}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  gameInfo: { ...prev.gameInfo, map: e.target.value }
                }))}
                placeholder="اسم الخريطة"
                className={`w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${errors.map ? 'border-alert-red' : ''}`}
              />
              {errors.map && (
                <p className="text-sm text-alert-red mt-1">{errors.map}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              التاقات *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm flex items-center space-x-1 rtl:space-x-reverse"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-alert-red"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <input
                type="text"
                placeholder="إضافة تاق..."
                className="flex-1 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector('input[placeholder="إضافة تاق..."]') as HTMLInputElement;
                  if (input) {
                    addTag(input.value);
                    input.value = '';
                  }
                }}
                className="btn btn-outline"
              >
                <Tags size={16} />
              </button>
            </div>
            {errors.tags && (
              <p className="text-sm text-alert-red mt-1">{errors.tags}</p>
            )}
          </div>

          {/* Players */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">
                اللاعبين
              </label>
              <button
                type="button"
                onClick={addPlayer}
                className="btn btn-outline btn-sm"
              >
                <Users size={14} />
                <span>إضافة لاعب</span>
              </button>
            </div>
            <div className="space-y-2">
              {formData.gameInfo.players.map((player, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                    placeholder="اسم اللاعب"
                    className="px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <select
                    value={player.faction}
                    onChange={(e) => updatePlayer(index, 'faction', e.target.value)}
                    className="px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="USA">USA</option>
                    <option value="China">China</option>
                    <option value="GLA">GLA</option>
                  </select>
                  <select
                    value={player.result}
                    onChange={(e) => updatePlayer(index, 'result', e.target.value)}
                    className="px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="win">فوز</option>
                    <option value="lose">هزيمة</option>
                    <option value="draw">تعادل</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removePlayer(index)}
                    className="p-2 text-muted-foreground hover:text-alert-red"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                عام (يمكن للجميع مشاهدته)
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                السماح بالتعليقات
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowComments}
                  onChange={(e) => setFormData(prev => ({ ...prev, allowComments: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => setCurrentStep('upload')}
              className="btn btn-outline flex-1"
            >
              السابق
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              رفع الريبلاي
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (currentStep === 'preview') {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">جاري الرفع...</h2>
          <p className="text-muted-foreground">يرجى الانتظار حتى يتم رفع الريبلاي</p>
        </div>

        <div className="bg-muted rounded-lg p-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <FileText className="text-tactical-green" size={24} />
            <div>
              <div className="font-medium text-foreground">{formData.title}</div>
              <div className="text-sm text-muted-foreground">{uploadedFile?.name}</div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-tactical-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {uploadProgress}% مكتمل
          </div>
        </div>

        {uploadProgress === 100 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-tactical-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-tactical-green" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">تم الرفع بنجاح!</h3>
            <p className="text-muted-foreground">سيتم مراجعة الريبلاي وإظهاره في القائمة قريباً</p>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ReplayUpload; 