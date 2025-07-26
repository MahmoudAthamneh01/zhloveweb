import React, { useState } from 'react';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Settings, 
  Shield, 
  MessageCircle,
  Users,
  Crown,
  Save,
  RotateCcw
} from 'lucide-react';

interface ClanMessageSettingsProps {
  clanId: number;
  currentUserId: number;
  currentUserRole: 'leader' | 'officer' | 'member';
  className?: string;
}

interface MessageSettings {
  notifications: {
    allMessages: boolean;
    announcements: boolean;
    mentions: boolean;
    warUpdates: boolean;
    memberJoined: boolean;
    memberLeft: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowDirectMessages: boolean;
    showReadReceipts: boolean;
    showTypingIndicator: boolean;
  };
  display: {
    messageSound: boolean;
    compactMode: boolean;
    showTimestamps: boolean;
    groupMessages: boolean;
    autoScrollToBottom: boolean;
  };
  moderation: {
    muteKeywords: string[];
    blockSpam: boolean;
    hideDeletedMessages: boolean;
    requireApprovalForLinks: boolean;
  };
}

const ClanMessageSettings: React.FC<ClanMessageSettingsProps> = ({
  clanId,
  currentUserId,
  currentUserRole,
  className = '',
}) => {
  const [settings, setSettings] = useState<MessageSettings>({
    notifications: {
      allMessages: true,
      announcements: true,
      mentions: true,
      warUpdates: true,
      memberJoined: false,
      memberLeft: false,
    },
    privacy: {
      showOnlineStatus: true,
      allowDirectMessages: true,
      showReadReceipts: true,
      showTypingIndicator: true,
    },
    display: {
      messageSound: true,
      compactMode: false,
      showTimestamps: true,
      groupMessages: true,
      autoScrollToBottom: true,
    },
    moderation: {
      muteKeywords: ['spam', 'inappropriate'],
      blockSpam: true,
      hideDeletedMessages: true,
      requireApprovalForLinks: false,
    },
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateSetting = (category: keyof MessageSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const addMuteKeyword = () => {
    if (!newKeyword.trim()) return;
    
    const keywords = [...settings.moderation.muteKeywords, newKeyword.trim()];
    updateSetting('moderation', 'muteKeywords', keywords);
    setNewKeyword('');
  };

  const removeMuteKeyword = (index: number) => {
    const keywords = settings.moderation.muteKeywords.filter((_, i) => i !== index);
    updateSetting('moderation', 'muteKeywords', keywords);
  };

  const saveSettings = () => {
    // Save settings to localStorage
    const userClanSettings = JSON.parse(localStorage.getItem('userClanMessageSettings') || '{}');
    userClanSettings[`${currentUserId}_${clanId}`] = settings;
    localStorage.setItem('userClanMessageSettings', JSON.stringify(userClanSettings));
    
    setHasUnsavedChanges(false);
    alert('تم حفظ الإعدادات بنجاح!');
  };

  const resetSettings = () => {
    if (window.confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
      setSettings({
        notifications: {
          allMessages: true,
          announcements: true,
          mentions: true,
          warUpdates: true,
          memberJoined: false,
          memberLeft: false,
        },
        privacy: {
          showOnlineStatus: true,
          allowDirectMessages: true,
          showReadReceipts: true,
          showTypingIndicator: true,
        },
        display: {
          messageSound: true,
          compactMode: false,
          showTimestamps: true,
          groupMessages: true,
          autoScrollToBottom: true,
        },
        moderation: {
          muteKeywords: [],
          blockSpam: true,
          hideDeletedMessages: true,
          requireApprovalForLinks: false,
        },
      });
      setHasUnsavedChanges(true);
    }
  };

  const SettingsSection: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode 
  }> = ({ title, icon, children }) => (
    <div className="military-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2 rtl:space-x-reverse">
        {icon}
        <span>{title}</span>
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const ToggleSetting: React.FC<{
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }> = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex-1">
        <div className="font-medium text-foreground">{label}</div>
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tactical-green"></div>
      </label>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">إعدادات رسائل العشيرة</h2>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {hasUnsavedChanges && (
            <span className="text-orange-500 text-sm">لديك تغييرات غير محفوظة</span>
          )}
          <button onClick={resetSettings} className="btn btn-outline btn-sm">
            <RotateCcw size={16} />
            <span>إعادة تعيين</span>
          </button>
          <button onClick={saveSettings} className="btn btn-primary btn-sm">
            <Save size={16} />
            <span>حفظ</span>
          </button>
        </div>
      </div>

      {/* Notifications Settings */}
      <SettingsSection 
        title="الإشعارات" 
        icon={<Bell className="text-tactical-green" size={20} />}
      >
        <ToggleSetting
          label="جميع الرسائل"
          description="تلقي إشعارات لجميع رسائل العشيرة"
          checked={settings.notifications.allMessages}
          onChange={(checked) => updateSetting('notifications', 'allMessages', checked)}
        />
        <ToggleSetting
          label="الإعلانات المهمة"
          description="إشعارات للإعلانات الرسمية من القادة والضباط"
          checked={settings.notifications.announcements}
          onChange={(checked) => updateSetting('notifications', 'announcements', checked)}
        />
        <ToggleSetting
          label="الإشارات (@mentions)"
          description="إشعار عند ذكر اسمك في الرسائل"
          checked={settings.notifications.mentions}
          onChange={(checked) => updateSetting('notifications', 'mentions', checked)}
        />
        <ToggleSetting
          label="تحديثات الحروب"
          description="إشعارات حول حروب العشيرة والتحديات"
          checked={settings.notifications.warUpdates}
          onChange={(checked) => updateSetting('notifications', 'warUpdates', checked)}
        />
        <ToggleSetting
          label="انضمام الأعضاء"
          description="إشعار عند انضمام عضو جديد"
          checked={settings.notifications.memberJoined}
          onChange={(checked) => updateSetting('notifications', 'memberJoined', checked)}
        />
        <ToggleSetting
          label="مغادرة الأعضاء"
          description="إشعار عند مغادرة عضو"
          checked={settings.notifications.memberLeft}
          onChange={(checked) => updateSetting('notifications', 'memberLeft', checked)}
        />
      </SettingsSection>

      {/* Privacy Settings */}
      <SettingsSection 
        title="الخصوصية" 
        icon={<Shield className="text-command-blue" size={20} />}
      >
        <ToggleSetting
          label="إظهار حالة الاتصال"
          description="السماح للآخرين برؤية ما إذا كنت متصلاً"
          checked={settings.privacy.showOnlineStatus}
          onChange={(checked) => updateSetting('privacy', 'showOnlineStatus', checked)}
        />
        <ToggleSetting
          label="السماح بالرسائل المباشرة"
          description="السماح لأعضاء العشيرة بإرسال رسائل خاصة"
          checked={settings.privacy.allowDirectMessages}
          onChange={(checked) => updateSetting('privacy', 'allowDirectMessages', checked)}
        />
        <ToggleSetting
          label="إظهار إشعارات القراءة"
          description="إظهار ما إذا قرأت الرسائل أم لا"
          checked={settings.privacy.showReadReceipts}
          onChange={(checked) => updateSetting('privacy', 'showReadReceipts', checked)}
        />
        <ToggleSetting
          label="إظهار مؤشر الكتابة"
          description="إظهار الآخرين أنك تكتب رسالة"
          checked={settings.privacy.showTypingIndicator}
          onChange={(checked) => updateSetting('privacy', 'showTypingIndicator', checked)}
        />
      </SettingsSection>

      {/* Display Settings */}
      <SettingsSection 
        title="العرض والتصميم" 
        icon={<Eye className="text-victory-gold" size={20} />}
      >
        <ToggleSetting
          label="صوت الرسائل"
          description="تشغيل صوت عند استلام رسالة جديدة"
          checked={settings.display.messageSound}
          onChange={(checked) => updateSetting('display', 'messageSound', checked)}
        />
        <ToggleSetting
          label="الوضع المضغوط"
          description="عرض الرسائل بطريقة أكثر اختصاراً"
          checked={settings.display.compactMode}
          onChange={(checked) => updateSetting('display', 'compactMode', checked)}
        />
        <ToggleSetting
          label="إظهار الأوقات"
          description="عرض وقت إرسال كل رسالة"
          checked={settings.display.showTimestamps}
          onChange={(checked) => updateSetting('display', 'showTimestamps', checked)}
        />
        <ToggleSetting
          label="تجميع الرسائل"
          description="تجميع الرسائل المتتالية من نفس المرسل"
          checked={settings.display.groupMessages}
          onChange={(checked) => updateSetting('display', 'groupMessages', checked)}
        />
        <ToggleSetting
          label="التمرير التلقائي"
          description="التمرير تلقائياً لأحدث رسالة"
          checked={settings.display.autoScrollToBottom}
          onChange={(checked) => updateSetting('display', 'autoScrollToBottom', checked)}
        />
      </SettingsSection>

      {/* Moderation Settings */}
      <SettingsSection 
        title="الإشراف والتصفية" 
        icon={<Settings className="text-orange-500" size={20} />}
      >
        <ToggleSetting
          label="حجب الرسائل المزعجة"
          description="إخفاء الرسائل التي تحتوي على محتوى مزعج"
          checked={settings.moderation.blockSpam}
          onChange={(checked) => updateSetting('moderation', 'blockSpam', checked)}
        />
        <ToggleSetting
          label="إخفاء الرسائل المحذوفة"
          description="عدم إظهار الرسائل التي تم حذفها من قبل المشرفين"
          checked={settings.moderation.hideDeletedMessages}
          onChange={(checked) => updateSetting('moderation', 'hideDeletedMessages', checked)}
        />
        <ToggleSetting
          label="الموافقة على الروابط"
          description="تتطلب موافقة المشرفين لعرض الروابط"
          checked={settings.moderation.requireApprovalForLinks}
          onChange={(checked) => updateSetting('moderation', 'requireApprovalForLinks', checked)}
        />

        {/* Muted Keywords */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">الكلمات المكتومة</h4>
          <div className="flex space-x-2 rtl:space-x-reverse">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="أضف كلمة للكتم..."
              className="flex-1 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              onKeyPress={(e) => e.key === 'Enter' && addMuteKeyword()}
            />
            <button onClick={addMuteKeyword} className="btn btn-outline">
              إضافة
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.moderation.muteKeywords.map((keyword, index) => (
              <span
                key={index}
                className="bg-alert-red/20 text-alert-red px-3 py-1 rounded-full text-sm flex items-center space-x-2 rtl:space-x-reverse"
              >
                <span>{keyword}</span>
                <button
                  onClick={() => removeMuteKeyword(index)}
                  className="text-alert-red hover:text-alert-red/80"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {settings.moderation.muteKeywords.length === 0 && (
            <p className="text-muted-foreground text-sm">لا توجد كلمات مكتومة</p>
          )}
        </div>
      </SettingsSection>

      {/* Role-specific Settings */}
      {(currentUserRole === 'leader' || currentUserRole === 'officer') && (
        <SettingsSection 
          title="إعدادات المشرفين" 
          icon={<Crown className="text-victory-gold" size={20} />}
        >
          <div className="bg-tactical-green/10 border border-tactical-green/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
              <Crown size={16} className="text-tactical-green" />
              <span className="font-medium text-foreground">صلاحيات خاصة</span>
            </div>
            <p className="text-sm text-muted-foreground">
              كـ{currentUserRole === 'leader' ? 'قائد' : 'ضابط'} العشيرة، لديك صلاحيات إضافية لإدارة رسائل العشيرة.
              يمكنك الوصول إلى إعدادات الإشراف المتقدمة من خلال صفحة إدارة العشيرة.
            </p>
            <button className="btn btn-outline btn-sm mt-3">
              <Settings size={16} />
              <span>إعدادات الإشراف المتقدمة</span>
            </button>
          </div>
        </SettingsSection>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse">
        <button onClick={resetSettings} className="btn btn-outline">
          <RotateCcw size={16} />
          <span>إعادة تعيين</span>
        </button>
        <button 
          onClick={saveSettings}
          className={`btn btn-primary ${hasUnsavedChanges ? 'animate-pulse' : ''}`}
        >
          <Save size={16} />
          <span>حفظ الإعدادات</span>
        </button>
      </div>
    </div>
  );
};

export default ClanMessageSettings; 