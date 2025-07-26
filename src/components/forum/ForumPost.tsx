import React, { useState } from 'react';
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  Eye, 
  Clock, 
  Pin, 
  Star, 
  Flag, 
  MoreVertical, 
  Reply,
  Bookmark,
  Award,
  CheckCircle,
  AlertTriangle,
  Lock,
  Flame,
  TrendingUp,
  Users,
  Calendar,
  Tag,
  Zap
} from 'lucide-react';
import { formatNumber, formatDate } from '../../utils/i18n';

interface ForumPostProps {
  post: ForumPost;
  onLike?: (postId: number) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onBookmark?: (postId: number) => void;
  onReport?: (postId: number) => void;
  onView?: (postId: number) => void;
  showActions?: boolean;
  isCompact?: boolean;
  currentUserId?: number;
  className?: string;
}

interface ForumPost {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  author: {
    id: number;
    username: string;
    displayName: string;
    avatar: string;
    title?: string;
    badge?: string;
    level: number;
    reputation: number;
    verified: boolean;
    isOnline: boolean;
    postCount: number;
    joinedAt: string;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    color: string;
    icon?: string;
  };
  tags: Array<{
    id: number;
    name: string;
    color?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  stats: {
    views: number;
    likes: number;
    dislikes: number;
    comments: number;
    shares: number;
    bookmarks: number;
  };
  status: 'published' | 'draft' | 'archived' | 'deleted' | 'locked';
  type: 'discussion' | 'question' | 'guide' | 'news' | 'poll' | 'showcase';
  priority: 'normal' | 'pinned' | 'featured' | 'hot';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  gameRelated?: {
    faction?: 'usa' | 'china' | 'gla';
    gameMode?: '1v1' | '2v2' | '3v3' | '4v4' | 'ffa';
    map?: string;
  };
  poll?: {
    question: string;
    options: Array<{
      id: number;
      text: string;
      votes: number;
    }>;
    totalVotes: number;
    allowMultiple: boolean;
    expiresAt?: string;
  };
  hasAnswered?: boolean;
  bestAnswer?: {
    commentId: number;
    authorId: number;
  };
  isLiked?: boolean;
  isBookmarked?: boolean;
  isFollowing?: boolean;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canPin: boolean;
    canLock: boolean;
  };
}

const ForumPost: React.FC<ForumPostProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onReport,
  onView,
  showActions = true,
  isCompact = false,
  currentUserId,
  className = '',
}) => {
  const [showFullContent, setShowFullContent] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <MessageCircle size={16} className="text-command-blue" />;
      case 'guide':
        return <Award size={16} className="text-tactical-green" />;
      case 'news':
        return <TrendingUp size={16} className="text-orange-500" />;
      case 'poll':
        return <Users size={16} className="text-purple-500" />;
      case 'showcase':
        return <Star size={16} className="text-victory-gold" />;
      default:
        return <MessageCircle size={16} className="text-muted-foreground" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'question':
        return 'سؤال';
      case 'guide':
        return 'دليل';
      case 'news':
        return 'أخبار';
      case 'poll':
        return 'استطلاع';
      case 'showcase':
        return 'عرض';
      default:
        return 'مناقشة';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'pinned':
        return 'text-tactical-green';
      case 'featured':
        return 'text-victory-gold';
      case 'hot':
        return 'text-orange-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-tactical-green/20 text-tactical-green';
      case 'intermediate':
        return 'bg-victory-gold/20 text-victory-gold';
      case 'advanced':
        return 'bg-orange-500/20 text-orange-500';
      case 'expert':
        return 'bg-alert-red/20 text-alert-red';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyText = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      case 'expert':
        return 'خبير';
      default:
        return '';
    }
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'moderator':
        return 'bg-command-blue text-white';
      case 'vip':
        return 'bg-victory-gold text-black';
      case 'expert':
        return 'bg-tactical-green text-white';
      case 'veteran':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getBadgeText = (badge?: string) => {
    switch (badge) {
      case 'moderator':
        return 'مشرف';
      case 'vip':
        return 'VIP';
      case 'expert':
        return 'خبير';
      case 'veteran':
        return 'محارب قديم';
      default:
        return badge;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    
    return formatDate(date, 'ar', { month: 'short', day: 'numeric' });
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (isCompact) {
    return (
      <div 
        className={`military-card hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}
        onClick={() => onView?.(post.id)}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              {/* Priority Indicators */}
              {post.priority === 'pinned' && (
                <Pin size={14} className="text-tactical-green" />
              )}
              {post.priority === 'featured' && (
                <Star size={14} className="text-victory-gold" />
              )}
              {post.priority === 'hot' && (
                <Flame size={14} className="text-orange-500" />
              )}
              
              {/* Type Icon */}
              {getTypeIcon(post.type)}
              
              {/* Status Indicators */}
              {post.status === 'locked' && (
                <Lock size={14} className="text-muted-foreground" />
              )}
              {post.hasAnswered && (
                <CheckCircle size={14} className="text-tactical-green" />
              )}
            </div>
            
            <div className="flex items-center space-x-1 rtl:space-x-reverse text-xs text-muted-foreground">
              <Eye size={12} />
              <span>{formatNumber(post.stats.views, 'ar')}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {/* Author & Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <img 
                src={post.author.avatar} 
                alt={post.author.displayName}
                className="w-6 h-6 rounded-full"
              />
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <span className="text-sm text-foreground font-medium">
                  {post.author.displayName}
                </span>
                {post.author.verified && (
                  <CheckCircle size={12} className="text-tactical-green" />
                )}
                {post.author.badge && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(post.author.badge)}`}>
                    {getBadgeText(post.author.badge)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3 rtl:space-x-reverse text-xs text-muted-foreground">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <MessageCircle size={12} />
                <span>{formatNumber(post.stats.comments, 'ar')}</span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Heart size={12} />
                <span>{formatNumber(post.stats.likes, 'ar')}</span>
              </div>
              <span>{getTimeAgo(post.createdAt)}</span>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
              >
                {post.category.name}
              </span>
              {post.difficulty && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(post.difficulty)}`}>
                  {getDifficultyText(post.difficulty)}
                </span>
              )}
            </div>
            
            {post.tags.length > 0 && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                {post.tags.slice(0, 2).map(tag => (
                  <span 
                    key={tag.id}
                    className="text-xs text-muted-foreground"
                  >
                    #{tag.name}
                  </span>
                ))}
                {post.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{post.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full Post View
  return (
    <div className={`military-card hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1">
            {/* Author Avatar */}
            <div className="relative">
              <img 
                src={post.author.avatar} 
                alt={post.author.displayName}
                className="w-12 h-12 rounded-full"
              />
              {post.author.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-tactical-green border-2 border-background rounded-full"></div>
              )}
            </div>

            {/* Author Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                <h4 className="font-semibold text-foreground">{post.author.displayName}</h4>
                {post.author.verified && (
                  <CheckCircle size={16} className="text-tactical-green" />
                )}
                {post.author.badge && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(post.author.badge)}`}>
                    {getBadgeText(post.author.badge)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-muted-foreground">
                <span>مستوى {post.author.level}</span>
                <span>{formatNumber(post.author.reputation, 'ar')} نقطة</span>
                <span>{formatNumber(post.author.postCount, 'ar')} منشور</span>
                <span>{getTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Post Actions */}
          {showActions && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => onBookmark?.(post.id)}
                className={`p-2 rounded-lg transition-colors ${
                  post.isBookmarked 
                    ? 'bg-victory-gold/20 text-victory-gold' 
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <Bookmark size={16} />
              </button>
              
              <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground">
                <MoreVertical size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Post Metadata */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Priority Indicators */}
            {post.priority === 'pinned' && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse text-tactical-green">
                <Pin size={16} />
                <span className="text-sm font-medium">مثبت</span>
              </div>
            )}
            {post.priority === 'featured' && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse text-victory-gold">
                <Star size={16} />
                <span className="text-sm font-medium">مميز</span>
              </div>
            )}
            {post.priority === 'hot' && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse text-orange-500">
                <Flame size={16} />
                <span className="text-sm font-medium">ساخن</span>
              </div>
            )}

            {/* Type */}
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              {getTypeIcon(post.type)}
              <span className="text-sm text-muted-foreground">{getTypeText(post.type)}</span>
            </div>

            {/* Status */}
            {post.status === 'locked' && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse text-muted-foreground">
                <Lock size={16} />
                <span className="text-sm">مغلق</span>
              </div>
            )}
            {post.hasAnswered && (
              <div className="flex items-center space-x-1 rtl:space-x-reverse text-tactical-green">
                <CheckCircle size={16} />
                <span className="text-sm">تم الرد</span>
              </div>
            )}
          </div>

          {/* Post Stats */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-muted-foreground">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Eye size={16} />
              <span>{formatNumber(post.stats.views, 'ar')}</span>
            </div>
            {post.editedAt && (
              <span className="text-xs">عُدل {getTimeAgo(post.editedAt)}</span>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-foreground mb-4 cursor-pointer hover:text-primary transition-colors"
            onClick={() => onView?.(post.id)}>
          {post.title}
        </h2>

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-4">
          {showFullContent || !post.excerpt ? (
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <div>
              <p className="text-muted-foreground">{post.excerpt}</p>
              <button 
                onClick={() => setShowFullContent(true)}
                className="text-primary hover:underline mt-2"
              >
                اقرأ المزيد
              </button>
            </div>
          )}
        </div>

        {/* Poll (if exists) */}
        {post.poll && (
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-foreground mb-3">{post.poll.question}</h3>
            <div className="space-y-2 mb-3">
              {post.poll.options.map(option => {
                const percentage = post.poll!.totalVotes > 0 
                  ? (option.votes / post.poll!.totalVotes) * 100 
                  : 0;
                
                return (
                  <div key={option.id} className="relative">
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                      <span className="text-sm text-foreground">{option.text}</span>
                      <span className="text-sm text-muted-foreground">
                        {option.votes} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div 
                      className="absolute left-0 top-0 h-full bg-primary/20 rounded-lg transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatNumber(post.poll.totalVotes, 'ar')} صوت</span>
              {post.poll.expiresAt && (
                <span>ينتهي {getTimeAgo(post.poll.expiresAt)}</span>
              )}
            </div>
          </div>
        )}

        {/* Tags & Category */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: `${post.category.color}20`, color: post.category.color }}
            >
              {post.category.name}
            </span>
            {post.difficulty && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(post.difficulty)}`}>
                {getDifficultyText(post.difficulty)}
              </span>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Tag size={16} className="text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {post.tags.map(tag => (
                  <span 
                    key={tag.id}
                    className="text-sm text-primary hover:underline cursor-pointer"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Game Related Info */}
        {post.gameRelated && (
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm">
              {post.gameRelated.faction && (
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <span className="text-muted-foreground">الجيش:</span>
                  <span className="font-medium text-foreground">
                    {post.gameRelated.faction.toUpperCase()}
                  </span>
                </div>
              )}
              {post.gameRelated.gameMode && (
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <span className="text-muted-foreground">الوضع:</span>
                  <span className="font-medium text-foreground">
                    {post.gameRelated.gameMode}
                  </span>
                </div>
              )}
              {post.gameRelated.map && (
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <span className="text-muted-foreground">الخريطة:</span>
                  <span className="font-medium text-foreground">
                    {post.gameRelated.map}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions Bar */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button
                onClick={() => onLike?.(post.id)}
                className={`flex items-center space-x-1 rtl:space-x-reverse transition-colors ${
                  post.isLiked 
                    ? 'text-red-500' 
                    : 'text-muted-foreground hover:text-red-500'
                }`}
              >
                <Heart size={20} className={post.isLiked ? 'fill-current' : ''} />
                <span>{formatNumber(post.stats.likes, 'ar')}</span>
              </button>

              <button
                onClick={() => onComment?.(post.id)}
                className="flex items-center space-x-1 rtl:space-x-reverse text-muted-foreground hover:text-command-blue transition-colors"
              >
                <MessageCircle size={20} />
                <span>{formatNumber(post.stats.comments, 'ar')}</span>
              </button>

              <button
                onClick={() => onShare?.(post.id)}
                className="flex items-center space-x-1 rtl:space-x-reverse text-muted-foreground hover:text-tactical-green transition-colors"
              >
                <Share2 size={20} />
                <span>{formatNumber(post.stats.shares, 'ar')}</span>
              </button>

              <button
                onClick={() => onBookmark?.(post.id)}
                className={`flex items-center space-x-1 rtl:space-x-reverse transition-colors ${
                  post.isBookmarked 
                    ? 'text-victory-gold' 
                    : 'text-muted-foreground hover:text-victory-gold'
                }`}
              >
                <Bookmark size={20} className={post.isBookmarked ? 'fill-current' : ''} />
              </button>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => onReport?.(post.id)}
                className="text-muted-foreground hover:text-alert-red transition-colors"
              >
                <Flag size={16} />
              </button>

              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPost; 