import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      return;
    }

    const success = await login(email, password);
    if (success) {
      onSuccess?.();
    }
  };

  const handleQuickLogin = async (userType: 'admin' | 'user') => {
    clearError();
    
    const credentials = {
      admin: { email: 'admin@zh-love.com', password: 'Admin@123456' },
      user: { email: 'legend@zh-love.com', password: 'Admin@123456' }
    };

    const success = await login(credentials[userType].email, credentials[userType].password);
    if (success) {
      onSuccess?.();
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">تسجيل الدخول</h2>
        <p className="text-gray-400">ادخل إلى حسابك للوصول إلى كامل الميزات</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            كلمة المرور
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 
                focus:border-transparent pr-10"
              placeholder="ادخل كلمة المرور"
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

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-gray-600 text-green-600 focus:ring-green-500 
                focus:ring-offset-0 bg-gray-700"
              disabled={isLoading}
            />
            <span className="mr-2 text-sm text-gray-300">تذكرني</span>
          </label>
          <a href="#" className="text-sm text-green-400 hover:text-green-300 transition-colors">
            نسيت كلمة المرور؟
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 
            hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all 
            duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed 
            disabled:transform-none shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              جاري تسجيل الدخول...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <LogIn className="w-5 h-5 mr-2" />
              تسجيل الدخول
            </div>
          )}
        </button>
      </form>

      {/* Quick Login Buttons */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <p className="text-center text-sm text-gray-400 mb-4">تسجيل دخول سريع للتجربة:</p>
        <div className="space-y-2">
          <button
            onClick={() => handleQuickLogin('admin')}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 
              rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            دخول كمدير (Admin)
          </button>
          <button
            onClick={() => handleQuickLogin('user')}
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 
              rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            دخول كمستخدم (User)
          </button>
        </div>
      </div>

      {/* Switch to Register */}
      <div className="mt-6 text-center">
        <p className="text-gray-400">
          لا تملك حساب؟{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-green-400 hover:text-green-300 font-medium transition-colors"
            disabled={isLoading}
          >
            إنشاء حساب جديد
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 