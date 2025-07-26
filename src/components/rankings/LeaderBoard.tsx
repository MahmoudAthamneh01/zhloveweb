import React, { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star, 
  Users, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Target,
  Zap,
  Flag,
  Clock
} from 'lucide-react';
import { formatNumber, formatDate } from '../../utils/i18n';

interface LeaderBoardProps {
  title: string;
  rankings: LeaderBoardEntry[];
  category: 'global' | 'regional' | 'clan' | 'seasonal' | 'weekly' | 'monthly';
  filters?: {
    regions?: string[];
    tiers?: string[];
    timePeriods?: string[];
  };
  onPlayerClick?: (playerId: number) => void;
  onFilterChange?: (filters: any) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  maxEntries?: number;
  className?: string;
}

interface LeaderBoardEntry {
  position: number;
  previousPosition?: number;
  change: number;
  player: {
    id: number;
    username: string;
    displayName?: string;
    avatar?: string;
    country: string;
    verified: boolean;
    isOnline: boolean;
    clan?: {
      id: number;
      name: string;
      tag: string;
      verified: boolean;
    };
  };
  stats: {
    rating: number;
    ratingChange: number;
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
    streak: number;
    points: number;
    level: number;
  };
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster' | 'Legend';
  recentActivity: {
    lastPlayed: string;
    gamesThisWeek: number;
    activityLevel: 'high' | 'medium' | 'low';
  };
  achievements: {
    total: number;
    recent: Array<{
      name: string;
      icon: string;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
    }>;
  };
  specialTags?: Array<{
    type: 'champion' | 'rising_star' | 'veteran' | 'clan_leader' | 'top_contributor';
    label: string;
    color: string;
  }>;
}

const LeaderBoard: React.FC<LeaderBoardProps> = ({
  title,
  rankings,
  category,
  filters,
  onPlayerClick,
  onFilterChange,
  onRefresh,
  isLoading = false,
  showFilters = true,
  showSearch = true,
  maxEntries = 100,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('current');
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="text-victory-gold" size={24} />;
    if (position === 2) return <Medal className="text-gray-400" size={24} />;
    if (position === 3) return <Medal className="text-amber-600" size={24} />;
    if (position <= 10) return <Trophy className="text-command-blue" size={20} />;
    if (position <= 50) return <Star className="text-tactical-green" size={18} />;
    return <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-bold">{position}</div>;
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

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="text-tactical-green" size={16} />;
    if (change < 0) return <TrendingDown className="text-alert-red" size={16} />;
    return <div className="w-4 h-4 rounded-full bg-muted-foreground opacity-50"></div>;
  };

  const getSpecialTagColor = (type: string) => {
    switch (type) {
      case 'champion':
        return 'bg-victory-gold text-black';
      case 'rising_star':
        return 'bg-tactical-green text-white';
      case 'veteran':
        return 'bg-command-blue text-white';
      case 'clan_leader':
        return 'bg-purple-500 text-white';
      case 'top_contributor':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getActivityColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-tactical-green';
      case 'medium':
        return 'text-victory-gold';
      case 'low':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  // Filter rankings based on search and filters
  const filteredRankings = rankings.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.player.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.player.clan?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || entry.player.country === selectedRegion;
    const matchesTier = selectedTier === 'all' || entry.tier === selectedTier;
    
    return matchesSearch && matchesRegion && matchesTier;
  }).slice(0, maxEntries);

  const TopThreePodium = () => (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {filteredRankings.slice(0, 3).map((entry, index) => (
        <div
          key={entry.player.id}
          className={`military-card p-4 text-center relative cursor-pointer hover:shadow-lg transition-shadow ${
            index === 0 ? 'border-victory-gold' : 
            index === 1 ? 'border-gray-400' : 
            'border-amber-600'
          }`}
          onClick={() => onPlayerClick?.(entry.player.id)}
        >
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            {getRankIcon(entry.position)}
          </div>
          <div className="pt-4">
            <div className="relative">
              <img 
                src={entry.player.avatar || '/default-avatar.png'} 
                alt={entry.player.username}
                className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-border"
              />
              {entry.player.isOnline && (
                <div className="absolute top-0 right-1/2 transform translate-x-1/2 w-4 h-4 bg-tactical-green rounded-full border-2 border-background"></div>
              )}
            </div>
            
            <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse mb-2">
              <h3 className="font-bold text-foreground truncate text-lg">
                {entry.player.displayName || entry.player.username}
              </h3>
              {entry.player.verified && (
                <div className="text-tactical-green">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground mb-2">
              <Flag className="inline w-4 h-4 mr-1" />
              {entry.player.country}
            </div>
            
            <div className="text-2xl font-bold text-foreground mb-1">
              {formatNumber(entry.stats.rating, 'ar')}
            </div>
            <div className="text-sm text-muted-foreground mb-2">نقطة تقييم</div>
            
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTierColor(entry.tier)}`}>
              {entry.tier}
            </div>
            
            {entry.specialTags && entry.specialTags.length > 0 && (
              <div className="mt-2">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getSpecialTagColor(entry.specialTags[0].type)}`}>
                  {entry.specialTags[0].label}
                </span>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div>
                <div className="font-semibold text-foreground">{entry.stats.winRate}%</div>
                <div className="text-muted-foreground">معدل الفوز</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">{formatNumber(entry.stats.totalGames, 'ar')}</div>
                <div className="text-muted-foreground">مباراة</div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const RankingsList = () => (
    <div className="military-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">التصنيف الكامل</h3>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setViewMode(viewMode === 'detailed' ? 'compact' : 'detailed')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {viewMode === 'detailed' ? 'عرض مضغوط' : 'عرض تفصيلي'}
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left rtl:text-right p-3 text-sm font-medium text-foreground">المركز</th>
              <th className="text-left rtl:text-right p-3 text-sm font-medium text-foreground">اللاعب</th>
              <th className="text-left rtl:text-right p-3 text-sm font-medium text-foreground">التقييم</th>
              <th className="text-left rtl:text-right p-3 text-sm font-medium text-foreground">المباريات</th>
              <th className="text-left rtl:text-right p-3 text-sm font-medium text-foreground">معدل الفوز</th>
              {viewMode === 'detailed' && (
                <>
                  <th className="text-left rtl:text-right p-3 text-sm font-medium text-foreground">النشاط</th>
                  <th className="text-left rtl:text-right p-3 text-sm font-medium text-foreground">السلسلة</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredRankings.slice(3).map((entry, index) => (
              <tr 
                key={entry.player.id} 
                className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onPlayerClick?.(entry.player.id)}
              >
                {/* Rank */}
                <td className="p-3">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      {getRankIcon(entry.position)}
                      <span className="font-medium text-foreground">{entry.position}</span>
                    </div>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      {getChangeIcon(entry.change)}
                      {entry.change !== 0 && (
                        <span className={`text-xs ${entry.change > 0 ? 'text-tactical-green' : 'text-alert-red'}`}>
                          {Math.abs(entry.change)}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Player */}
                <td className="p-3">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="relative">
                      <img 
                        src={entry.player.avatar || '/default-avatar.png'} 
                        alt={entry.player.username}
                        className="w-10 h-10 rounded-full"
                      />
                      {entry.player.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-tactical-green rounded-full border border-background"></div>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <span className="font-medium text-foreground truncate">
                          {entry.player.displayName || entry.player.username}
                        </span>
                        {entry.player.verified && (
                          <div className="text-tactical-green">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                        <span className="text-muted-foreground">{entry.player.country}</span>
                        {entry.player.clan && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              [{entry.player.clan.tag}] {entry.player.clan.name}
                            </span>
                          </>
                        )}
                      </div>
                      {entry.specialTags && entry.specialTags.length > 0 && (
                        <div className="mt-1">
                          {entry.specialTags.slice(0, 2).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-1 ${getSpecialTagColor(tag.type)}`}
                            >
                              {tag.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Rating */}
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground">{formatNumber(entry.stats.rating, 'ar')}</span>
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <span className={`text-xs px-2 py-1 rounded-full ${getTierColor(entry.tier)}`}>
                        {entry.tier}
                      </span>
                      {entry.stats.ratingChange !== 0 && (
                        <span className={`text-xs ${entry.stats.ratingChange > 0 ? 'text-tactical-green' : 'text-alert-red'}`}>
                          {entry.stats.ratingChange > 0 ? '+' : ''}{entry.stats.ratingChange}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Games */}
                <td className="p-3">
                  <div className="text-sm">
                    <div className="font-medium text-foreground">{formatNumber(entry.stats.totalGames, 'ar')}</div>
                    <div className="text-muted-foreground">
                      {entry.stats.wins}W/{entry.stats.losses}L
                    </div>
                  </div>
                </td>

                {/* Win Rate */}
                <td className="p-3">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className={`font-medium ${
                      entry.stats.winRate >= 80 ? 'text-tactical-green' :
                      entry.stats.winRate >= 60 ? 'text-victory-gold' :
                      entry.stats.winRate >= 40 ? 'text-orange-500' :
                      'text-alert-red'
                    }`}>
                      {entry.stats.winRate}%
                    </div>
                    <div className="w-16 bg-muted rounded-full h-1">
                      <div 
                        className="bg-tactical-green h-1 rounded-full transition-all duration-300"
                        style={{ width: `${entry.stats.winRate}%` }}
                      ></div>
                    </div>
                  </div>
                </td>

                {/* Activity (detailed view only) */}
                {viewMode === 'detailed' && (
                  <td className="p-3">
                    <div className="text-sm">
                      <div className={`font-medium ${getActivityColor(entry.recentActivity.activityLevel)}`}>
                        {entry.recentActivity.gamesThisWeek} مباراة
                      </div>
                      <div className="text-muted-foreground">
                        {formatDate(new Date(entry.recentActivity.lastPlayed), 'ar', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </td>
                )}

                {/* Streak (detailed view only) */}
                {viewMode === 'detailed' && (
                  <td className="p-3">
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      {entry.stats.streak > 0 ? (
                        <div className="text-tactical-green font-medium">
                          +{entry.stats.streak} W
                        </div>
                      ) : entry.stats.streak < 0 ? (
                        <div className="text-alert-red font-medium">
                          {entry.stats.streak} L
                        </div>
                      ) : (
                        <div className="text-muted-foreground">-</div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {filteredRankings.length} من {rankings.length} لاعب
          </p>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="text-sm text-muted-foreground">
            آخر تحديث: {formatDate(new Date(), 'ar', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <Clock size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="military-card p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {showSearch && (
              <div className="flex-1 relative">
                <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="البحث عن لاعب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
            
            {showFilters && (
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Filter size={20} className="text-muted-foreground" />
                
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-input border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">جميع المناطق</option>
                  {filters?.regions?.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="bg-input border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">جميع الفئات</option>
                  {filters?.tiers?.map(tier => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
                
                <select
                  value={selectedTimePeriod}
                  onChange={(e) => setSelectedTimePeriod(e.target.value)}
                  className="bg-input border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="current">الحالي</option>
                  {filters?.timePeriods?.map(period => (
                    <option key={period} value={period}>{period}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="animate-spin text-muted-foreground mr-2" size={20} />
          <span className="text-muted-foreground">جاري التحديث...</span>
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {/* Top 3 Podium */}
          {filteredRankings.length >= 3 && <TopThreePodium />}
          
          {/* Rankings List */}
          <RankingsList />
          
          {/* No Results */}
          {filteredRankings.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد لاعبين في التصنيف'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LeaderBoard; 