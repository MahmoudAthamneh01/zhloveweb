import React, { useState } from 'react';
import { Trophy, Medal, Star, TrendingUp, TrendingDown, Crown, Shield, Flag } from 'lucide-react';
import { formatNumber } from '../../utils/i18n';

interface RankingTableProps {
  rankings: PlayerRanking[];
  rankingType: 'global' | 'regional' | 'clan' | 'tournament';
  onViewPlayer?: (playerId: number) => void;
  currentUserId?: number;
  className?: string;
}

interface PlayerRanking {
  rank: number;
  previousRank?: number;
  player: {
    id: number;
    username: string;
    displayName?: string;
    avatar?: string;
    country: string;
    verified: boolean;
    clan?: {
      id: number;
      name: string;
      tag: string;
    };
  };
  stats: {
    rating: number;
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
    streak: number;
    points: number;
    level: number;
  };
  gameStats: {
    favoriteGeneral: 'USA' | 'China' | 'GLA';
    averageGameDuration: number;
    totalPlaytime: number;
    achievements: number;
  };
  recentForm: Array<'W' | 'L' | 'D'>; // Last 10 games
  isOnline: boolean;
  lastActive: string;
  rankChange: number; // +/- from previous ranking
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster' | 'Legend';
}

const RankingTable: React.FC<RankingTableProps> = ({
  rankings,
  rankingType,
  onViewPlayer,
  currentUserId,
  className = '',
}) => {
  const [sortBy, setSortBy] = useState<'rank' | 'rating' | 'winRate' | 'games'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-victory-gold" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-amber-600" size={24} />;
    if (rank <= 10) return <Trophy className="text-command-blue" size={20} />;
    if (rank <= 50) return <Star className="text-tactical-green" size={18} />;
    return <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-bold">{rank}</div>;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Legend':
        return 'text-purple-500 bg-purple-500/20';
      case 'Grandmaster':
        return 'text-red-500 bg-red-500/20';
      case 'Master':
        return 'text-victory-gold bg-victory-gold/20';
      case 'Diamond':
        return 'text-cyan-500 bg-cyan-500/20';
      case 'Platinum':
        return 'text-emerald-500 bg-emerald-500/20';
      case 'Gold':
        return 'text-yellow-500 bg-yellow-500/20';
      case 'Silver':
        return 'text-gray-400 bg-gray-400/20';
      case 'Bronze':
        return 'text-amber-600 bg-amber-600/20';
      default:
        return 'text-muted-foreground bg-muted';
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

  const getRankChange = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center space-x-1 rtl:space-x-reverse text-tactical-green">
          <TrendingUp size={14} />
          <span className="text-xs">+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center space-x-1 rtl:space-x-reverse text-alert-red">
          <TrendingDown size={14} />
          <span className="text-xs">{change}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1 rtl:space-x-reverse text-muted-foreground">
        <div className="w-3 h-3 rounded-full bg-current opacity-50"></div>
        <span className="text-xs">-</span>
      </div>
    );
  };

  const getRecentForm = (form: Array<'W' | 'L' | 'D'>) => {
    return (
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        {form.slice(-5).map((result, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              result === 'W' ? 'bg-tactical-green' :
              result === 'L' ? 'bg-alert-red' :
              'bg-victory-gold'
            }`}
          />
        ))}
      </div>
    );
  };

  const sortedRankings = [...rankings].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'rank':
        aValue = a.rank;
        bValue = b.rank;
        break;
      case 'rating':
        aValue = a.stats.rating;
        bValue = b.stats.rating;
        break;
      case 'winRate':
        aValue = a.stats.winRate;
        bValue = b.stats.winRate;
        break;
      case 'games':
        aValue = a.stats.totalGames;
        bValue = b.stats.totalGames;
        break;
      default:
        return 0;
    }
    
    const multiplier = sortOrder === 'desc' ? -1 : 1;
    return (aValue - bValue) * multiplier;
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          {rankingType === 'global' && 'التصنيف العالمي'}
          {rankingType === 'regional' && 'التصنيف الإقليمي'}
          {rankingType === 'clan' && 'تصنيف العشائر'}
          {rankingType === 'tournament' && 'تصنيف البطولات'}
        </h2>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-input border border-border rounded px-3 py-1 text-sm"
          >
            <option value="rank">الترتيب</option>
            <option value="rating">التقييم</option>
            <option value="winRate">معدل الفوز</option>
            <option value="games">عدد المباريات</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="bg-input border border-border rounded px-3 py-1 text-sm"
          >
            <option value="asc">تصاعدي</option>
            <option value="desc">تنازلي</option>
          </select>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {sortedRankings.slice(0, 3).map((player, index) => (
          <div
            key={player.player.id}
            className={`military-card p-4 text-center relative ${
              index === 0 ? 'border-victory-gold' : 
              index === 1 ? 'border-gray-400' : 
              'border-amber-600'
            }`}
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              {getRankIcon(player.rank)}
            </div>
            <div className="pt-4">
              <img 
                src={player.player.avatar || '/default-avatar.png'} 
                alt={player.player.username}
                className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-border"
              />
              <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse mb-1">
                <h3 className="font-semibold text-foreground truncate">{player.player.displayName || player.player.username}</h3>
                {player.player.verified && (
                  <div className="text-tactical-green">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                <Flag className="inline w-4 h-4 mr-1" />
                {player.player.country}
              </div>
              <div className="text-lg font-bold text-foreground">{formatNumber(player.stats.rating, 'ar')}</div>
              <div className="text-sm text-muted-foreground">نقطة تقييم</div>
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getTierColor(player.tier)}`}>
                {player.tier}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rankings Table */}
      <div className="military-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left rtl:text-right p-3 text-sm font-medium text-foreground">الترتيب</th>
                <th className="text-left rtl:text-right p-3 text-sm font-medium text-foreground">اللاعب</th>
                <th className="text-left rtl:text-right p-3 text-sm font-medium text-foreground">التقييم</th>
                <th className="text-left rtl:text-right p-3 text-sm font-medium text-foreground">المباريات</th>
                <th className="text-left rtl:text-right p-3 text-sm font-medium text-foreground">معدل الفوز</th>
                <th className="text-left rtl:text-right p-3 text-sm font-medium text-foreground">الشكل الأخير</th>
                <th className="text-left rtl:text-right p-3 text-sm font-medium text-foreground">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {sortedRankings.slice(3).map((player, index) => (
                <tr 
                  key={player.player.id} 
                  className={`border-b border-border hover:bg-muted/50 transition-colors ${
                    player.player.id === currentUserId ? 'bg-primary/10' : ''
                  }`}
                >
                  {/* Rank */}
                  <td className="p-3">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        {getRankIcon(player.rank)}
                        <span className="font-medium text-foreground">{player.rank}</span>
                      </div>
                      {getRankChange(player.rankChange)}
                    </div>
                  </td>

                  {/* Player */}
                  <td className="p-3">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <img 
                        src={player.player.avatar || '/default-avatar.png'} 
                        alt={player.player.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1 rtl:space-x-reverse">
                          <span className="font-medium text-foreground truncate">
                            {player.player.displayName || player.player.username}
                          </span>
                          {player.player.verified && (
                            <div className="text-tactical-green">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
                          <span>{player.player.country}</span>
                          {player.player.clan && (
                            <>
                              <span>•</span>
                              <span>[{player.player.clan.tag}] {player.player.clan.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{formatNumber(player.stats.rating, 'ar')}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTierColor(player.tier)}`}>
                        {player.tier}
                      </span>
                    </div>
                  </td>

                  {/* Games */}
                  <td className="p-3">
                    <div className="text-sm">
                      <div className="font-medium text-foreground">{formatNumber(player.stats.totalGames, 'ar')}</div>
                      <div className="text-muted-foreground">
                        {player.stats.wins}W/{player.stats.losses}L
                      </div>
                    </div>
                  </td>

                  {/* Win Rate */}
                  <td className="p-3">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <div className={`font-medium ${
                        player.stats.winRate >= 80 ? 'text-tactical-green' :
                        player.stats.winRate >= 60 ? 'text-victory-gold' :
                        player.stats.winRate >= 40 ? 'text-orange-500' :
                        'text-alert-red'
                      }`}>
                        {player.stats.winRate}%
                      </div>
                      {player.stats.streak > 0 && (
                        <div className="text-xs bg-tactical-green text-white px-2 py-1 rounded">
                          {player.stats.streak} W
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Recent Form */}
                  <td className="p-3">
                    {getRecentForm(player.recentForm)}
                  </td>

                  {/* Status */}
                  <td className="p-3">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <div className={`w-2 h-2 rounded-full ${
                        player.isOnline ? 'bg-tactical-green' : 'bg-muted-foreground'
                      }`}></div>
                      <span className="text-xs text-muted-foreground">
                        {player.isOnline ? 'متصل' : 'غير متصل'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current User Position */}
      {currentUserId && !rankings.some(r => r.player.id === currentUserId) && (
        <div className="military-card p-4 bg-primary/10 border-primary/20">
          <h3 className="font-semibold text-foreground mb-2">ترتيبك الحالي</h3>
          <div className="text-sm text-muted-foreground">
            أنت بحاجة إلى لعب المزيد من المباريات المصنفة لتظهر في التصنيف
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingTable; 