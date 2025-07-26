import React, { useState, useEffect } from 'react';
import { Settings, Users, MessageSquare, Trophy, Calendar, Edit, Trash2, CheckCircle, XCircle, Play, Pause, RotateCcw, Shield } from 'lucide-react';

import TournamentAssistants from './TournamentAssistants';

interface TournamentManagementProps {}

const TournamentManagement: React.FC<TournamentManagementProps> = () => {
  const [tournament, setTournament] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('updates');
  const [loading, setLoading] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    content: '',
    type: 'general',
    notifyParticipants: true
  });

  useEffect(() => {
    const handleLoadManagement = (event: CustomEvent) => {
      setTournament(event.detail.tournament);
    };

    window.addEventListener('loadTournamentManagement', handleLoadManagement as EventListener);
    
    return () => {
      window.removeEventListener('loadTournamentManagement', handleLoadManagement as EventListener);
    };
  }, []);

  // Toast notification function
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg z-50 shadow-lg`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 4000);
  };

  const postUpdate = async () => {
    if (!newUpdate.title.trim() || !newUpdate.content.trim()) {
      showToast('الرجاء ملء جميع الحقول', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/updates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUpdate)
      });

      if (response.ok) {
        showToast('تم نشر التحديث بنجاح!', 'success');
        setNewUpdate({
          title: '',
          content: '',
          type: 'general',
          notifyParticipants: true
        });
        
        // Send notifications if enabled
        if (newUpdate.notifyParticipants) {
          await sendUpdateNotifications();
        }
      } else {
        const error = await response.json();
        showToast(error.message || 'فشل في نشر التحديث', 'error');
      }
    } catch (error) {
      console.error('Error posting update:', error);
      showToast('حدث خطأ أثناء نشر التحديث', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sendUpdateNotifications = async () => {
    try {
      const token = localStorage.getItem('zh_love_token');
      await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `تحديث جديد في بطولة ${tournament.name}`,
          message: newUpdate.title,
          type: 'tournament_update'
        })
      });
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  const updateTournamentStatus = async (newStatus: string) => {
    const confirmMessages: Record<string, string> = {
      'live': 'هل تريد بدء البطولة؟',
      'completed': 'هل تريد إنهاء البطولة؟',
      'cancelled': 'هل تريد إلغاء البطولة؟',
      'paused': 'هل تريد إيقاف البطولة مؤقتاً؟'
    };

    if (!confirm(confirmMessages[newStatus] || 'هل تريد تغيير حالة البطولة؟')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        showToast('تم تحديث حالة البطولة بنجاح!', 'success');
        setTournament((prev: any) => ({ ...prev, status: newStatus }));
        
        // Reload the page to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const error = await response.json();
        showToast(error.message || 'فشل في تحديث حالة البطولة', 'error');
      }
    } catch (error) {
      console.error('Error updating tournament status:', error);
      showToast('حدث خطأ أثناء تحديث حالة البطولة', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateBracket = async () => {
    if (!confirm('هل تريد إنشاء البراكت؟ هذا سيؤثر على ترتيب المشاركين.')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/bracket/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showToast('تم إنشاء البراكت بنجاح!', 'success');
      } else {
        const error = await response.json();
        showToast(error.message || 'فشل في إنشاء البراكت', 'error');
      }
    } catch (error) {
      console.error('Error generating bracket:', error);
      showToast('حدث خطأ أثناء إنشاء البراكت', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type: string) => {
    try {
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch(`http://localhost:8080/api/tournaments/${tournament.id}/export/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tournament_${tournament.id}_${type}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        showToast(`تم تصدير ${type} بنجاح!`, 'success');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      showToast('حدث خطأ أثناء التصدير', 'error');
    }
  };

  if (!tournament) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل إعدادات الإدارة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Management Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">إدارة البطولة</h2>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
              tournament.status === 'live' ? 'bg-red-600 text-white' :
              tournament.status === 'open' ? 'bg-green-600 text-white' :
              tournament.status === 'completed' ? 'bg-gray-600 text-white' :
              'bg-blue-600 text-white'
            }`}>
              {tournament.status === 'live' ? 'جاري الآن' :
               tournament.status === 'open' ? 'مفتوح' :
               tournament.status === 'completed' ? 'منتهي' :
               tournament.status}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tournament.status === 'open' && (
            <button
              onClick={() => updateTournamentStatus('live')}
              disabled={loading}
              className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Play className="w-5 h-5" />
              <span>بدء البطولة</span>
            </button>
          )}

          {tournament.status === 'live' && (
            <>
              <button
                onClick={() => updateTournamentStatus('paused')}
                disabled={loading}
                className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Pause className="w-5 h-5" />
                <span>إيقاف مؤقت</span>
              </button>
              
              <button
                onClick={() => updateTournamentStatus('completed')}
                disabled={loading}
                className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                <span>إنهاء البطولة</span>
              </button>
            </>
          )}

          {tournament.status === 'paused' && (
            <button
              onClick={() => updateTournamentStatus('live')}
              disabled={loading}
              className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Play className="w-5 h-5" />
              <span>استئناف</span>
            </button>
          )}

          <button
            onClick={generateBracket}
            disabled={loading}
            className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Trophy className="w-5 h-5" />
            <span>إنشاء البراكت</span>
          </button>

          <button
            onClick={() => updateTournamentStatus('cancelled')}
            disabled={loading}
            className="flex items-center justify-center space-x-2 rtl:space-x-reverse p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
            <span>إلغاء البطولة</span>
          </button>
        </div>
      </div>

      {/* Management Tabs */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border">
          <nav className="flex space-x-8 rtl:space-x-reverse px-6">
            {[
              { id: 'updates', name: 'نشر التحديثات', icon: MessageSquare },
              { id: 'participants', name: 'إدارة المشاركين', icon: Users },
              { id: 'assistants', name: 'المساعدون', icon: Shield },
              { id: 'settings', name: 'إعدادات البطولة', icon: Settings },
              { id: 'reports', name: 'التقارير', icon: Trophy }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 rtl:space-x-reverse py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Updates Tab */}
          {activeTab === 'updates' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">نشر تحديث جديد</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    عنوان التحديث
                  </label>
                  <input
                    type="text"
                    value={newUpdate.title}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="مثال: تأجيل المباراة النهائية"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    نوع التحديث
                  </label>
                  <select
                    value={newUpdate.type}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="general">عام</option>
                    <option value="schedule">جدولة</option>
                    <option value="rules">قوانين</option>
                    <option value="results">نتائج</option>
                    <option value="important">مهم</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  محتوى التحديث
                </label>
                <textarea
                  value={newUpdate.content}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="اكتب تفاصيل التحديث هنا..."
                />
              </div>

              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  id="notify-participants"
                  checked={newUpdate.notifyParticipants}
                  onChange={(e) => setNewUpdate(prev => ({ ...prev, notifyParticipants: e.target.checked }))}
                  className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                />
                <label htmlFor="notify-participants" className="text-gray-300">
                  إرسال إشعارات للمشاركين
                </label>
              </div>

              <button
                onClick={postUpdate}
                disabled={loading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 rtl:space-x-reverse"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>جاري النشر...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>نشر التحديث</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Participants Tab */}
          {activeTab === 'participants' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">إدارة المشاركين</h3>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <button
                    onClick={() => exportData('participants')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    تصدير المشاركين
                  </button>
                  <button
                    onClick={() => window.location.href = `/ar/tournaments/${tournament.id}/applications`}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                  >
                    طلبات الانضمام
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">{tournament.participants || 0}</div>
                    <div className="text-gray-400">مشاركين مؤكدين</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">0</div>
                    <div className="text-gray-400">في انتظار التأكيد</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">0</div>
                    <div className="text-gray-400">مرفوضين</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{tournament.maxParticipants - (tournament.participants || 0)}</div>
                    <div className="text-gray-400">أماكن متبقية</div>
                  </div>
                </div>
              </div>

              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">سيتم عرض قائمة المشاركين هنا</p>
              </div>
            </div>
          )}

          {/* Assistants Tab */}
          {activeTab === 'assistants' && (
            <TournamentAssistants 
              tournamentId={tournament.id} 
              isOwner={true}
            />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">إعدادات البطولة</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-green-400">إعدادات عامة</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      اسم البطولة
                    </label>
                    <input
                      type="text"
                      defaultValue={tournament.name}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      الحد الأقصى للمشاركين
                    </label>
                    <input
                      type="number"
                      defaultValue={tournament.maxParticipants}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-green-400">إعدادات متقدمة</h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 rtl:space-x-reverse">
                      <input
                        type="checkbox"
                        defaultChecked={tournament.allowSpectators}
                        className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-300">السماح للمتفرجين</span>
                    </label>

                    <label className="flex items-center space-x-3 rtl:space-x-reverse">
                      <input
                        type="checkbox"
                        defaultChecked={tournament.isPrivate}
                        className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-300">بطولة خاصة</span>
                    </label>

                    <label className="flex items-center space-x-3 rtl:space-x-reverse">
                      <input
                        type="checkbox"
                        defaultChecked={tournament.autoStart}
                        className="w-4 h-4 text-green-600 bg-gray-800 border-gray-600 rounded focus:ring-green-500"
                      />
                      <span className="text-gray-300">بداية تلقائية</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-700">
                <button 
                  onClick={() => showToast('تم حفظ التغييرات', 'success')}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  حفظ التغييرات
                </button>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">التقارير والإحصائيات</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">0</div>
                  <div className="text-gray-400">مباريات مكتملة</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">0</div>
                  <div className="text-gray-400">متوسط وقت المباراة</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">0</div>
                  <div className="text-gray-400">تقارير مشاكل</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">0</div>
                  <div className="text-gray-400">معدل المشاركة</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => exportData('matches')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  تصدير المباريات
                </button>
                <button
                  onClick={() => exportData('results')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  تصدير النتائج
                </button>
                <button
                  onClick={() => exportData('statistics')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  تصدير الإحصائيات
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentManagement; 