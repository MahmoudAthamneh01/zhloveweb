import React, { useState, useEffect } from 'react';
import { Bell, X, Eye, EyeOff, Trophy, Users, MessageSquare, Shield, Info } from 'lucide-react';

interface Notification {
  id: number;
  type: 'tournament' | 'clan' | 'message' | 'admin' | 'general';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  icon?: string;
}

const NotificationsList: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadNotifications();
    
    // Listen for filter changes
    const handleFilterChange = (event: CustomEvent) => {
      setFilter(event.detail.filter);
    };
    
    window.addEventListener('filterNotifications', handleFilterChange as EventListener);
    
    return () => {
      window.removeEventListener('filterNotifications', handleFilterChange as EventListener);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch('http://localhost:8080/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(notifications.filter(notification => notification.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'tournament': return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'clan': return <Users className="w-5 h-5 text-blue-400" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-green-400" />;
      case 'admin': return <Shield className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tournament': return 'بطولة';
      case 'clan': return 'عشيرة';
      case 'message': return 'رسالة';
      case 'admin': return 'إدارة';
      default: return 'عام';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'اليوم';
    } else if (diffDays === 1) {
      return 'أمس';
    } else if (diffDays < 7) {
      return `منذ ${diffDays} أيام`;
    } else {
      return date.toLocaleDateString('ar-SA');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.type === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (filteredNotifications.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">لا توجد إشعارات</h3>
        <p className="text-gray-400">
          {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات حالياً'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredNotifications.map((notification) => (
        <div 
          key={notification.id}
          className={`bg-card border border-border rounded-lg p-6 transition-all hover:shadow-lg ${
            !notification.isRead ? 'border-green-500/50 bg-green-900/5' : ''
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 rtl:space-x-reverse flex-1">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getIcon(notification.type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                  <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">
                    {getTypeLabel(notification.type)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(notification.createdAt)}
                  </span>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {notification.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed">
                  {notification.message}
                </p>
                
                {notification.link && (
                  <a 
                    href={notification.link}
                    className="inline-block mt-3 text-green-400 hover:text-green-300 text-sm font-medium"
                  >
                    عرض التفاصيل ←
                  </a>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse mr-4 rtl:mr-0 rtl:ml-4">
              {!notification.isRead && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
                  title="تحديد كمقروء"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={() => deleteNotification(notification.id)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                title="حذف الإشعار"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsList; 