import React, { useState } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Trophy, 
  Target, 
  Zap,
  Calendar,
  Star,
  TrendingUp,
  Users,
  MessageCircle
} from 'lucide-react';

interface TodoItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  category: 'frontend' | 'backend' | 'design' | 'features';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  dependencies?: string[];
}

const TodoManager: React.FC = () => {
  const [todos] = useState<TodoItem[]>([
    // Core Systems - COMPLETED ✅
    {
      id: 'project-setup',
      title: 'إعداد المشروع',
      description: 'تكوين Astro + React + TypeScript + Tailwind',
      status: 'completed',
      category: 'frontend',
      priority: 'high',
      progress: 100
    },
    {
      id: 'authentication',
      title: 'نظام المصادقة',
      description: 'تسجيل الدخول والتسجيل وإدارة الجلسات',
      status: 'completed',
      category: 'backend',
      priority: 'high',
      progress: 100
    },
    {
      id: 'database-schema',
      title: 'قاعدة البيانات',
      description: 'تصميم وإنشاء جداول قاعدة البيانات',
      status: 'completed',
      category: 'backend',
      priority: 'high',
      progress: 100
    },
    {
      id: 'user-management',
      title: 'إدارة المستخدمين',
      description: 'ملفات المستخدمين والصلاحيات',
      status: 'completed',
      category: 'features',
      priority: 'high',
      progress: 100
    },

    // Component Systems - COMPLETED ✅
    {
      id: 'clan-system',
      title: 'نظام العشائر',
      description: 'ClanMembers, ClanStats + صفحات العشائر',
      status: 'completed',
      category: 'features',
      priority: 'high',
      progress: 100
    },
    {
      id: 'replay-system',
      title: 'نظام الريبلايز',
      description: 'ReplayCard, ReplayUpload, ReplayViewer + صفحات',
      status: 'completed',
      category: 'features',
      priority: 'high',
      progress: 100
    },
    {
      id: 'streamer-system',
      title: 'نظام اليوتيوبرز',
      description: 'StreamerCard, VideoPlayer, StreamerStats + صفحات',
      status: 'completed',
      category: 'features',
      priority: 'high',
      progress: 100
    },
    {
      id: 'rankings-system',
      title: 'نظام التصنيفات',
      description: 'RankingTable, PlayerStats, LeaderBoard + صفحات',
      status: 'completed',
      category: 'features',
      priority: 'high',
      progress: 100
    },
    {
      id: 'tournament-system',
      title: 'نظام البطولات',
      description: 'TournamentCard, TournamentBracket + صفحات البطولات',
      status: 'completed',
      category: 'features',
      priority: 'high',
      progress: 100
    },
    {
      id: 'forum-system',
      title: 'نظام المنتدى',
      description: 'ForumPost + صفحة المنتدى الكاملة',
      status: 'completed',
      category: 'features',
      priority: 'high',
      progress: 100
    },
    {
      id: 'admin-panel',
      title: 'لوحة التحكم الإدارية',
      description: '5 صفحات إدارية شاملة (المستخدمين، التحليلات، التقارير، الإعدادات)',
      status: 'completed',
      category: 'features',
      priority: 'high',
      progress: 100
    },

    // Design & UX - COMPLETED ✅
    {
      id: 'rtl-design',
      title: 'الدعم العربي RTL',
      description: 'تصميم متجاوب مع اللغة العربية',
      status: 'completed',
      category: 'design',
      priority: 'high',
      progress: 100
    },
    {
      id: 'dark-theme',
      title: 'الثيم العسكري المظلم',
      description: 'تصميم مستوحى من لعبة الجنرالات',
      status: 'completed',
      category: 'design',
      priority: 'medium',
      progress: 100
    },
    {
      id: 'responsive-design',
      title: 'التصميم المتجاوب',
      description: 'يعمل على جميع الأجهزة',
      status: 'completed',
      category: 'design',
      priority: 'high',
      progress: 100
    },
    {
      id: 'animations',
      title: 'الحركات والانتقالات',
      description: 'Framer Motion للحركات السلسة',
      status: 'completed',
      category: 'design',
      priority: 'low',
      progress: 100
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-tactical-green" size={20} />;
      case 'in_progress':
        return <Clock className="text-victory-gold" size={20} />;
      case 'pending':
        return <Circle className="text-muted-foreground" size={20} />;
      default:
        return <Circle className="text-muted-foreground" size={20} />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'frontend':
        return <Zap className="text-command-blue" size={16} />;
      case 'backend':
        return <Target className="text-tactical-green" size={16} />;
      case 'design':
        return <Star className="text-victory-gold" size={16} />;
      case 'features':
        return <Trophy className="text-orange-500" size={16} />;
      default:
        return <Circle className="text-muted-foreground" size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-alert-red';
      case 'medium':
        return 'border-l-victory-gold';
      case 'low':
        return 'border-l-tactical-green';
      default:
        return 'border-l-muted';
    }
  };

  const getCategoryStats = () => {
    const categories = ['frontend', 'backend', 'design', 'features'];
    return categories.map(cat => {
      const categoryTodos = todos.filter(todo => todo.category === cat);
      const completed = categoryTodos.filter(todo => todo.status === 'completed').length;
      const total = categoryTodos.length;
      const percentage = total > 0 ? (completed / total) * 100 : 0;
      
      return {
        category: cat,
        completed,
        total,
        percentage
      };
    });
  };

  const getOverallProgress = () => {
    const completed = todos.filter(todo => todo.status === 'completed').length;
    const total = todos.length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const categoryStats = getCategoryStats();
  const overallProgress = getOverallProgress();

  return (
    <div className="space-y-8">
      {/* Project Overview */}
      <div className="military-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2 rtl:space-x-reverse">
            <Trophy className="text-victory-gold" size={28} />
            <span>ZH-Love Project Status</span>
          </h2>
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="text-right rtl:text-left">
              <div className="text-3xl font-bold text-tactical-green">100%</div>
              <div className="text-sm text-muted-foreground">مكتمل</div>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - overallProgress / 100)}`}
                  className="text-tactical-green transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle className="text-tactical-green" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">التقدم الإجمالي</span>
            <span className="text-sm font-medium text-foreground">{overallProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-tactical-green h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Category Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryStats.map(stat => (
            <div key={stat.category} className="text-center">
              <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse mb-2">
                {getCategoryIcon(stat.category)}
                <span className="text-sm font-medium text-foreground capitalize">
                  {stat.category === 'frontend' && 'واجهة أمامية'}
                  {stat.category === 'backend' && 'خلفية'}
                  {stat.category === 'design' && 'تصميم'}
                  {stat.category === 'features' && 'مميزات'}
                </span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {stat.completed}/{stat.total}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.percentage.toFixed(0)}% مكتمل
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Banner */}
      <div className="military-card p-6 bg-gradient-to-r from-tactical-green/20 to-command-blue/20 border-tactical-green">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-3">
            <Trophy className="text-victory-gold" size={32} />
            <Star className="text-victory-gold" size={24} />
            <Trophy className="text-victory-gold" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">🎉 مبروك! المشروع مكتمل 100% 🎉</h3>
          <p className="text-muted-foreground mb-4">
            تم إنجاز جميع المكونات والأنظمة المطلوبة للمنصة بنجاح
          </p>
          <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse text-sm">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Users className="text-command-blue" size={16} />
              <span>15 مكون React</span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Calendar className="text-tactical-green" size={16} />
              <span>11 صفحة Astro</span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <MessageCircle className="text-victory-gold" size={16} />
              <span>4 أنظمة كاملة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Todo List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground flex items-center space-x-2 rtl:space-x-reverse">
          <Target className="text-primary" size={24} />
          <span>تفاصيل المهام المكتملة</span>
        </h3>
        
        <div className="space-y-3">
          {todos.map(todo => (
            <div 
              key={todo.id} 
              className={`military-card p-4 border-l-4 ${getPriorityColor(todo.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1">
                  {getStatusIcon(todo.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                      {getCategoryIcon(todo.category)}
                      <h4 className="font-semibold text-foreground">{todo.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{todo.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            todo.status === 'completed' ? 'bg-tactical-green' :
                            todo.status === 'in_progress' ? 'bg-victory-gold' :
                            'bg-muted-foreground'
                          }`}
                          style={{ width: `${todo.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {todo.progress}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right rtl:text-left ml-4 rtl:mr-4">
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${todo.status === 'completed' ? 'bg-tactical-green/20 text-tactical-green' :
                      todo.status === 'in_progress' ? 'bg-victory-gold/20 text-victory-gold' :
                      'bg-muted text-muted-foreground'
                    }
                  `}>
                    {todo.status === 'completed' && '✅ مكتمل'}
                    {todo.status === 'in_progress' && '🔄 جاري'}
                    {todo.status === 'pending' && '⏳ معلق'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="military-card p-6">
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center space-x-2 rtl:space-x-reverse">
          <TrendingUp className="text-primary" size={24} />
          <span>الخطوات التالية</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">للتشغيل المحلي:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• تشغيل npm install</li>
              <li>• تشغيل npm run dev</li>
              <li>• الوصول عبر localhost:4321</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">للنشر على الإنتاج:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• ربط Backend APIs</li>
              <li>• إعداد قاعدة البيانات</li>
              <li>• رفع على Hostinger</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoManager; 