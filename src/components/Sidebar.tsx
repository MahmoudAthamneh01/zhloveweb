import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  Trophy, 
  Users, 
  MessageSquare, 
  Play, 
  Star, 
  BarChart3, 
  Settings, 
  Shield,
  LogIn,
  LogOut,
  User,
  Globe,
  ChevronRight,
  ChevronLeft,
  Languages,
  Bell,
  Mail,
  MessageCircle,
  Swords
} from 'lucide-react';

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  href: string;
  active: boolean;
  badge?: number;
}

interface SidebarProps {
  currentPath?: string;
  language?: 'ar' | 'en';
}

const Sidebar: React.FC<SidebarProps> = ({ currentPath = '', language = 'ar' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [userClan, setUserClan] = useState<any>(null);

  const isRTL = language === 'ar';

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('zh_love_token');
    const userData = localStorage.getItem('zh_love_user');
    const currentUserData = localStorage.getItem('currentUser');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        // Load notification and message counts
        loadNotificationCounts();
        // Load user clan
        loadUserClan();
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else if (currentUserData) {
      // Development mode with temporary user
      try {
        setUser(JSON.parse(currentUserData));
        setIsAuthenticated(true);
        // Load user clan for development
        loadUserClan();
      } catch (error) {
        console.error('Error parsing temp user data:', error);
      }
    }
  }, []);

  const loadUserClan = () => {
    try {
      // Check if user is member of any clan
      const approvedClans = JSON.parse(localStorage.getItem('approvedClans') || '[]');
      const clanApplications = JSON.parse(localStorage.getItem('clanApplications') || '[]');
      const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (currentUserData.id) {
        // Check if user owns a clan
        const ownedClan = approvedClans.find((clan: any) => clan.ownerId === currentUserData.id);
        
        if (ownedClan) {
          setUserClan({ ...ownedClan, role: 'leader' });
          return;
        }
        
        // Check approved clan application
        const approvedApplication = clanApplications.find((app: any) => 
          app.organizerId === currentUserData.id && app.status === 'approved'
        );
        
        if (approvedApplication) {
          setUserClan({ 
            id: approvedApplication.id,
            name: approvedApplication.clanName,
            tag: approvedApplication.clanTag,
            role: 'leader'
          });
        }
      }
    } catch (error) {
      console.error('Error loading user clan:', error);
    }
  };

  const loadNotificationCounts = async () => {
    try {
      // For development, use mock counts
      setNotificationCount(3);
      setMessageCount(5);
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('zh_love_token')}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('zh_love_token');
    localStorage.removeItem('zh_love_user');
    localStorage.removeItem('currentUser');
    setUser(null);
    setIsAuthenticated(false);
    setUserClan(null);
    window.location.reload();
  };

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    const newPath = currentPath.replace(`/${language}/`, `/${newLang}/`);
    window.location.href = newPath;
  };

  const menuItems: MenuItem[] = [
    { 
      icon: Home,
      name: isRTL ? 'الرئيسية' : 'Home', 
      href: `/${language}`, 
      active: currentPath === `/${language}` || currentPath === `/${language}/`
    },
    { 
      icon: Trophy,
      name: isRTL ? 'البطولات' : 'Tournaments', 
      href: `/${language}/tournaments`, 
      active: currentPath.includes('/tournaments')
    },
    { 
      icon: Users,
      name: isRTL ? 'العشائر' : 'Clans', 
      href: `/${language}/clans`, 
      active: currentPath.includes('/clans') && !currentPath.includes('/my-clan')
    },
    { 
      icon: MessageSquare,
      name: isRTL ? 'المنتدى' : 'Forum', 
      href: `/${language}/forum`, 
      active: currentPath.includes('/forum')
    },
    { 
      icon: Play,
      name: isRTL ? 'الريبلايز' : 'Replays', 
      href: `/${language}/replays`, 
      active: currentPath.includes('/replays')
    },
    { 
      icon: Star,
      name: isRTL ? 'اليوتيوبرز' : 'Streamers', 
      href: `/${language}/streamers`, 
      active: currentPath.includes('/streamers')
    },
    { 
      icon: BarChart3,
      name: isRTL ? 'التصنيفات' : 'Rankings', 
      href: `/${language}/rankings`, 
      active: currentPath.includes('/rankings') && !currentPath.includes('/clan-rankings')
    },
    { 
      icon: Trophy,
      name: isRTL ? 'ترتيب العشائر' : 'Clan Rankings', 
      href: `/${language}/clan-rankings`, 
      active: currentPath.includes('/clan-rankings')
    },
  ];

  // Add My Clan link for authenticated users
  if (isAuthenticated) {
    // Insert "My Clan" after "Clans" (at index 3)
    menuItems.splice(3, 0, {
      icon: Swords,
      name: isRTL ? 'عشيرتي' : 'My Clan',
      href: `/${language}/my-clan`,
      active: currentPath.includes('/my-clan')
    });
  }

  // Add notifications and messages for authenticated users
  if (isAuthenticated) {
    menuItems.push(
      { 
        icon: Bell,
        name: isRTL ? 'الإشعارات' : 'Notifications', 
        href: `/${language}/notifications`, 
        active: currentPath.includes('/notifications'),
        badge: notificationCount > 0 ? notificationCount : undefined
      },
      { 
        icon: Mail,
        name: isRTL ? 'الرسائل' : 'Messages', 
        href: `/${language}/messages`, 
        active: currentPath.includes('/messages'),
        badge: messageCount > 0 ? messageCount : undefined
      }
    );
  }

  // Add admin link if user is admin
  if (user?.role === 'admin') {
    menuItems.push({
      icon: Shield,
      name: isRTL ? 'لوحة الإدارة' : 'Admin Panel',
      href: `/${language}/admin`,
      active: currentPath.includes('/admin')
    });
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 z-50 p-3 bg-gray-900 text-white rounded-lg shadow-lg transition-all duration-300 lg:hidden ${
          isRTL ? 'right-4' : 'left-4'
        } ${isOpen ? 'opacity-0' : 'opacity-100'}`}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 z-40 h-screen bg-gray-900 border-gray-800 transition-all duration-300 flex flex-col ${
          isRTL ? 'right-0 border-l' : 'left-0 border-r'
        } ${
          isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        } lg:translate-x-0 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">ZH</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">ZH-Love</h1>
                <p className="text-gray-400 text-xs">{isRTL ? 'مجتمع الجنرالز' : 'Generals Community'}</p>
              </div>
            </div>
          )}
          
          {/* Control Buttons */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title={isRTL ? 'تغيير اللغة' : 'Change Language'}
            >
              <Languages className="w-5 h-5" />
            </button>

            {/* Collapse Toggle (Desktop only) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isCollapsed ? (
                isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
              ) : (
                isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
              )}
            </button>

            {/* Close Button (Mobile only) */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Clan Info (when authenticated and has clan) */}
        {isAuthenticated && userClan && !isCollapsed && (
          <div className="px-3 py-2 border-b border-gray-800">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Swords className="w-4 h-4 text-yellow-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">{isRTL ? 'عشيرتي' : 'My Clan'}</p>
                  <p className="text-sm font-medium text-white truncate">
                    [{userClan.tag}] {userClan.name}
                  </p>
                  <p className="text-xs text-yellow-400">
                    {userClan.role === 'leader' ? (isRTL ? 'قائد' : 'Leader') : (isRTL ? 'عضو' : 'Member')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const hasBadge = item.badge && item.badge > 0;
            return (
              <a
                key={index}
                href={item.href}
                className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                  item.active
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                } ${isCollapsed ? 'justify-center' : isRTL ? 'justify-end' : 'justify-start'}`}
                title={isCollapsed ? item.name : ''}
                onClick={() => setIsOpen(false)}
              >
                <Icon className={`w-5 h-5 ${item.active ? 'text-white' : 'text-gray-400 group-hover:text-white'} ${
                  !isCollapsed && (isRTL ? 'ml-3' : 'mr-3')
                }`} />
                {!isCollapsed && (
                  <span className="font-medium transition-colors duration-200">
                    {item.name}
                  </span>
                )}
                {/* Badge for notifications and messages */}
                {hasBadge && (
                  <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ${
                    isCollapsed ? 'transform translate-x-1' : ''
                  }`}>
                    {item.badge && item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-800 p-3">
          {isAuthenticated && user ? (
            <div className="space-y-2">
              {/* User Info */}
              {!isCollapsed && (
                <div className="flex items-center px-3 py-2 text-gray-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mr-3 rtl:mr-0 rtl:ml-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.username || user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Profile Link */}
              <a
                href={`/${language}/profile`}
                className={`flex items-center px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors ${
                  isCollapsed ? 'justify-center' : isRTL ? 'justify-end' : 'justify-start'
                }`}
                title={isCollapsed ? (isRTL ? 'الملف الشخصي' : 'Profile') : ''}
                onClick={() => setIsOpen(false)}
              >
                <User className={`w-5 h-5 ${!isCollapsed && (isRTL ? 'ml-3' : 'mr-3')}`} />
                {!isCollapsed && <span>{isRTL ? 'الملف الشخصي' : 'Profile'}</span>}
              </a>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`w-full flex items-center px-3 py-2 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors ${
                  isCollapsed ? 'justify-center' : isRTL ? 'justify-end' : 'justify-start'
                }`}
                title={isCollapsed ? (isRTL ? 'تسجيل الخروج' : 'Logout') : ''}
              >
                <LogOut className={`w-5 h-5 ${!isCollapsed && (isRTL ? 'ml-3' : 'mr-3')}`} />
                {!isCollapsed && <span>{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Login Button */}
              <a
                href={`/${language}/login`}
                className={`flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors ${
                  isCollapsed ? 'justify-center' : isRTL ? 'justify-end' : 'justify-start'
                }`}
                title={isCollapsed ? (isRTL ? 'تسجيل الدخول' : 'Login') : ''}
                onClick={() => setIsOpen(false)}
              >
                <LogIn className={`w-5 h-5 ${!isCollapsed && (isRTL ? 'ml-3' : 'mr-3')}`} />
                {!isCollapsed && <span>{isRTL ? 'تسجيل الدخول' : 'Login'}</span>}
              </a>

              {/* Register Button */}
              <a
                href={`/${language}/register`}
                className={`flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ${
                  isCollapsed ? 'justify-center' : isRTL ? 'justify-end' : 'justify-start'
                }`}
                title={isCollapsed ? (isRTL ? 'إنشاء حساب' : 'Register') : ''}
                onClick={() => setIsOpen(false)}
              >
                <User className={`w-5 h-5 ${!isCollapsed && (isRTL ? 'ml-3' : 'mr-3')}`} />
                {!isCollapsed && <span>{isRTL ? 'إنشاء حساب' : 'Register'}</span>}
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 