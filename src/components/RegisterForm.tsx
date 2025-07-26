import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, User, UserPlus, Eye, EyeOff, Globe, FileText } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    country: '',
    bio: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (!acceptTerms) {
      return;
    }

    const success = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      country: formData.country || undefined,
      bio: formData.bio || undefined,
    });

    if (success) {
      onSuccess?.();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const countries = [
    'السعودية', 'الإمارات', 'الكويت', 'قطر', 'البحرين', 'عمان',
    'مصر', 'الأردن', 'لبنان', 'سوريا', 'العراق', 'فلسطين',
    'المغرب', 'الجزائر', 'تونس', 'ليبيا', 'السودان', 'اليمن'
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">إنشاء حساب جديد</h2>
        <p className="text-gray-400">انضم إلى مجتمع ZH-Love Gaming</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            اسم المستخدم *
          </label>
          <div className="relative">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 
                focus:border-transparent pr-10"
              placeholder="اختر اسم المستخدم"
              required
              disabled={isLoading}
            />
            <User className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            البريد الإلكتروني *
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 
                focus:border-transparent pr-10"
              placeholder="ادخل بريدك الإلكتروني"
              required
              disabled={isLoading}
            />
            <Mail className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              الاسم الأول *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 
                focus:border-transparent"
              placeholder="الاسم الأول"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              الاسم الأخير *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 
                focus:border-transparent"
              placeholder="الاسم الأخير"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              كلمة المرور *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 
                  focus:border-transparent pr-10"
                placeholder="كلمة المرور"
                required
                disabled={isLoading}
              />
              <Lock className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              تأكيد كلمة المرور *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 
                  focus:border-transparent pr-10"
                placeholder="تأكيد كلمة المرور"
                required
                disabled={isLoading}
              />
              <Lock className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-sm text-red-400">كلمات المرور غير متطابقة</p>
            )}
          </div>
        </div>

        {/* Country Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            البلد
          </label>
          <div className="relative">
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
              disabled={isLoading}
            >
              <option value="">اختر البلد</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <Globe className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Bio Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            نبذة شخصية
          </label>
          <div className="relative">
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 
                focus:border-transparent pr-10"
              placeholder="أخبرنا عن نفسك وأسلوب لعبك..."
              disabled={isLoading}
            />
            <FileText className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="rounded border-gray-600 text-green-600 focus:ring-green-500 
              focus:ring-offset-0 bg-gray-700"
            disabled={isLoading}
          />
          <label htmlFor="acceptTerms" className="mr-2 text-sm text-gray-300">
            أوافق على{' '}
            <a href="#" className="text-green-400 hover:text-green-300">شروط الاستخدام</a>
            {' '}و{' '}
            <a href="#" className="text-green-400 hover:text-green-300">سياسة الخصوصية</a>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !acceptTerms || formData.password !== formData.confirmPassword}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 
            hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all 
            duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed 
            disabled:transform-none shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              جاري إنشاء الحساب...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <UserPlus className="w-5 h-5 mr-2" />
              إنشاء الحساب
            </div>
          )}
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 text-center">
        <p className="text-gray-400">
          لديك حساب بالفعل؟{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-green-400 hover:text-green-300 font-medium transition-colors"
            disabled={isLoading}
          >
            تسجيل الدخول
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm; 