import React, { useState, useEffect } from 'react';
import { Send, Users, User, Bell, MessageSquare, Target, Search } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  clan?: string;
  isOnline: boolean;
}

interface Clan {
  id: number;
  name: string;
  memberCount: number;
}

const AdminMessagesManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  const [messageType, setMessageType] = useState<'notification' | 'message'>('notification');
  const [targetType, setTargetType] = useState<'all' | 'user' | 'clan' | 'group'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedClan, setSelectedClan] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
    loadClans();
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadClans = async () => {
    try {
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch('http://localhost:8080/api/clans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClans(data.clans || []);
      }
    } catch (error) {
      console.error('Error loading clans:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch('http://localhost:8080/api/admin/messages/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleSend = async () => {
    if (!title || !message) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('zh_love_token');
      const payload = {
        type: messageType,
        targetType,
        title,
        message,
        priority,
        targetUsers: selectedUsers,
        targetClan: selectedClan
      };

      const response = await fetch('http://localhost:8080/api/admin/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('تم إرسال الرسالة بنجاح!');
        setTitle('');
        setMessage('');
        setSelectedUsers([]);
        setSelectedClan(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'حدث خطأ أثناء إرسال الرسالة');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('حدث خطأ أثناء إرسال الرسالة');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTargetDisplay = () => {
    switch (targetType) {
      case 'all':
        return 'جميع المستخدمين';
      case 'user':
        return `${selectedUsers.length} مستخدم محدد`;
      case 'clan':
        return selectedClan ? clans.find(c => c.id === selectedClan)?.name : 'لم يتم اختيار عشيرة';
      case 'group':
        return 'مجموعة مخصصة';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 rtl:space-x-reverse px-6">
          <button
            onClick={() => setActiveTab('send')}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              activeTab === 'send'
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            إرسال رسالة
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-2 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            سجل الرسائل
          </button>
        </nav>
      </div>

      {/* Send Tab */}
      {activeTab === 'send' && (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Message Form */}
            <div className="space-y-6">
              {/* Message Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">نوع الرسالة</label>
                <div className="flex space-x-4 rtl:space-x-reverse">
                  <button
                    onClick={() => setMessageType('notification')}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                      messageType === 'notification'
                        ? 'border-green-500 bg-green-900/20 text-green-300'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <Bell className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    إشعار
                  </button>
                  <button
                    onClick={() => setMessageType('message')}
                    className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
                      messageType === 'message'
                        ? 'border-green-500 bg-green-900/20 text-green-300'
                        : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    رسالة
                  </button>
                </div>
              </div>

              {/* Target Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">المستهدفون</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">جميع المستخدمين</option>
                  <option value="user">مستخدمين محددين</option>
                  <option value="clan">عشيرة محددة</option>
                  <option value="group">مجموعة مخصصة</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">العنوان</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="عنوان الرسالة"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">الرسالة</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="محتوى الرسالة..."
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">الأولوية</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="low">منخفضة</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عالية</option>
                </select>
              </div>
            </div>

            {/* Right Column - Target Selection */}
            <div className="space-y-6">
              {/* Target Preview */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">معاينة المستهدفين:</h3>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-white">{getTargetDisplay()}</span>
                </div>
              </div>

              {/* User Selection */}
              {targetType === 'user' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">اختيار المستخدمين</label>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="البحث عن مستخدم..."
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-gray-700 rounded-lg">
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center p-3 hover:bg-gray-800 cursor-pointer"
                        onClick={() => {
                          if (selectedUsers.includes(user.id)) {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          } else {
                            setSelectedUsers([...selectedUsers, user.id]);
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => {}}
                          className="mr-3 rtl:mr-0 rtl:ml-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <p className="text-white font-medium">{user.username}</p>
                            {user.isOnline && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clan Selection */}
              {targetType === 'clan' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">اختيار العشيرة</label>
                  <select
                    value={selectedClan || ''}
                    onChange={(e) => setSelectedClan(parseInt(e.target.value) || null)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">اختر عشيرة...</option>
                    {clans.map(clan => (
                      <option key={clan.id} value={clan.id}>
                        {clan.name} ({clan.memberCount} عضو)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={loading}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>جاري الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>إرسال الرسالة</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="p-6">
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">لا توجد رسائل مرسلة</p>
              </div>
            ) : (
              history.map((item, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                        <h3 className="text-white font-medium">{item.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(item.priority)}`}>
                          {item.priority === 'high' ? 'عالية' : item.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">
                          {item.type === 'notification' ? 'إشعار' : 'رسالة'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{item.message}</p>
                      <div className="flex items-center space-x-4 rtl:space-x-reverse text-xs text-gray-500">
                        <span>المستهدفون: {item.targetCount}</span>
                        <span>تم الإرسال: {new Date(item.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessagesManager; 