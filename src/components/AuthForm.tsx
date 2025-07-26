import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Globe, Shield } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  language: 'ar' | 'en';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit, isLoading, language }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    favorite_general: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isRTL = language === 'ar';

  const texts = {
    ar: {
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب جديد',
      username: 'اسم المستخدم',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      country: 'البلد',
      favoriteGeneral: 'الجنرال المفضل',
      loginButton: 'دخول',
      registerButton: 'إنشاء حساب',
      switchToRegister: 'ليس لديك حساب؟ سجل الآن',
      switchToLogin: 'لديك حساب؟ سجل الدخول',
      forgotPassword: 'نسيت كلمة المرور؟',
      loading: 'جاري التحميل...',
      generals: {
        'usa': 'USA (الولايات المتحدة)',
        'china': 'China (الصين)',
        'gla': 'GLA (جيش التحرير العالمي)',
        'air_force': 'Air Force (سلاح الجو)',
        'superweapon': 'Superweapon (الأسلحة الفائقة)',
        'infantry': 'Infantry (المشاة)',
        'tank': 'Tank (الدبابات)',
        'stealth': 'Stealth (الشبح)',
        'nuke': 'Nuke (النووي)',
        'laser': 'Laser (الليزر)',
        'toxin': 'Toxin (السموم)',
        'demo': 'Demo (المفجرات)',
        'assault': 'Assault (الهجوم)',
      },
    },
    en: {
      login: 'Sign In',
      register: 'Create New Account',
      username: 'Username',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      country: 'Country',
      favoriteGeneral: 'Favorite General',
      loginButton: 'Sign In',
      registerButton: 'Create Account',
      switchToRegister: "Don't have an account? Sign up",
      switchToLogin: 'Already have an account? Sign in',
      forgotPassword: 'Forgot Password?',
      loading: 'Loading...',
      generals: {
        'usa': 'USA',
        'china': 'China',
        'gla': 'GLA',
        'air_force': 'Air Force General',
        'superweapon': 'Superweapon General',
        'infantry': 'Infantry General',
        'tank': 'Tank General',
        'stealth': 'Stealth General',
        'nuke': 'Nuke General',
        'laser': 'Laser General',
        'toxin': 'Toxin General',
        'demo': 'Demo General',
        'assault': 'Assault General',
      },
    },
  };

  const t = texts[language];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = isRTL ? 'اسم المستخدم مطلوب' : 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = isRTL ? 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' : 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = isRTL ? 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط' : 'Username can only contain letters, numbers, and underscores';
    }

    // Email validation (for register)
    if (mode === 'register') {
      if (!formData.email.trim()) {
        newErrors.email = isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = isRTL ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = isRTL ? 'كلمة المرور مطلوبة' : 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters';
    }

    // Confirm password validation (for register)
    if (mode === 'register') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = isRTL ? 'تأكيد كلمة المرور مطلوب' : 'Confirm password is required';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = mode === 'login' 
      ? { username: formData.username, password: formData.password }
      : {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          country: formData.country || undefined,
          favorite_general: formData.favorite_general || undefined,
        };

    await onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="military-card p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gradient mb-2">
            {mode === 'login' ? t.login : t.register}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'مرحباً بك في مجتمع ZH-Love' : 'Welcome to ZH-Love Community'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              {t.username}
            </label>
            <div className="relative">
              <User className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-3 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  errors.username ? 'border-destructive' : ''
                }`}
                placeholder={t.username}
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-destructive">{errors.username}</p>
            )}
          </div>

          {/* Email (Register only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-3 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.email ? 'border-destructive' : ''
                  }`}
                  placeholder={t.email}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              {t.password}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 rtl:pl-3 rtl:pr-10 pr-10 rtl:pl-10 py-3 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  errors.password ? 'border-destructive' : ''
                }`}
                placeholder={t.password}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 rtl:pl-3 rtl:pr-10 pr-10 rtl:pl-10 py-3 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    errors.confirmPassword ? 'border-destructive' : ''
                  }`}
                  placeholder={t.confirmPassword}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Optional Fields (Register only) */}
          {mode === 'register' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-2">
                  {t.country}
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-3 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder={t.country}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Favorite General */}
              <div>
                <label htmlFor="favorite_general" className="block text-sm font-medium mb-2">
                  {t.favoriteGeneral}
                </label>
                <select
                  id="favorite_general"
                  name="favorite_general"
                  value={formData.favorite_general}
                  onChange={handleChange}
                  className="w-full px-3 py-3 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  disabled={isLoading}
                >
                  <option value="">{isRTL ? 'اختر الجنرال' : 'Select General'}</option>
                  {Object.entries(t.generals).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary btn-lg py-3 font-semibold relative overflow-hidden group"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="spinner w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2"></div>
                {t.loading}
              </div>
            ) : (
              mode === 'login' ? t.loginButton : t.registerButton
            )}
          </button>

          {/* Forgot Password (Login only) */}
          {mode === 'login' && (
            <div className="text-center">
              <a
                href={`/${language}/forgot-password`}
                className="text-sm text-primary hover:underline"
              >
                {t.forgotPassword}
              </a>
            </div>
          )}
        </form>

        {/* Switch Mode */}
        <div className="text-center mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? t.switchToRegister : t.switchToLogin}
          </p>
          <a
            href={`/${language}/${mode === 'login' ? 'register' : 'login'}`}
            className="text-primary hover:underline font-medium"
          >
            {mode === 'login' ? (isRTL ? 'سجل الآن' : 'Sign up now') : (isRTL ? 'سجل الدخول' : 'Sign in')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuthForm; 