import React, { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Shield, Settings, Eye, Edit, Trash2, Search } from 'lucide-react';

interface Assistant {
  id: number;
  userId: number;
  username: string;
  displayName: string;
  avatar?: string;
  role: 'moderator' | 'admin' | 'organizer';
  permissions: {
    manageParticipants: boolean;
    manageBracket: boolean;
    manageUpdates: boolean;
    manageSettings: boolean;
    viewReports: boolean;
  };
  addedAt: string;
  addedBy: string;
  isActive: boolean;
}

interface TournamentAssistantsProps {
  tournamentId: number;
  isOwner: boolean;
}

const TournamentAssistants: React.FC<TournamentAssistantsProps> = ({ tournamentId, isOwner }) => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [newAssistant, setNewAssistant] = useState({
    username: '',
    role: 'moderator' as 'moderator' | 'admin' | 'organizer',
    permissions: {
      manageParticipants: false,
      manageBracket: false,
      manageUpdates: false,
      manageSettings: false,
      viewReports: false
    }
  });

  const roleLabels = {
    moderator: 'مشرف',
    admin: 'مدير',
    organizer: 'منظم'
  };

  const permissionLabels = {
    manageParticipants: 'إدارة المشاركين',
    manageBracket: 'إدارة البراكت',
    manageUpdates: 'نشر التحديثات',
    manageSettings: 'تعديل الإعدادات',
    viewReports: 'عرض التقارير'
  };

  const defaultPermissions = {
    moderator: {
      manageParticipants: true,
      manageBracket: false,
      manageUpdates: true,
      manageSettings: false,
      viewReports: true
    },
    admin: {
      manageParticipants: true,
      manageBracket: true,
      manageUpdates: true,
      manageSettings: true,
      viewReports: true
    },
    organizer: {
      manageParticipants: true,
      manageBracket: true,
      manageUpdates: true,
      manageSettings: true,
      viewReports: true
    }
  };

  useEffect(() => {
    loadAssistants();
  }, [tournamentId]);

  const loadAssistants = async () => {
    setLoading(true);
    try {
      // Mock data for demo
      const mockAssistants: Assistant[] = [
        {
          id: 1,
          userId: 201,
          username: 'moderator_ahmed',
          displayName: 'أحمد المشرف',
          avatar: '/images/avatars/default.jpg',
          role: 'moderator',
          permissions: {
            manageParticipants: true,
            manageBracket: false,
            manageUpdates: true,
            manageSettings: false,
            viewReports: true
          },
          addedAt: '2024-02-10T10:30:00Z',
          addedBy: 'Tournament Owner',
          isActive: true
        },
        {
          id: 2,
          userId: 202,
          username: 'admin_sara',
          displayName: 'سارة الإدارية',
          avatar: '/images/avatars/default.jpg',
          role: 'admin',
          permissions: {
            manageParticipants: true,
            manageBracket: true,
            manageUpdates: true,
            manageSettings: true,
            viewReports: true
          },
          addedAt: '2024-02-08T15:45:00Z',
          addedBy: 'Tournament Owner',
          isActive: true
        }
      ];

      setAssistants(mockAssistants);
    } catch (error) {
      console.error('Error loading assistants:', error);
      showToast('فشل في تحميل المساعدين', 'error');
    } finally {
      setLoading(false);
    }
  };

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

  const handleRoleChange = (role: 'moderator' | 'admin' | 'organizer') => {
    setNewAssistant(prev => ({
      ...prev,
      role,
      permissions: { ...defaultPermissions[role] }
    }));
  };

  const addAssistant = async () => {
    if (!newAssistant.username.trim()) {
      showToast('اسم المستخدم مطلوب', 'error');
      return;
    }

    setLoading(true);
    try {
      // Mock adding assistant
      const newAssistantData: Assistant = {
        id: Date.now(),
        userId: Math.floor(Math.random() * 1000) + 300,
        username: newAssistant.username,
        displayName: newAssistant.username,
        avatar: '/images/avatars/default.jpg',
        role: newAssistant.role,
        permissions: newAssistant.permissions,
        addedAt: new Date().toISOString(),
        addedBy: 'Current User',
        isActive: true
      };

      setAssistants(prev => [...prev, newAssistantData]);
      setShowAddModal(false);
      setNewAssistant({
        username: '',
        role: 'moderator',
        permissions: { ...defaultPermissions.moderator }
      });
      showToast('تم إضافة المساعد بنجاح', 'success');
    } catch (error) {
      console.error('Error adding assistant:', error);
      showToast('فشل في إضافة المساعد', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeAssistant = async (assistantId: number) => {
    if (!confirm('هل تريد إزالة هذا المساعد؟')) return;

    try {
      setAssistants(prev => prev.filter(a => a.id !== assistantId));
      showToast('تم إزالة المساعد', 'success');
    } catch (error) {
      console.error('Error removing assistant:', error);
      showToast('فشل في إزالة المساعد', 'error');
    }
  };

  const updateAssistantPermissions = async (assistantId: number, permissions: Assistant['permissions']) => {
    try {
      setAssistants(prev => prev.map(a => 
        a.id === assistantId ? { ...a, permissions } : a
      ));
      showToast('تم تحديث الصلاحيات', 'success');
    } catch (error) {
      console.error('Error updating permissions:', error);
      showToast('فشل في تحديث الصلاحيات', 'error');
    }
  };

  const filteredAssistants = assistants.filter(assistant =>
    assistant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assistant.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2 rtl:space-x-reverse">
            <Shield className="w-6 h-6 text-blue-400" />
            <span>مساعدو البطولة</span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            إدارة المساعدين وصلاحياتهم في البطولة
          </p>
        </div>
        
        {isOwner && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مساعد</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="البحث عن مساعد..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Assistants List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-400">جاري التحميل...</p>
          </div>
        ) : filteredAssistants.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {searchTerm ? 'لا توجد نتائج' : 'لا يوجد مساعدون'}
            </h3>
            <p className="text-gray-400">
              {searchTerm ? 'جرب البحث بكلمات أخرى' : 'أضف مساعدين لمساعدتك في إدارة البطولة'}
            </p>
          </div>
        ) : (
          filteredAssistants.map(assistant => (
            <div key={assistant.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 rtl:space-x-reverse">
                  {/* Avatar */}
                  <img
                    src={assistant.avatar || '/images/avatars/default.jpg'}
                    alt={assistant.displayName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                  />
                  
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                      <h4 className="text-lg font-semibold text-white">{assistant.displayName}</h4>
                      <span className="text-gray-400 text-sm">@{assistant.username}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        assistant.role === 'organizer' ? 'bg-purple-600 text-white' :
                        assistant.role === 'admin' ? 'bg-blue-600 text-white' :
                        'bg-green-600 text-white'
                      }`}>
                        {roleLabels[assistant.role]}
                      </span>
                    </div>
                    
                    {/* Permissions */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(assistant.permissions).map(([permission, enabled]) => {
                        if (!enabled) return null;
                        return (
                          <span
                            key={permission}
                            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                          >
                            {permissionLabels[permission as keyof typeof permissionLabels]}
                          </span>
                        );
                      })}
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      أضيف بواسطة {assistant.addedBy} في {formatDate(assistant.addedAt)}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                {isOwner && (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <button
                      onClick={() => setSelectedAssistant(assistant)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="تعديل الصلاحيات"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeAssistant(assistant.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="إزالة المساعد"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Assistant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">إضافة مساعد جديد</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    اسم المستخدم *
                  </label>
                  <input
                    type="text"
                    value={newAssistant.username}
                    onChange={(e) => setNewAssistant(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="أدخل اسم المستخدم"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    الدور
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(roleLabels).map(([role, label]) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleChange(role as any)}
                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                          newAssistant.role === role
                            ? 'border-green-500 bg-green-900/20 text-green-300'
                            : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    الصلاحيات
                  </label>
                  <div className="space-y-2">
                    {Object.entries(permissionLabels).map(([permission, label]) => (
                      <label key={permission} className="flex items-center space-x-3 rtl:space-x-reverse">
                        <input
                          type="checkbox"
                          checked={newAssistant.permissions[permission as keyof typeof newAssistant.permissions]}
                          onChange={(e) => setNewAssistant(prev => ({
                            ...prev,
                            permissions: {
                              ...prev.permissions,
                              [permission]: e.target.checked
                            }
                          }))}
                          className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                        />
                        <span className="text-gray-300">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={addAssistant}
                  disabled={loading || !newAssistant.username.trim()}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'جاري الإضافة...' : 'إضافة المساعد'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {selectedAssistant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  تعديل صلاحيات {selectedAssistant.displayName}
                </h3>
                <button
                  onClick={() => setSelectedAssistant(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-3">
                {Object.entries(permissionLabels).map(([permission, label]) => (
                  <label key={permission} className="flex items-center space-x-3 rtl:space-x-reverse">
                    <input
                      type="checkbox"
                      checked={selectedAssistant.permissions[permission as keyof typeof selectedAssistant.permissions]}
                      onChange={(e) => {
                        const updatedPermissions = {
                          ...selectedAssistant.permissions,
                          [permission]: e.target.checked
                        };
                        setSelectedAssistant({
                          ...selectedAssistant,
                          permissions: updatedPermissions
                        });
                      }}
                      className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-300">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={() => setSelectedAssistant(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => {
                    updateAssistantPermissions(selectedAssistant.id, selectedAssistant.permissions);
                    setSelectedAssistant(null);
                  }}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  حفظ التغييرات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

export default TournamentAssistants; 