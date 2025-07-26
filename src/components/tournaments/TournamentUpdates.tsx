import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, Trophy, AlertCircle, Info, CheckCircle, Clock, User } from 'lucide-react';

interface Update {
  id: number;
  title: string;
  content: string;
  type: 'general' | 'schedule' | 'rules' | 'results' | 'important';
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  isRead: boolean;
}

interface TournamentUpdatesProps {}

const TournamentUpdates: React.FC<TournamentUpdatesProps> = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [tournamentId, setTournamentId] = useState<string>('');

  useEffect(() => {
    const handleLoadUpdates = (event: CustomEvent) => {
      setTournamentId(event.detail.tournamentId);
      loadUpdates(event.detail.tournamentId);
    };

    window.addEventListener('loadTournamentUpdates', handleLoadUpdates as EventListener);
    
    return () => {
      window.removeEventListener('loadTournamentUpdates', handleLoadUpdates as EventListener);
    };
  }, []);

  const loadUpdates = async (id: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch(`http://localhost:8080/api/tournaments/${id}/updates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUpdates(data.updates || []);
      }
    } catch (error) {
      console.error('Error loading updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (updateId: number) => {
    try {
      const token = localStorage.getItem('zh_love_token');
      await fetch(`http://localhost:8080/api/tournaments/${tournamentId}/updates/${updateId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setUpdates(updates.map(update => 
        update.id === updateId ? { ...update, isRead: true } : update
      ));
    } catch (error) {
      console.error('Error marking update as read:', error);
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'schedule': return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'rules': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'results': return <Trophy className="w-5 h-5 text-green-400" />;
      case 'important': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getUpdateTypeLabel = (type: string) => {
    switch (type) {
      case 'schedule': return 'جدولة';
      case 'rules': return 'قوانين';
      case 'results': return 'نتائج';
      case 'important': return 'مهم';
      default: return 'عام';
    }
  };

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'schedule': return 'bg-blue-600/20 text-blue-300 border-blue-500/30';
      case 'rules': return 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30';
      case 'results': return 'bg-green-600/20 text-green-300 border-green-500/30';
      case 'important': return 'bg-red-600/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-600/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `منذ ${diffMinutes} دقيقة`;
    } else if (diffHours < 24) {
      return `منذ ${diffHours} ساعة`;
    } else if (diffDays === 1) {
      return 'أمس';
    } else if (diffDays < 7) {
      return `منذ ${diffDays} أيام`;
    } else {
      return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const filteredUpdates = updates.filter(update => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !update.isRead;
    return update.type === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-400">جاري تحميل التحديثات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-xl font-semibold text-white mb-4">تحديثات البطولة</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'all'
                ? 'border-green-500 bg-green-900/20 text-green-300'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
            }`}
          >
            جميع التحديثات
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'unread'
                ? 'border-green-500 bg-green-900/20 text-green-300'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
            }`}
          >
            غير مقروءة ({updates.filter(u => !u.isRead).length})
          </button>
          <button
            onClick={() => setFilter('important')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'important'
                ? 'border-green-500 bg-green-900/20 text-green-300'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
            }`}
          >
            مهم
          </button>
          <button
            onClick={() => setFilter('results')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'results'
                ? 'border-green-500 bg-green-900/20 text-green-300'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
            }`}
          >
            النتائج
          </button>
          <button
            onClick={() => setFilter('schedule')}
            className={`px-4 py-2 rounded-lg border transition-all ${
              filter === 'schedule'
                ? 'border-green-500 bg-green-900/20 text-green-300'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
            }`}
          >
            الجدولة
          </button>
        </div>
      </div>

      {/* Updates List */}
      <div className="space-y-4">
        {filteredUpdates.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">لا توجد تحديثات</h3>
            <p className="text-gray-400">
              {filter === 'unread' ? 'لا توجد تحديثات غير مقروءة' : 'لم يتم نشر أي تحديثات بعد'}
            </p>
          </div>
        ) : (
          filteredUpdates.map((update, index) => (
            <div
              key={update.id}
              className={`bg-card border rounded-lg p-6 transition-all hover:shadow-lg hover:shadow-green-500/10 ${
                !update.isRead 
                  ? 'border-green-500/50 bg-green-900/5' 
                  : 'border-border'
              }`}
              style={{
                animation: `fade-in-up 0.6s ease-out ${index * 0.1}s forwards`,
                opacity: 0
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 rtl:space-x-reverse flex-1">
                  {/* Update Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getUpdateIcon(update.type)}
                  </div>
                  
                  {/* Update Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                      {/* Type Badge */}
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getUpdateTypeColor(update.type)}`}>
                        {getUpdateTypeLabel(update.type)}
                      </span>
                      
                      {/* Time */}
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(update.createdAt)}</span>
                      </div>
                      
                      {/* Unread Indicator */}
                      {!update.isRead && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-3 leading-tight">
                      {update.title}
                    </h3>
                    
                    {/* Content */}
                    <div className="text-gray-300 leading-relaxed whitespace-pre-line mb-4">
                      {update.content}
                    </div>
                    
                    {/* Author */}
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
                        {update.authorAvatar ? (
                          <img src={update.authorAvatar} alt={update.authorName} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-gray-400 text-sm">بواسطة {update.authorName}</span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-start space-x-2 rtl:space-x-reverse mr-4 rtl:mr-0 rtl:ml-4">
                  {!update.isRead && (
                    <button
                      onClick={() => markAsRead(update.id)}
                      className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
                      title="تحديد كمقروء"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredUpdates.length > 0 && (
        <div className="text-center">
          <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
            تحميل المزيد
          </button>
        </div>
      )}
    </div>
  );
};

export default TournamentUpdates; 