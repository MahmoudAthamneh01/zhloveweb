import React, { useState } from 'react';
import { 
  MessageCircle, 
  Pin, 
  Trash2, 
  Edit3, 
  Bell, 
  Users, 
  Crown, 
  Shield, 
  AlertTriangle,
  Send,
  Filter,
  Search,
  Calendar,
  Clock,
  Ban,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/i18n';

interface ClanMessageManagerProps {
  clanId: number;
  currentUserId: number;
  currentUserRole: 'leader' | 'officer' | 'member';
  className?: string;
}

interface MessageModerationAction {
  id: string;
  messageId: string;
  action: 'delete' | 'pin' | 'unpin' | 'mute_user' | 'warn_user';
  moderatorId: number;
  moderatorName: string;
  reason: string;
  timestamp: string;
}

interface ClanMember {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  role: 'leader' | 'officer' | 'member';
  messageCount: number;
  isMuted: boolean;
  mutedUntil?: string;
  warnings: number;
  lastActivity: string;
}

interface AnnouncementTemplate {
  id: string;
  title: string;
  content: string;
  category: 'war' | 'event' | 'rule' | 'general';
  isActive: boolean;
}

const ClanMessageManager: React.FC<ClanMessageManagerProps> = ({
  clanId,
  currentUserId,
  currentUserRole,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'announcements' | 'members'>('overview');
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [announcementCategory, setAnnouncementCategory] = useState<'war' | 'event' | 'rule' | 'general'>('general');
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);

  // Mock data
  const messageStats = {
    totalMessages: 1250,
    messagesThisWeek: 145,
    activeUsers: 18,
    pinnedMessages: 3,
    announcements: 8,
    moderationActions: 12
  };

  const recentActions: MessageModerationAction[] = [
    {
      id: 'a1',
      messageId: 'm123',
      action: 'delete',
      moderatorId: 1,
      moderatorName: 'سلطان الحرب',
      reason: 'رسالة غير مناسبة',
      timestamp: '2024-01-15T20:30:00Z'
    },
    {
      id: 'a2',
      messageId: 'm124',
      action: 'pin',
      moderatorId: 2,
      moderatorName: 'قائد النصر',
      reason: 'إعلان مهم عن الحرب',
      timestamp: '2024-01-15T19:45:00Z'
    }
  ];

  const clanMembers: ClanMember[] = [
    {
      id: 1,
      username: 'sultan_leader',
      displayName: 'سلطان الحرب',
      avatar: '/avatars/sultan.png',
      role: 'leader',
      messageCount: 156,
      isMuted: false,
      warnings: 0,
      lastActivity: '2024-01-15T20:30:00Z'
    },
    {
      id: 2,
      username: 'officer_pro',
      displayName: 'قائد النصر',
      avatar: '/avatars/officer.png',
      role: 'officer',
      messageCount: 98,
      isMuted: false,
      warnings: 0,
      lastActivity: '2024-01-15T20:25:00Z'
    },
    {
      id: 3,
      username: 'troublemaker',
      displayName: 'عضو مشاكس',
      avatar: '/avatars/member.png',
      role: 'member',
      messageCount: 45,
      isMuted: true,
      mutedUntil: '2024-01-16T12:00:00Z',
      warnings: 2,
      lastActivity: '2024-01-15T18:00:00Z'
    }
  ];

  const announcementTemplates: AnnouncementTemplate[] = [
    {
      id: 't1',
      title: 'إعلان حرب العشيرة',
      content: 'تذكير: حرب العشيرة ستبدأ غداً في الساعة 8:00 مساءً. يرجى من جميع الأعضاء الاستعداد والحضور.',
      category: 'war',
      isActive: true
    },
    {
      id: 't2',
      title: 'قوانين الدردشة',
      content: 'تذكير بقوانين الدردشة: 1- احترام جميع الأعضاء 2- عدم استخدام ألفاظ نابية 3- عدم النشر خارج الموضوع',
      category: 'rule',
      isActive: true
    }
  ];

  const canModerate = currentUserRole === 'leader' || currentUserRole === 'officer';
  const isLeader = currentUserRole === 'leader';

  const handleMuteMember = (memberId: number, duration: number) => {
    const member = clanMembers.find(m => m.id === memberId);
    if (!member || !canModerate) return;

    const mutedUntil = new Date();
    mutedUntil.setHours(mutedUntil.getHours() + duration);

    console.log(`Muting member ${member.displayName} until ${mutedUntil.toISOString()}`);
    // Here you would update the member's muted status
  };

  const handleWarnMember = (memberId: number, reason: string) => {
    const member = clanMembers.find(m => m.id === memberId);
    if (!member || !canModerate) return;

    console.log(`Warning member ${member.displayName} for: ${reason}`);
    // Here you would increment the member's warning count
  };

  const handleSendAnnouncement = () => {
    if (!newAnnouncement.trim() || !canModerate) return;

    const announcement = {
      content: newAnnouncement,
      category: announcementCategory,
      timestamp: new Date().toISOString()
    };

    console.log('Sending announcement:', announcement);
    setNewAnnouncement('');
    setShowAnnouncementForm(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader':
        return <Crown size={14} className="text-victory-gold" />;
      case 'officer':
        return <Shield size={14} className="text-command-blue" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'leader':
        return 'text-victory-gold';
      case 'officer':
        return 'text-command-blue';
      case 'member':
        return 'text-tactical-green';
      default:
        return 'text-muted-foreground';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'delete':
        return <Trash2 size={14} className="text-alert-red" />;
      case 'pin':
        return <Pin size={14} className="text-tactical-green" />;
      case 'unpin':
        return <Pin size={14} className="text-muted-foreground" />;
      case 'mute_user':
        return <VolumeX size={14} className="text-victory-gold" />;
      case 'warn_user':
        return <AlertTriangle size={14} className="text-orange-500" />;
      default:
        return <MessageCircle size={14} />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'delete':
        return 'حذف رسالة';
      case 'pin':
        return 'تثبيت رسالة';
      case 'unpin':
        return 'إلغاء تثبيت';
      case 'mute_user':
        return 'كتم عضو';
      case 'warn_user':
        return 'تحذير عضو';
      default:
        return action;
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="military-card p-4 text-center">
          <MessageCircle className="w-8 h-8 mx-auto text-tactical-green mb-2" />
          <div className="text-xl font-bold text-foreground">{messageStats.totalMessages}</div>
          <div className="text-sm text-muted-foreground">إجمالي الرسائل</div>
          <div className="text-xs text-tactical-green mt-1">+{messageStats.messagesThisWeek} هذا الأسبوع</div>
        </div>
        <div className="military-card p-4 text-center">
          <Users className="w-8 h-8 mx-auto text-command-blue mb-2" />
          <div className="text-xl font-bold text-foreground">{messageStats.activeUsers}</div>
          <div className="text-sm text-muted-foreground">أعضاء نشطين</div>
        </div>
        <div className="military-card p-4 text-center">
          <Pin className="w-8 h-8 mx-auto text-victory-gold mb-2" />
          <div className="text-xl font-bold text-foreground">{messageStats.pinnedMessages}</div>
          <div className="text-sm text-muted-foreground">رسائل مثبتة</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setShowAnnouncementForm(true)}
            className="btn btn-primary flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Bell size={16} />
            <span>إرسال إعلان</span>
          </button>
          <button className="btn btn-outline flex items-center space-x-2 rtl:space-x-reverse">
            <Pin size={16} />
            <span>عرض الرسائل المثبتة</span>
          </button>
          <button className="btn btn-outline flex items-center space-x-2 rtl:space-x-reverse">
            <Users size={16} />
            <span>إدارة الأعضاء</span>
          </button>
          <button className="btn btn-outline flex items-center space-x-2 rtl:space-x-reverse">
            <Eye size={16} />
            <span>عرض الإحصائيات</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">النشاط الأخير</h3>
        <div className="space-y-3">
          {recentActions.slice(0, 5).map((action) => (
            <div key={action.id} className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-muted rounded-lg">
              {getActionIcon(action.action)}
              <div className="flex-1">
                <div className="text-sm text-foreground">
                  {getActionText(action.action)} بواسطة {action.moderatorName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {action.reason} • {formatTime(new Date(action.timestamp))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ModerationTab = () => (
    <div className="space-y-6">
      {/* Moderation Actions */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">إجراءات الإشراف</h3>
        <div className="space-y-4">
          {recentActions.map((action) => (
            <div key={action.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {getActionIcon(action.action)}
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {getActionText(action.action)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    بواسطة {action.moderatorName} • {formatDate(new Date(action.timestamp))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    السبب: {action.reason}
                  </div>
                </div>
              </div>
              <button className="btn btn-outline btn-sm">
                <Eye size={14} />
                <span>تفاصيل</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">إجراءات متعددة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="btn btn-outline flex items-center space-x-2 rtl:space-x-reverse">
            <Trash2 size={16} />
            <span>حذف رسائل محددة</span>
          </button>
          <button className="btn btn-outline flex items-center space-x-2 rtl:space-x-reverse">
            <Pin size={16} />
            <span>تثبيت متعدد</span>
          </button>
          <button className="btn btn-outline flex items-center space-x-2 rtl:space-x-reverse">
            <Ban size={16} />
            <span>كتم أعضاء</span>
          </button>
          <button className="btn btn-outline flex items-center space-x-2 rtl:space-x-reverse">
            <AlertTriangle size={16} />
            <span>تحذيرات جماعية</span>
          </button>
        </div>
      </div>
    </div>
  );

  const AnnouncementsTab = () => (
    <div className="space-y-6">
      {/* Send Announcement */}
      {showAnnouncementForm && (
        <div className="military-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">إرسال إعلان جديد</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">نوع الإعلان</label>
              <select
                value={announcementCategory}
                onChange={(e) => setAnnouncementCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="general">عام</option>
                <option value="war">حرب العشيرة</option>
                <option value="event">حدث</option>
                <option value="rule">قوانين</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">محتوى الإعلان</label>
              <textarea
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                placeholder="اكتب إعلانك هنا..."
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button onClick={handleSendAnnouncement} className="btn btn-primary">
                <Send size={16} />
                <span>إرسال الإعلان</span>
              </button>
              <button 
                onClick={() => setShowAnnouncementForm(false)}
                className="btn btn-outline"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Templates */}
      <div className="military-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">قوالب الإعلانات</h3>
          <button 
            onClick={() => setShowAnnouncementForm(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            <span>إعلان جديد</span>
          </button>
        </div>
        <div className="space-y-3">
          {announcementTemplates.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                  <h4 className="font-medium text-foreground">{template.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    template.category === 'war' ? 'bg-alert-red/20 text-alert-red' :
                    template.category === 'event' ? 'bg-victory-gold/20 text-victory-gold' :
                    template.category === 'rule' ? 'bg-command-blue/20 text-command-blue' :
                    'bg-tactical-green/20 text-tactical-green'
                  }`}>
                    {template.category === 'war' ? 'حرب' :
                     template.category === 'event' ? 'حدث' :
                     template.category === 'rule' ? 'قانون' : 'عام'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{template.content}</p>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button className="btn btn-outline btn-sm">
                  <Send size={14} />
                  <span>استخدام</span>
                </button>
                <button className="btn btn-outline btn-sm">
                  <Edit3 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const MembersTab = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="military-card p-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="flex-1 relative">
            <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="البحث عن عضو..."
              className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select className="bg-input border border-border rounded-lg px-3 py-2">
            <option value="">جميع الأعضاء</option>
            <option value="muted">مكتومين</option>
            <option value="warned">محذرين</option>
            <option value="active">نشطين</option>
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">إدارة الأعضاء</h3>
        <div className="space-y-4">
          {clanMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <img src={member.avatar} alt={member.displayName} className="w-12 h-12 rounded-full" />
                <div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {getRoleIcon(member.role)}
                    <span className={`font-medium ${getRoleColor(member.role)}`}>
                      {member.displayName}
                    </span>
                    {member.isMuted && (
                      <VolumeX size={14} className="text-victory-gold" title="مكتوم" />
                    )}
                    {member.warnings > 0 && (
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <AlertTriangle size={14} className="text-orange-500" />
                        <span className="text-xs text-orange-500">{member.warnings}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.messageCount} رسالة • آخر نشاط: {formatTime(new Date(member.lastActivity))}
                  </div>
                  {member.isMuted && member.mutedUntil && (
                    <div className="text-xs text-victory-gold">
                      مكتوم حتى {formatDate(new Date(member.mutedUntil))}
                    </div>
                  )}
                </div>
              </div>
              
              {canModerate && member.id !== currentUserId && (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {!member.isMuted ? (
                    <button
                      onClick={() => handleMuteMember(member.id, 24)}
                      className="btn btn-outline btn-sm"
                    >
                      <VolumeX size={14} />
                      <span>كتم</span>
                    </button>
                  ) : (
                    <button className="btn btn-outline btn-sm">
                      <Volume2 size={14} />
                      <span>إلغاء الكتم</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleWarnMember(member.id, 'مخالفة قوانين الدردشة')}
                    className="btn btn-outline btn-sm"
                  >
                    <AlertTriangle size={14} />
                    <span>تحذير</span>
                  </button>
                  
                  {isLeader && member.role === 'member' && (
                    <button className="btn btn-outline btn-sm">
                      <Shield size={14} />
                      <span>ترقية</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!canModerate) {
    return (
      <div className={`military-card p-6 text-center ${className}`}>
        <AlertTriangle className="w-12 h-12 mx-auto text-victory-gold mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">صلاحيات محدودة</h3>
        <p className="text-muted-foreground">
          هذه الصفحة متاحة للقادة والضباط فقط
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">إدارة رسائل العشيرة</h2>
        <button 
          onClick={() => setShowAnnouncementForm(true)}
          className="btn btn-primary flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Bell size={16} />
          <span>إرسال إعلان</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 rtl:space-x-reverse">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: MessageCircle },
            { id: 'moderation', label: 'الإشراف', icon: Shield },
            { id: 'announcements', label: 'الإعلانات', icon: Bell },
            { id: 'members', label: 'الأعضاء', icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 rtl:space-x-reverse transition-colors
                ${activeTab === id 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'moderation' && <ModerationTab />}
      {activeTab === 'announcements' && <AnnouncementsTab />}
      {activeTab === 'members' && <MembersTab />}
    </div>
  );
};

export default ClanMessageManager; 