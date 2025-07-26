import React, { useState, useEffect } from 'react';
import { Mail, User, Calendar, Reply, Trash2, MoreHorizontal, MessageCircle, Users } from 'lucide-react';

interface Message {
  id: number;
  subject: string;
  content: string;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  receiverId: number;
  receiverName: string;
  isRead: boolean;
  createdAt: string;
  type: 'direct' | 'clan' | 'group';
  groupName?: string;
}

interface Conversation {
  id: number;
  participants: Array<{
    id: number;
    name: string;
    avatar?: string;
  }>;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  type: 'direct' | 'clan' | 'group';
  title: string;
}

const MessagesInterface: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageFilter, setMessageFilter] = useState<'all' | 'direct' | 'clan' | 'group'>('all');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem('zh_love_user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch('http://localhost:8080/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: number) => {
    try {
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch(`http://localhost:8080/api/messages/conversation/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setSelectedConversation(conversationId);
        
        // Mark messages as read
        markConversationAsRead(conversationId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markConversationAsRead = async (conversationId: number) => {
    try {
      const token = localStorage.getItem('zh_love_token');
      await fetch(`http://localhost:8080/api/messages/conversation/${conversationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update conversation unread count
      setConversations(conversations.map(conv => 
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ));
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (confirm('هل تريد حذف هذه الرسالة؟')) {
      try {
        const token = localStorage.getItem('zh_love_token');
        const response = await fetch(`http://localhost:8080/api/messages/${messageId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setMessages(messages.filter(msg => msg.id !== messageId));
        }
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return 'أمس';
    } else if (diffDays < 7) {
      return `منذ ${diffDays} أيام`;
    } else {
      return date.toLocaleDateString('ar-SA');
    }
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'clan': return <Users className="w-5 h-5 text-blue-400" />;
      case 'group': return <MessageCircle className="w-5 h-5 text-green-400" />;
      default: return <User className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (messageFilter === 'all') return true;
    return conv.type === messageFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Conversations Sidebar */}
      <div className="lg:col-span-1 bg-card border border-border rounded-lg overflow-hidden">
        {/* Filter Tabs */}
        <div className="border-b border-border p-4">
          <div className="flex space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setMessageFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                messageFilter === 'all' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setMessageFilter('direct')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                messageFilter === 'direct' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              مباشرة
            </button>
            <button
              onClick={() => setMessageFilter('clan')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                messageFilter === 'clan' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              العشائر
            </button>
            <button
              onClick={() => setMessageFilter('group')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                messageFilter === 'group' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              المجموعات
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="overflow-y-auto h-full">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">لا توجد محادثات</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => loadMessages(conversation.id)}
                className={`p-4 border-b border-border hover:bg-gray-800/50 cursor-pointer transition-colors ${
                  selectedConversation === conversation.id ? 'bg-gray-800/75' : ''
                }`}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    {getConversationIcon(conversation.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white truncate">
                        {conversation.title}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {formatDate(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
        {selectedConversation ? (
          <div className="flex flex-col h-full">
            {/* Messages Header */}
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {conversations.find(c => c.id === selectedConversation)?.title}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {messages.length} رسالة
                  </p>
                </div>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.senderId === currentUser?.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">
                        {message.senderName}
                      </span>
                      <span className="text-xs opacity-75">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {message.content}
                    </p>
                    {message.senderId !== currentUser?.id && (
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                        <button
                          onClick={() => {/* Handle reply */}}
                          className="text-xs opacity-75 hover:opacity-100 transition-opacity"
                        >
                          <Reply className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {message.senderId === currentUser?.id && (
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="text-xs opacity-75 hover:opacity-100 transition-opacity mt-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-border p-4">
              <div className="flex space-x-2 rtl:space-x-reverse">
                <input
                  type="text"
                  placeholder="اكتب رسالة..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  إرسال
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                اختر محادثة لعرضها
              </h3>
              <p className="text-gray-400">
                اختر محادثة من القائمة لعرض الرسائل
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesInterface; 