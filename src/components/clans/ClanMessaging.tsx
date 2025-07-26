import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Users, 
  Crown, 
  Shield, 
  MessageCircle, 
  Pin, 
  Trash2, 
  Edit3, 
  MoreVertical,
  Search,
  Filter,
  Bell,
  BellOff,
  Settings,
  Image,
  File,
  Smile,
  Reply,
  Quote,
  Download,
  X
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/i18n';

interface ClanMessagingProps {
  clanId: number;
  currentUserId: number;
  currentUserRole: 'leader' | 'officer' | 'member';
  className?: string;
}

interface ClanMessage {
  id: string;
  senderId: number;
  senderUsername: string;
  senderDisplayName: string;
  senderAvatar: string;
  senderRole: 'leader' | 'officer' | 'member';
  content: string;
  type: 'text' | 'image' | 'file' | 'announcement' | 'system';
  timestamp: string;
  isEdited: boolean;
  editedAt?: string;
  isPinned: boolean;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  reactions: Array<{
    emoji: string;
    count: number;
    userIds: number[];
  }>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: 'image' | 'file';
    size: number;
  }>;
}

interface ClanMember {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  role: 'leader' | 'officer' | 'member';
  isOnline: boolean;
  lastSeen: string;
}

interface AttachmentPreview {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file';
  size: number;
  file: File;
}

const ClanMessaging: React.FC<ClanMessagingProps> = ({
  clanId,
  currentUserId,
  currentUserRole,
  className = '',
}) => {
  const [messages, setMessages] = useState<ClanMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageFilter, setMessageFilter] = useState<'all' | 'announcements' | 'pinned'>('all');
  const [showMembers, setShowMembers] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ClanMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Mock data
  const clanMembers: ClanMember[] = [
    {
      id: 1,
      username: 'sultan_leader',
      displayName: 'سلطان الحرب',
      avatar: '/avatars/sultan.png',
      role: 'leader',
      isOnline: true,
      lastSeen: '2024-01-15T20:30:00Z'
    },
    {
      id: 2,
      username: 'officer_pro',
      displayName: 'قائد النصر',
      avatar: '/avatars/officer.png',
      role: 'officer',
      isOnline: true,
      lastSeen: '2024-01-15T20:25:00Z'
    },
    {
      id: 3,
      username: 'member_active',
      displayName: 'المحارب النشط',
      avatar: '/avatars/member.png',
      role: 'member',
      isOnline: false,
      lastSeen: '2024-01-15T18:00:00Z'
    }
  ];

  const mockMessages: ClanMessage[] = [
    {
      id: 'm1',
      senderId: 1,
      senderUsername: 'sultan_leader',
      senderDisplayName: 'سلطان الحرب',
      senderAvatar: '/avatars/sultan.png',
      senderRole: 'leader',
      content: 'مرحباً بالجميع! هذه رسالة ترحيب في دردشة العشيرة',
      type: 'announcement',
      timestamp: '2024-01-15T10:00:00Z',
      isEdited: false,
      isPinned: true,
      reactions: [
        { emoji: '👍', count: 5, userIds: [2, 3, 4, 5, 6] },
        { emoji: '❤️', count: 3, userIds: [2, 3, 4] }
      ]
    },
    {
      id: 'm2',
      senderId: 2,
      senderUsername: 'officer_pro',
      senderDisplayName: 'قائد النصر',
      senderAvatar: '/avatars/officer.png',
      senderRole: 'officer',
      content: 'هل يمكن للجميع الاستعداد لحرب العشيرة غداً؟',
      type: 'text',
      timestamp: '2024-01-15T14:30:00Z',
      isEdited: false,
      isPinned: false,
      reactions: [
        { emoji: '✅', count: 8, userIds: [1, 3, 4, 5, 6, 7, 8, 9] }
      ]
    },
    {
      id: 'm3',
      senderId: 3,
      senderUsername: 'member_active',
      senderDisplayName: 'المحارب النشط',
      senderAvatar: '/avatars/member.png',
      senderRole: 'member',
      content: 'أنا جاهز! متى الموعد بالضبط؟',
      type: 'text',
      timestamp: '2024-01-15T14:35:00Z',
      isEdited: false,
      isPinned: false,
      replyTo: {
        messageId: 'm2',
        content: 'هل يمكن للجميع الاستعداد لحرب العشيرة غداً؟',
        senderName: 'قائد النصر'
      },
      reactions: []
    },
    {
      id: 'm4',
      senderId: 1,
      senderUsername: 'sultan_leader',
      senderDisplayName: 'سلطان الحرب',
      senderAvatar: '/avatars/sultan.png',
      senderRole: 'leader',
      content: 'شاهدوا هذه الصورة من المعركة الأخيرة!',
      type: 'image',
      timestamp: '2024-01-15T15:00:00Z',
      isEdited: false,
      isPinned: false,
      reactions: [
        { emoji: '🔥', count: 3, userIds: [2, 3, 4] }
      ],
      attachments: [
        {
          id: 'img1',
          name: 'battle-screenshot.png',
          url: 'https://picsum.photos/400/300?random=1',
          type: 'image',
          size: 1024000
        }
      ]
    },
    {
      id: 'm5',
      senderId: 2,
      senderUsername: 'officer_pro',
      senderDisplayName: 'قائد النصر',
      senderAvatar: '/avatars/officer.png',
      senderRole: 'officer',
      content: 'إليكم ملف الاستراتيجيات الجديد',
      type: 'file',
      timestamp: '2024-01-15T16:00:00Z',
      isEdited: false,
      isPinned: false,
      reactions: [],
      attachments: [
        {
          id: 'file1',
          name: 'strategies.pdf',
          url: '#',
          type: 'file',
          size: 2048000
        }
      ]
    }
  ];

  useEffect(() => {
    setMessages(mockMessages);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (files: FileList | null, type: 'image' | 'file') => {
    if (!files) return;

    const newAttachments = Array.from(files).map(file => ({
      id: `${type}_${Date.now()}_${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: type as 'image' | 'file',
      size: file.size,
      file: file
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(att => att.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(att => att.id !== id);
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    const message: ClanMessage = {
      id: `m${Date.now()}`,
      senderId: currentUserId,
      senderUsername: 'current_user',
      senderDisplayName: 'أنت',
      senderAvatar: '/avatars/current_user.png',
      senderRole: currentUserRole,
      content: newMessage || (attachments.length > 0 ? `${attachments.length} ملف مرفق` : ''),
      type: attachments.length > 0 ? (attachments[0].type === 'image' ? 'image' : 'file') : 'text',
      timestamp: new Date().toISOString(),
      isEdited: false,
      isPinned: false,
      replyTo: replyingTo ? {
        messageId: replyingTo.id,
        content: replyingTo.content,
        senderName: replyingTo.senderDisplayName
      } : undefined,
      reactions: [],
      attachments: attachments.length > 0 ? attachments.map(att => ({
        id: att.id,
        name: att.name,
        url: att.url,
        type: att.type,
        size: att.size
      })) : undefined
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setReplyingTo(null);
    setAttachments([]);
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: newContent, isEdited: true, editedAt: new Date().toISOString() }
        : msg
    ));
    setEditingMessage(null);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
  };

  const handlePinMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
    ));
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.userIds.includes(currentUserId)) {
            // Remove reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count - 1, userIds: r.userIds.filter(id => id !== currentUserId) }
                  : r
              ).filter(r => r.count > 0)
            };
          } else {
            // Add reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count + 1, userIds: [...r.userIds, currentUserId] }
                  : r
              )
            };
          }
        } else {
          // New reaction
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1, userIds: [currentUserId] }]
          };
        }
      }
      return msg;
    }));
  };

  const canManageMessage = (message: ClanMessage) => {
    return message.senderId === currentUserId || 
           (currentUserRole === 'leader') ||
           (currentUserRole === 'officer' && message.senderRole === 'member');
  };

  const canPinMessage = () => {
    return currentUserRole === 'leader' || currentUserRole === 'officer';
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

  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchQuery || 
      message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.senderDisplayName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      messageFilter === 'all' ||
      (messageFilter === 'announcements' && message.type === 'announcement') ||
      (messageFilter === 'pinned' && message.isPinned);
    
    return matchesSearch && matchesFilter;
  });

  const MessageComponent: React.FC<{ message: ClanMessage }> = ({ message }) => {
    const [showActions, setShowActions] = useState(false);
    const isOwn = message.senderId === currentUserId;
    const canManage = canManageMessage(message);

    return (
      <div 
        className={`flex space-x-3 rtl:space-x-reverse p-3 rounded-lg transition-colors ${
          message.isPinned ? 'bg-tactical-green/10' : 
          message.type === 'announcement' ? 'bg-victory-gold/10' : 
          'hover:bg-muted/50'
        } ${selectedMessage === message.id ? 'bg-primary/10' : ''}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Avatar */}
        <img 
          src={message.senderAvatar} 
          alt={message.senderDisplayName}
          className="w-10 h-10 rounded-full flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
            {getRoleIcon(message.senderRole)}
            <span className={`font-semibold ${getRoleColor(message.senderRole)}`}>
              {message.senderDisplayName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(new Date(message.timestamp))}
            </span>
            {message.isEdited && (
              <span className="text-xs text-muted-foreground">(محرر)</span>
            )}
            {message.isPinned && (
              <Pin size={12} className="text-tactical-green" />
            )}
            {message.type === 'announcement' && (
              <Bell size={12} className="text-victory-gold" />
            )}
          </div>

          {/* Reply Reference */}
          {message.replyTo && (
            <div className="bg-muted/50 border-l-2 border-primary pl-3 rtl:pr-3 rtl:border-r-2 rtl:border-l-0 mb-2 py-1">
              <div className="text-xs text-muted-foreground">
                رد على {message.replyTo.senderName}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {message.replyTo.content}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="text-foreground whitespace-pre-wrap break-words">
            {editingMessage === message.id ? (
              <div className="space-y-2">
                <textarea
                  value={message.content}
                  onChange={(e) => {
                    setMessages(prev => prev.map(msg => 
                      msg.id === message.id ? { ...msg, content: e.target.value } : msg
                    ));
                  }}
                  className="w-full p-2 border border-border rounded resize-none bg-input"
                  rows={2}
                />
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => handleEditMessage(message.id, message.content)}
                    className="btn btn-primary btn-sm"
                  >
                    حفظ
                  </button>
                  <button
                    onClick={() => setEditingMessage(null)}
                    className="btn btn-outline btn-sm"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              message.content
            )}
          </div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((attachment) => (
                <div key={attachment.id}>
                  {attachment.type === 'image' ? (
                    <div className="border border-border rounded-lg overflow-hidden max-w-sm">
                      <img 
                        src={attachment.url} 
                        alt={attachment.name}
                        className="w-full h-auto cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => window.open(attachment.url, '_blank')}
                      />
                      <div className="p-2 bg-muted/50 text-xs text-muted-foreground">
                        {attachment.name} • {formatFileSize(attachment.size)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse p-3 border border-border rounded-lg bg-muted/30 max-w-sm">
                      <File size={24} className="text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">
                          {attachment.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)}
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(attachment.url, '_blank')}
                        className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground flex-shrink-0"
                        title="تحميل"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div className="flex items-center space-x-1 rtl:space-x-reverse mt-2">
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => handleReaction(message.id, reaction.emoji)}
                  className={`flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 rounded-full text-xs transition-colors ${
                    reaction.userIds.includes(currentUserId)
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <button
              onClick={() => setReplyingTo(message)}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
              title="رد"
            >
              <Reply size={16} />
            </button>
            
            <button
              onClick={() => handleReaction(message.id, '👍')}
              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
              title="إعجاب"
            >
              <Smile size={16} />
            </button>

            {canPinMessage() && (
              <button
                onClick={() => handlePinMessage(message.id)}
                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
                title={message.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
              >
                <Pin size={16} />
              </button>
            )}

            {canManage && (
              <div className="relative">
                <button
                  onClick={() => setSelectedMessage(selectedMessage === message.id ? null : message.id)}
                  className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical size={16} />
                </button>
                
                {selectedMessage === message.id && (
                  <div className="absolute right-0 rtl:left-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                    {isOwn && (
                      <button
                        onClick={() => {
                          setEditingMessage(message.id);
                          setSelectedMessage(null);
                        }}
                        className="w-full px-3 py-2 text-left rtl:text-right hover:bg-accent transition-colors flex items-center space-x-2 rtl:space-x-reverse text-sm"
                      >
                        <Edit3 size={14} />
                        <span>تعديل</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleDeleteMessage(message.id);
                        setSelectedMessage(null);
                      }}
                      className="w-full px-3 py-2 text-left rtl:text-right hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center space-x-2 rtl:space-x-reverse text-sm"
                    >
                      <Trash2 size={14} />
                      <span>حذف</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-[600px] bg-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <MessageCircle className="text-tactical-green" size={20} />
            <h2 className="text-lg font-semibold text-foreground">دردشة العشيرة</h2>
            <span className="text-sm text-muted-foreground">
              ({clanMembers.filter(m => m.isOnline).length} متصل)
            </span>
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setNotifications(!notifications)}
              className={`p-2 rounded ${notifications ? 'text-tactical-green' : 'text-muted-foreground'}`}
              title={notifications ? 'إيقاف الإشعارات' : 'تفعيل الإشعارات'}
            >
              {notifications ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
            
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="p-2 rounded text-muted-foreground hover:text-foreground"
              title="عرض الأعضاء"
            >
              <Users size={16} />
            </button>
            
            <button className="p-2 rounded text-muted-foreground hover:text-foreground" title="الإعدادات">
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse mt-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="البحث في الرسائل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 rtl:pr-9 rtl:pl-3 pr-3 py-1 bg-input border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          <select
            value={messageFilter}
            onChange={(e) => setMessageFilter(e.target.value as any)}
            className="bg-input border border-border rounded px-2 py-1 text-sm"
          >
            <option value="all">جميع الرسائل</option>
            <option value="announcements">الإعلانات</option>
            <option value="pinned">المثبتة</option>
          </select>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredMessages.map((message) => (
              <MessageComponent key={message.id} message={message} />
            ))}
            
            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>{typingUsers.join(', ')} يكتب...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Preview */}
          {replyingTo && (
            <div className="p-3 bg-muted border-t border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Reply size={16} className="text-primary" />
                  <span className="text-sm text-foreground">
                    رد على {replyingTo.senderDisplayName}
                  </span>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="text-sm text-muted-foreground mt-1 truncate">
                {replyingTo.content}
              </div>
            </div>
          )}

          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <div className="p-3 bg-muted border-t border-border">
              <div className="text-sm text-foreground mb-2">الملفات المرفقة:</div>
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center space-x-2 rtl:space-x-reverse bg-background rounded p-2">
                    {attachment.type === 'image' ? (
                      <img src={attachment.url} alt={attachment.name} className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <File size={16} className="text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{attachment.name}</div>
                      <div className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</div>
                    </div>
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-end space-x-2 rtl:space-x-reverse">
              <div className="flex-1">
                <textarea
                  ref={messageInputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="اكتب رسالتك..."
                  className="w-full p-2 border border-border rounded-lg resize-none bg-input focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={1}
                />
              </div>
              
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
                  title="إرفاق ملف"
                >
                  <File size={20} />
                </button>
                
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
                  title="إرفاق صورة"
                >
                  <Image size={20} />
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && attachments.length === 0}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Members Sidebar */}
        {showMembers && (
          <div className="w-64 border-l rtl:border-r rtl:border-l-0 border-border bg-muted/30">
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-3">أعضاء العشيرة</h3>
              <div className="space-y-2">
                {clanMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 rtl:space-x-reverse p-2 rounded hover:bg-accent">
                    <div className="relative">
                      <img 
                        src={member.avatar} 
                        alt={member.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-tactical-green rounded-full border border-background"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        {getRoleIcon(member.role)}
                        <span className="font-medium text-foreground text-sm truncate">
                          {member.displayName}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.isOnline ? 'متصل' : `آخر ظهور ${formatTime(new Date(member.lastSeen))}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files, 'file')}
      />
      
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files, 'image')}
      />
    </div>
  );
};

export default ClanMessaging; 