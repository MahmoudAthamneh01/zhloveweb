import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, User, Settings, LogOut, Shield } from 'lucide-react';

interface NavigationProps {
  currentPath?: string;
  language?: 'ar' | 'en';
}

const Navigation: React.FC<NavigationProps> = ({ currentPath = '', language = 'ar' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('zh_love_token');
    const userData = localStorage.getItem('zh_love_user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('zh_love_token')}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local storage
    localStorage.removeItem('zh_love_token');
    localStorage.removeItem('zh_love_user');
    setUser(null);
    setIsAuthenticated(false);
    setIsUserMenuOpen(false);
    window.location.reload();
  };

  const isRTL = language === 'ar';
  const baseUrl = `/${language}`;

  const menuItems = [
    { 
      name: isRTL ? 'الرئيسية' : 'Home', 
      href: baseUrl, 
      active: currentPath === baseUrl || currentPath === `${baseUrl}/` 
    },
    { 
      name: isRTL ? 'البطولات' : 'Tournaments', 
      href: `${baseUrl}/tournaments`, 
      active: currentPath.includes('/tournaments') 
    },
    { 
      name: isRTL ? 'العشائر' : 'Clans', 
      href: `${baseUrl}/clans`, 
      active: currentPath.includes('/clans') 
    },
    { 
      name: isRTL ? 'ترتيب العشائر' : 'Clan Rankings', 
      href: `${baseUrl}/clan-rankings`, 
      active: currentPath.includes('/clan-rankings') 
    },
    { 
      name: isRTL ? 'المنتدى' : 'Forum', 
      href: `${baseUrl}/forum`, 
      active: currentPath.includes('/forum') 
    },
    { 
      name: isRTL ? 'الريبلايز' : 'Replays', 
      href: `${baseUrl}/replays`, 
      active: currentPath.includes('/replays') 
    },
    { 
      name: isRTL ? 'اليوتيوبرز' : 'Streamers', 
      href: `${baseUrl}/streamers`, 
      active: currentPath.includes('/streamers') 
    },
    { 
      name: isRTL ? 'التصنيفات' : 'Rankings', 
      href: `${baseUrl}/rankings`, 
      active: currentPath.includes('/rankings') 
    },
  ];

  // Add admin link if user is admin
  if (user?.role === 'admin') {
    menuItems.push({
      name: isRTL ? 'الإدارة' : 'Admin',
      href: `${baseUrl}/admin`,
      active: currentPath.includes('/admin')
    });
  }

  return (
    <nav className={`bg-gray-900 border-b border-gray-800 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href={baseUrl} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ZH</span>
              </div>
              <span className="text-white font-bold text-xl">ZH-Love</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    item.active
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{user.username}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                      <p className="font-medium text-white">{user.firstName} {user.lastName}</p>
                      <p className="text-xs">{user.email}</p>
                    </div>
                    <a
                      href={`${baseUrl}/profile`}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      {isRTL ? 'الملف الشخصي' : 'Profile'}
                    </a>
                    <a
                      href={`${baseUrl}/settings`}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      {isRTL ? 'الإعدادات' : 'Settings'}
                    </a>
                    {user.role === 'admin' && (
                      <a
                        href={`${baseUrl}/admin/categories`}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <Shield className="w-4 h-4 inline mr-2" />
                        {isRTL ? 'إدارة الفئات' : 'Category Management'}
                      </a>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      {isRTL ? 'تسجيل الخروج' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a
                  href={`${baseUrl}/login`}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 
                    text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 
                    shadow-lg hover:shadow-xl hover:shadow-green-500/25"
                >
                  {isRTL ? 'تسجيل الدخول' : 'Login'}
                </a>
                <a
                  href={`${baseUrl}/register`}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                    text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 
                    shadow-lg hover:shadow-xl hover:shadow-blue-500/25"
                >
                  {isRTL ? 'إنشاء حساب' : 'Sign Up'}
                </a>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  item.active
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.name}
              </a>
            ))}
            
            {!isAuthenticated && (
              <div className="pt-4 pb-3 border-t border-gray-700 space-y-2">
                <a
                  href={`${baseUrl}/login`}
                  className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 
                    text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-center"
                >
                  {isRTL ? 'تسجيل الدخول' : 'Login'}
                </a>
                <a
                  href={`${baseUrl}/register`}
                  className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                    text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 text-center"
                >
                  {isRTL ? 'إنشاء حساب' : 'Sign Up'}
                </a>
              </div>
            )}

            {isAuthenticated && user && (
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="flex items-center px-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="mr-3">
                    <div className="text-base font-medium text-white">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-400">{user.email}</div>
                  </div>
                </div>
                <a
                  href={`${baseUrl}/profile`}
                  className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                >
                  {isRTL ? 'الملف الشخصي' : 'Profile'}
                </a>
                <a
                  href={`${baseUrl}/settings`}
                  className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                >
                  {isRTL ? 'الإعدادات' : 'Settings'}
                </a>
                {user.role === 'admin' && (
                  <a
                    href={`${baseUrl}/admin`}
                    className="block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
                  >
                    {isRTL ? 'لوحة الإدارة' : 'Admin Panel'}
                  </a>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:bg-gray-700 hover:text-red-300 rounded-md"
                >
                  {isRTL ? 'تسجيل الخروج' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 