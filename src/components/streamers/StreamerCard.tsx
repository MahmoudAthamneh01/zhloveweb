import React from 'react';
import { Youtube, Twitch, Play, Eye, Users, Calendar, Star, ExternalLink, Heart } from 'lucide-react';
import { formatNumber, formatDate } from '../../utils/i18n';

interface StreamerCardProps {
  streamer: Streamer;
  onView?: (id: number) => void;
  onFollow?: (id: number) => void;
  onUnfollow?: (id: number) => void;
  isCompact?: boolean;
  showActions?: boolean;
  currentUserId?: number;
  className?: string;
}

interface Streamer {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  banner?: string;
  description: string;
  isVerified: boolean;
  isOnline: boolean;
  platforms: Array<{
    type: 'youtube' | 'twitch' | 'facebook' | 'tiktok';
    url: string;
    followers: number;
    isVerified: boolean;
  }>;
  stats: {
    totalFollowers: number;
    totalViews: number;
    totalVideos: number;
    averageViews: number;
    rating: number;
    totalRatings: number;
  };
  gameStats: {
    totalPlaytime: number;
    favoriteGeneral: 'USA' | 'China' | 'GLA';
    rank: string;
    level: number;
    winRate: number;
  };
  latestVideo?: {
    id: string;
    title: string;
    thumbnail: string;
    views: number;
    duration: number;
    publishedAt: string;
  };
  tags: string[];
  country: string;
  language: string;
  joinedAt: string;
  lastActivity: string;
  isFollowed: boolean;
  contentType: 'tutorials' | 'entertainment' | 'competitive' | 'mixed';
  schedule?: {
    timezone: string;
    days: string[];
    time: string;
  };
}

const StreamerCard: React.FC<StreamerCardProps> = ({
  streamer,
  onView,
  onFollow,
  onUnfollow,
  isCompact = false,
  showActions = true,
  currentUserId,
  className = '',
}) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <Youtube size={16} className="text-red-500" />;
      case 'twitch':
        return <Twitch size={16} className="text-purple-500" />;
      case 'facebook':
        return <div className="w-4 h-4 bg-blue-500 rounded text-white text-xs flex items-center justify-center">f</div>;
      case 'tiktok':
        return <div className="w-4 h-4 bg-black rounded text-white text-xs flex items-center justify-center">T</div>;
      default:
        return <ExternalLink size={16} />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'tutorials':
        return 'bg-tactical-green/20 text-tactical-green';
      case 'entertainment':
        return 'bg-victory-gold/20 text-victory-gold';
      case 'competitive':
        return 'bg-command-blue/20 text-command-blue';
      case 'mixed':
        return 'bg-neutral-silver/20 text-neutral-silver';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getContentTypeText = (type: string) => {
    switch (type) {
      case 'tutorials':
        return 'تعليمي';
      case 'entertainment':
        return 'ترفيهي';
      case 'competitive':
        return 'تنافسي';
      case 'mixed':
        return 'متنوع';
      default:
        return type;
    }
  };

  const getFactionIcon = (faction: string) => {
    switch (faction) {
      case 'USA':
        return '🇺🇸';
      case 'China':
        return '🇨🇳';
      case 'GLA':
        return '☪️';
      default:
        return '❓';
    }
  };

  const handleFollow = () => {
    if (streamer.isFollowed) {
      onUnfollow?.(streamer.id);
    } else {
      onFollow?.(streamer.id);
    }
  };

  if (isCompact) {
    return (
      <div className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${className}`}>
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* Avatar */}
          <div className="relative">
            <img 
              src={streamer.avatar} 
              alt={streamer.displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
            {streamer.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <h3 className="font-semibold text-foreground truncate">{streamer.displayName}</h3>
              {streamer.isVerified && (
                <div className="text-tactical-green">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              )}
              {streamer.isOnline && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">مباشر</span>
              )}
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
              <span>{formatNumber(streamer.stats.totalFollowers, 'ar')} متابع</span>
              <span>•</span>
              <span>{streamer.country}</span>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => onView?.(streamer.id)}
                className="btn btn-outline btn-sm"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={handleFollow}
                className={`btn btn-sm ${
                  streamer.isFollowed 
                    ? 'btn-outline text-red-500 hover:bg-red-500 hover:text-white' 
                    : 'btn-primary'
                }`}
              >
                <Heart size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 ${className}`}>
      {/* Banner */}
      {streamer.banner && (
        <div className="relative h-32 bg-gradient-to-r from-tactical-green to-command-blue">
          <img 
            src={streamer.banner} 
            alt={streamer.displayName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          {streamer.isOnline && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 rtl:space-x-reverse">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>مباشر الآن</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start space-x-3 rtl:space-x-reverse mb-4">
          <div className="relative">
            <img 
              src={streamer.avatar} 
              alt={streamer.displayName}
              className="w-16 h-16 rounded-full object-cover border-2 border-border"
            />
            {streamer.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-background flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
              <h3 className="text-lg font-bold text-foreground truncate">{streamer.displayName}</h3>
              {streamer.isVerified && (
                <div className="text-tactical-green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">@{streamer.username}</p>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContentTypeColor(streamer.contentType)}`}>
                {getContentTypeText(streamer.contentType)}
              </span>
              <span className="text-xs text-muted-foreground">{streamer.country}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{streamer.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-foreground">{formatNumber(streamer.stats.totalFollowers, 'ar')}</div>
            <div className="text-xs text-muted-foreground">متابع</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-foreground">{formatNumber(streamer.stats.totalViews, 'ar')}</div>
            <div className="text-xs text-muted-foreground">مشاهدة</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-foreground">{streamer.stats.totalVideos}</div>
            <div class="text-xs text-muted-foreground">فيديو</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-foreground">{streamer.stats.rating.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">تقييم</div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="bg-muted rounded-lg p-3 mb-4">
          <h4 className="font-medium text-foreground mb-2">إحصائيات اللعبة</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">الفصيل المفضل:</span>
              <span className="font-medium ml-1">{getFactionIcon(streamer.gameStats.favoriteGeneral)} {streamer.gameStats.favoriteGeneral}</span>
            </div>
            <div>
              <span className="text-muted-foreground">الرتبة:</span>
              <span className="font-medium ml-1">{streamer.gameStats.rank}</span>
            </div>
            <div>
              <span className="text-muted-foreground">المستوى:</span>
              <span className="font-medium ml-1">{streamer.gameStats.level}</span>
            </div>
            <div>
              <span className="text-muted-foreground">معدل الفوز:</span>
              <span className="font-medium ml-1">{streamer.gameStats.winRate}%</span>
            </div>
          </div>
        </div>

        {/* Platforms */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
          <span className="text-sm text-muted-foreground">المنصات:</span>
          {streamer.platforms.map((platform, index) => (
            <a 
              key={index}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 rtl:space-x-reverse bg-muted hover:bg-muted/80 px-2 py-1 rounded-full text-xs transition-colors"
            >
              {getPlatformIcon(platform.type)}
              <span>{formatNumber(platform.followers, 'ar')}</span>
            </a>
          ))}
        </div>

        {/* Latest Video */}
        {streamer.latestVideo && (
          <div className="bg-muted rounded-lg p-3 mb-4">
            <h4 className="font-medium text-foreground mb-2">آخر فيديو</h4>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <img 
                src={streamer.latestVideo.thumbnail} 
                alt={streamer.latestVideo.title}
                className="w-16 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-foreground text-sm truncate">{streamer.latestVideo.title}</h5>
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs text-muted-foreground">
                  <span>{formatNumber(streamer.latestVideo.views, 'ar')} مشاهدة</span>
                  <span>•</span>
                  <span>{formatDate(new Date(streamer.latestVideo.publishedAt), 'ar', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {streamer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {streamer.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                #{tag}
              </span>
            ))}
            {streamer.tags.length > 3 && (
              <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                +{streamer.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Schedule */}
        {streamer.schedule && (
          <div className="bg-muted rounded-lg p-3 mb-4">
            <h4 className="font-medium text-foreground mb-2">جدول البث</h4>
            <div className="text-sm text-muted-foreground">
              <div>{streamer.schedule.days.join(', ')}</div>
              <div>الساعة {streamer.schedule.time} ({streamer.schedule.timezone})</div>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => onView?.(streamer.id)}
              className="btn btn-outline flex-1"
            >
              <Eye size={16} />
              <span>عرض القناة</span>
            </button>
            <button
              onClick={handleFollow}
              className={`btn flex-1 ${
                streamer.isFollowed 
                  ? 'btn-outline text-red-500 hover:bg-red-500 hover:text-white' 
                  : 'btn-primary'
              }`}
            >
              <Heart size={16} />
              <span>{streamer.isFollowed ? 'إلغاء المتابعة' : 'متابعة'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamerCard; 