import React from 'react';
import { Shield, Users, Star, Trophy, Crown, Swords, Calendar, MapPin } from 'lucide-react';
import { formatDate, formatNumber } from '../../utils/i18n';

interface ClanCardProps {
  clan: Clan;
  onJoin?: (clanId: number) => void;
  onView?: (clanId: number) => void;
  onLeave?: (clanId: number) => void;
  showActions?: boolean;
  isCompact?: boolean;
  currentUserId?: number;
  className?: string;
}

interface Clan {
  id: number;
  name: string;
  tag: string;
  description: string;
  level: number;
  totalMembers: number;
  maxMembers: number;
  activeMembers: number;
  joinRequirements: {
    minLevel: number;
    minWinRate: number;
    applicationRequired: boolean;
  };
  stats: {
    totalWins: number;
    totalLosses: number;
    winRate: number;
    totalTrophies: number;
    totalXP: number;
    warWins: number;
    warLosses: number;
    warWinRate: number;
  };
  leader: {
    id: number;
    username: string;
    avatar?: string;
    isOnline: boolean;
  };
  officers: Array<{
    id: number;
    username: string;
    avatar?: string;
    isOnline: boolean;
  }>;
  region: string;
  language: string;
  isPublic: boolean;
  createdAt: string;
  lastActivity: string;
  avatar?: string;
  banner?: string;
  membershipStatus?: 'member' | 'officer' | 'leader' | 'pending' | 'none';
  isRecruiting: boolean;
  tags: string[];
  isVerified: boolean;
  isElite: boolean;
}

const ClanCard: React.FC<ClanCardProps> = ({
  clan,
  onJoin,
  onView,
  onLeave,
  showActions = true,
  isCompact = false,
  currentUserId,
  className = '',
}) => {
  const membershipStatus = clan.membershipStatus || 'none';
  const canJoin = membershipStatus === 'none' && clan.isRecruiting && 
                  clan.totalMembers < clan.maxMembers;
  const canLeave = ['member', 'officer', 'leader'].includes(membershipStatus);

  const handleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onJoin?.(clan.id);
  };

  const handleView = () => {
    onView?.(clan.id);
  };

  const handleLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من مغادرة العشيرة؟')) {
      onLeave?.(clan.id);
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
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

  const getClanLevelColor = (level: number) => {
    if (level >= 50) return 'text-victory-gold';
    if (level >= 30) return 'text-command-blue';
    if (level >= 20) return 'text-tactical-green';
    return 'text-muted-foreground';
  };

  return (
    <div 
      className={`
        military-card hover-lift transition-all duration-300 cursor-pointer relative overflow-hidden
        ${clan.isElite ? 'border-victory-gold shadow-glow-gold' : ''}
        ${clan.isVerified ? 'border-tactical-green' : ''}
        ${isCompact ? 'p-4' : 'p-6'}
        ${className}
      `}
      onClick={handleView}
    >
      {/* Elite Badge */}
      {clan.isElite && (
        <div className="absolute top-4 right-4 bg-victory-gold text-victory-gold-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 rtl:space-x-reverse">
          <Crown size={12} />
          <span>نخبة</span>
        </div>
      )}

      {/* Verified Badge */}
      {clan.isVerified && (
        <div className="absolute top-4 left-4 text-tactical-green">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
      )}

      {/* Banner */}
      {clan.banner && !isCompact && (
        <div className="relative mb-4 -mx-6 -mt-6">
          <img 
            src={clan.banner} 
            alt={clan.name}
            className="w-full h-24 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start space-x-4 rtl:space-x-reverse mb-4">
        {/* Clan Avatar */}
        <div className="relative">
          <img 
            src={clan.avatar || '/default-clan-avatar.png'} 
            alt={clan.name}
            className="w-16 h-16 rounded-lg object-cover border-2 border-border"
          />
          <div className="absolute -bottom-2 -right-2 bg-background border-2 border-border rounded-full px-2 py-1">
            <span className={`text-xs font-bold ${getClanLevelColor(clan.level)}`}>
              {clan.level}
            </span>
          </div>
        </div>

        {/* Clan Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
            <h3 className={`font-bold truncate ${isCompact ? 'text-base' : 'text-lg'}`}>
              [{clan.tag}] {clan.name}
            </h3>
            {clan.isVerified && (
              <div className="text-tactical-green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            )}
          </div>
          
          {!isCompact && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {clan.description}
            </p>
          )}

          <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <MapPin size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground">{clan.region}</span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Calendar size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatDate(new Date(clan.createdAt), 'ar', { year: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={`grid gap-3 mb-4 ${isCompact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
        {/* Members */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Users size={16} className="text-tactical-green flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">
              {formatNumber(clan.totalMembers, 'ar')}/{formatNumber(clan.maxMembers, 'ar')}
            </div>
            <div className="text-xs text-muted-foreground">أعضاء</div>
          </div>
        </div>

        {/* Trophies */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Trophy size={16} className="text-victory-gold flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">
              {formatNumber(clan.stats.totalTrophies, 'ar')}
            </div>
            <div className="text-xs text-muted-foreground">كؤوس</div>
          </div>
        </div>

        {/* Win Rate */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Star size={16} className="text-command-blue flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">
              {clan.stats.winRate}%
            </div>
            <div className="text-xs text-muted-foreground">معدل الفوز</div>
          </div>
        </div>

        {/* Wars */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Swords size={16} className="text-alert-red flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">
              {clan.stats.warWins}W/{clan.stats.warLosses}L
            </div>
            <div className="text-xs text-muted-foreground">حروب</div>
          </div>
        </div>
      </div>

      {/* Leader Info */}
      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
        <div className="relative">
          <img 
            src={clan.leader.avatar || '/default-avatar.png'} 
            alt={clan.leader.username}
            className="w-8 h-8 rounded-full object-cover border border-border"
          />
          {clan.leader.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-tactical-green rounded-full border border-background"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <Crown size={14} className="text-victory-gold" />
            <span className="text-sm font-medium text-foreground truncate">
              {clan.leader.username}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">قائد العشيرة</div>
        </div>
      </div>

      {/* Requirements */}
      {!isCompact && (
        <div className="mb-4">
          <div className="text-xs text-muted-foreground mb-2">متطلبات الانضمام:</div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
              Level {clan.joinRequirements.minLevel}+
            </span>
            <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
              {clan.joinRequirements.minWinRate}% Win Rate
            </span>
            {clan.joinRequirements.applicationRequired && (
              <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                طلب انضمام
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {clan.tags.length > 0 && !isCompact && (
        <div className="flex flex-wrap gap-2 mb-4">
          {clan.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
          {clan.tags.length > 3 && (
            <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
              +{clan.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>الأعضاء</span>
          <span>{Math.round((clan.totalMembers / clan.maxMembers) * 100)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-tactical-green rounded-full h-2 transition-all duration-300"
            style={{ width: `${(clan.totalMembers / clan.maxMembers) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Activity Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className={`w-2 h-2 rounded-full ${
            clan.activeMembers > clan.totalMembers * 0.5 ? 'bg-tactical-green' : 'bg-victory-gold'
          }`}></div>
          <span className="text-xs text-muted-foreground">
            {clan.activeMembers} نشط
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          آخر نشاط: {formatDate(new Date(clan.lastActivity), 'ar', { day: 'numeric', month: 'short' })}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {membershipStatus === 'member' && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-tactical-green">
              <Shield size={16} />
              <span>عضو</span>
            </div>
          )}
          {membershipStatus === 'officer' && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-command-blue">
              <Shield size={16} />
              <span>ضابط</span>
            </div>
          )}
          {membershipStatus === 'leader' && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-victory-gold">
              <Crown size={16} />
              <span>قائد</span>
            </div>
          )}
          {membershipStatus === 'pending' && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
              <span>في انتظار الموافقة</span>
            </div>
          )}
          
          <div className="flex-1"></div>
          
          {canJoin && (
            <button
              onClick={handleJoin}
              className="btn btn-primary btn-sm"
            >
              {clan.joinRequirements.applicationRequired ? 'تقديم طلب' : 'انضمام'}
            </button>
          )}
          
          {canLeave && membershipStatus !== 'leader' && (
            <button
              onClick={handleLeave}
              className="btn btn-outline btn-sm text-alert-red hover:bg-alert-red hover:text-white"
            >
              مغادرة
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleView();
            }}
            className="btn btn-outline btn-sm"
          >
            عرض
          </button>
        </div>
      )}

      {/* Recruiting Status */}
      {clan.isRecruiting && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-tactical-green text-tactical-green-foreground px-2 py-1 rounded-full text-xs font-semibold">
          نبحث عن أعضاء
        </div>
      )}
    </div>
  );
};

export default ClanCard; 