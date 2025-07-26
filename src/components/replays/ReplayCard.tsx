import React from 'react';
import { Play, Download, Star, Eye, Calendar, Trophy, Clock, Users, Flag } from 'lucide-react';
import { formatDate, formatDuration } from '../../utils/i18n';

interface ReplayCardProps {
  replay: GameReplay;
  onPlay?: (id: number) => void;
  onDownload?: (id: number) => void;
  onRate?: (id: number, rating: number) => void;
  onFlag?: (id: number) => void;
  currentUserId?: number;
  isCompact?: boolean;
  showActions?: boolean;
  className?: string;
}

interface GameReplay {
  id: number;
  title: string;
  description?: string;
  uploadedAt: string;
  uploadedBy: {
    id: number;
    username: string;
    avatar?: string;
    verified: boolean;
  };
  gameInfo: {
    map: string;
    mode: 'skirmish' | 'multiplayer' | 'tournament';
    duration: number; // in seconds
    players: Array<{
      id: number;
      username: string;
      faction: 'USA' | 'China' | 'GLA';
      result: 'win' | 'lose' | 'draw';
      score: number;
      isAI?: boolean;
    }>;
    winner?: {
      id: number;
      username: string;
    };
  };
  stats: {
    views: number;
    downloads: number;
    rating: number;
    totalRatings: number;
    featured: boolean;
  };
  tags: string[];
  category: 'tournament' | 'training' | 'showcase' | 'funny' | 'epic';
  quality: 'HD' | 'Standard' | 'Low';
  fileSize: number; // in MB
  version: string;
  language: 'ar' | 'en' | 'mixed';
  thumbnail?: string;
  isApproved: boolean;
  isFeatured: boolean;
  hasComments: boolean;
  commentCount: number;
}

const ReplayCard: React.FC<ReplayCardProps> = ({
  replay,
  onPlay,
  onDownload,
  onRate,
  onFlag,
  currentUserId,
  isCompact = false,
  showActions = true,
  className = '',
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tournament':
        return 'bg-victory-gold/20 text-victory-gold';
      case 'training':
        return 'bg-tactical-green/20 text-tactical-green';
      case 'showcase':
        return 'bg-command-blue/20 text-command-blue';
      case 'funny':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'epic':
        return 'bg-purple-500/20 text-purple-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'tournament':
        return 'بطولة';
      case 'training':
        return 'تدريب';
      case 'showcase':
        return 'عرض';
      case 'funny':
        return 'مضحك';
      case 'epic':
        return 'ملحمي';
      default:
        return category;
    }
  };

  const getModeText = (mode: string) => {
    switch (mode) {
      case 'skirmish':
        return 'مناوشة';
      case 'multiplayer':
        return 'متعدد اللاعبين';
      case 'tournament':
        return 'بطولة';
      default:
        return mode;
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

  const StarRating = ({ rating, interactive = false }: { rating: number; interactive?: boolean }) => (
    <div className="flex items-center space-x-1 rtl:space-x-reverse">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate?.(replay.id, star)}
          className={`${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          } transition-transform`}
          disabled={!interactive}
        >
          <Star
            size={16}
            className={star <= rating ? 'fill-victory-gold text-victory-gold' : 'text-muted-foreground'}
          />
        </button>
      ))}
    </div>
  );

  if (isCompact) {
    return (
      <div className={`bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1 min-w-0">
            {/* Thumbnail */}
            <div className="relative w-16 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              {replay.thumbnail ? (
                <img 
                  src={replay.thumbnail} 
                  alt={replay.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="text-muted-foreground" size={20} />
                </div>
              )}
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                {formatDuration(replay.gameInfo.duration)}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{replay.title}</h3>
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
                <span>{replay.gameInfo.map}</span>
                <span>•</span>
                <span>{getModeText(replay.gameInfo.mode)}</span>
                <span>•</span>
                <span>{formatDate(new Date(replay.uploadedAt), 'ar', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="flex items-center space-x-1 rtl:space-x-reverse text-sm text-muted-foreground">
                <Eye size={14} />
                <span>{replay.stats.views}</span>
              </div>
              <button
                onClick={() => onPlay?.(replay.id)}
                className="p-2 bg-tactical-green text-white rounded-lg hover:bg-tactical-green/80 transition-colors"
              >
                <Play size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 ${className}`}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        {replay.thumbnail ? (
          <img 
            src={replay.thumbnail} 
            alt={replay.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="text-muted-foreground" size={48} />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button
            onClick={() => onPlay?.(replay.id)}
            className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors"
          >
            <Play className="text-white" size={24} />
          </button>
        </div>

        {/* Duration */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
          {formatDuration(replay.gameInfo.duration)}
        </div>

        {/* Quality */}
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {replay.quality}
        </div>

        {/* Featured Badge */}
        {replay.isFeatured && (
          <div className="absolute top-2 left-2 bg-victory-gold text-black text-xs px-2 py-1 rounded flex items-center space-x-1 rtl:space-x-reverse">
            <Trophy size={12} />
            <span>مميز</span>
          </div>
        )}

        {/* Category */}
        <div className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded ${getCategoryColor(replay.category)}`}>
          {getCategoryText(replay.category)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{replay.title}</h3>

        {/* Description */}
        {replay.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{replay.description}</p>
        )}

        {/* Game Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
            <span className="text-muted-foreground">الخريطة:</span>
            <span className="font-medium text-foreground">{replay.gameInfo.map}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{getModeText(replay.gameInfo.mode)}</span>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
            <Users size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">اللاعبين:</span>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              {replay.gameInfo.players.slice(0, 3).map((player, index) => (
                <div key={player.id} className="flex items-center space-x-1 rtl:space-x-reverse">
                  <span className="text-xs">{getFactionIcon(player.faction)}</span>
                  <span className={`text-xs ${player.result === 'win' ? 'text-tactical-green' : 'text-alert-red'}`}>
                    {player.username}
                  </span>
                  {index < Math.min(replay.gameInfo.players.length - 1, 2) && (
                    <span className="text-muted-foreground">vs</span>
                  )}
                </div>
              ))}
              {replay.gameInfo.players.length > 3 && (
                <span className="text-xs text-muted-foreground">+{replay.gameInfo.players.length - 3}</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div className="bg-muted rounded-lg p-2">
            <div className="text-sm font-bold text-foreground">{replay.stats.views}</div>
            <div className="text-xs text-muted-foreground">مشاهدة</div>
          </div>
          <div className="bg-muted rounded-lg p-2">
            <div className="text-sm font-bold text-foreground">{replay.stats.downloads}</div>
            <div className="text-xs text-muted-foreground">تحميل</div>
          </div>
          <div className="bg-muted rounded-lg p-2">
            <div className="text-sm font-bold text-foreground">{replay.stats.rating.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">التقييم</div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <StarRating rating={replay.stats.rating} interactive={currentUserId !== replay.uploadedBy.id} />
            <span className="text-sm text-muted-foreground">
              ({replay.stats.totalRatings} تقييم)
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            {replay.fileSize.toFixed(1)} MB
          </div>
        </div>

        {/* Tags */}
        {replay.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {replay.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
            {replay.tags.length > 3 && (
              <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                +{replay.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Author */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <img 
              src={replay.uploadedBy.avatar || '/default-avatar.png'} 
              alt={replay.uploadedBy.username}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <span className="text-sm font-medium text-foreground">{replay.uploadedBy.username}</span>
                {replay.uploadedBy.verified && (
                  <div className="text-tactical-green">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(new Date(replay.uploadedAt), 'ar', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => onPlay?.(replay.id)}
              className="btn btn-primary flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse"
            >
              <Play size={16} />
              <span>مشاهدة</span>
            </button>
            <button
              onClick={() => onDownload?.(replay.id)}
              className="btn btn-outline flex items-center space-x-2 rtl:space-x-reverse"
            >
              <Download size={16} />
              <span>تحميل</span>
            </button>
            <button
              onClick={() => onFlag?.(replay.id)}
              className="p-2 text-muted-foreground hover:text-alert-red transition-colors"
            >
              <Flag size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplayCard; 