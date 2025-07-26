import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Shield, AlertCircle, LogIn } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: 'admin' | 'moderator' | 'player';
  redirectTo?: string;
}

export default function AuthGuard({ children, requireRole = 'player', redirectTo = '/ar/login' }: AuthGuardProps) {
  const { user, isLoading, getCurrentUser, initialize } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize auth store first
        initialize();
        
        // Then try to get current user if token exists
        if (localStorage.getItem('zh_love_token')) {
          await getCurrentUser();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsChecking(false);
      }
    };
    
    init();
  }, [getCurrentUser, initialize]);

  // Show loading state
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="military-card p-8 max-w-md w-full">
          <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tactical-green"></div>
            <Shield size={24} className="text-tactical-green" />
          </div>
          <h2 className="text-xl font-bold text-foreground text-center mb-2">
            جاري التحقق من الصلاحيات
          </h2>
          <p className="text-muted-foreground text-center">
            يرجى الانتظار أثناء التحقق من هويتك...
          </p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="military-card p-8 max-w-md w-full">
          <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse mb-4">
            <AlertCircle size={24} className="text-alert-red" />
            <LogIn size={24} className="text-tactical-green" />
          </div>
          <h2 className="text-xl font-bold text-foreground text-center mb-2">
            تسجيل الدخول مطلوب
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            يجب عليك تسجيل الدخول للوصول إلى هذه الصفحة
          </p>
          <div className="flex justify-center space-x-4 rtl:space-x-reverse">
            <a 
              href="/ar/login" 
              className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
            >
              <LogIn size={16} />
              <span>تسجيل الدخول</span>
            </a>
            <a 
              href="/ar/register" 
              className="btn-secondary flex items-center space-x-2 rtl:space-x-reverse"
            >
              <span>إنشاء حساب</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Check role permissions
  const hasRequiredRole = () => {
    if (requireRole === 'admin') {
      return user.role === 'admin';
    }
    if (requireRole === 'moderator') {
      return user.role === 'admin' || user.role === 'moderator';
    }
    return true; // 'player' role or any authenticated user
  };

  if (!hasRequiredRole()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="military-card p-8 max-w-md w-full">
          <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse mb-4">
            <Shield size={24} className="text-alert-red" />
            <AlertCircle size={24} className="text-alert-red" />
          </div>
          <h2 className="text-xl font-bold text-foreground text-center mb-2">
            غير مصرح بالوصول
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            ليس لديك صلاحية للوصول إلى هذه الصفحة
          </p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">دورك الحالي:</span>
              <span className={`font-medium ${
                user.role === 'admin' ? 'text-tactical-green' :
                user.role === 'moderator' ? 'text-victory-gold' :
                'text-command-blue'
              }`}>
                {user.role === 'admin' ? 'مدير' :
                 user.role === 'moderator' ? 'مراقب' :
                 'لاعب'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">الدور المطلوب:</span>
              <span className="font-medium text-alert-red">
                {requireRole === 'admin' ? 'مدير' :
                 requireRole === 'moderator' ? 'مراقب' :
                 'لاعب'}
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <a 
              href="/ar" 
              className="btn-primary flex items-center space-x-2 rtl:space-x-reverse"
            >
              <span>العودة للصفحة الرئيسية</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role
  return <>{children}</>;
} 