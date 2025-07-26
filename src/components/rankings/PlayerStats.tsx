import React, { useState } from 'react';
import { 
  Trophy, 
  Target, 
  Users, 
  Calendar, 
  Clock, 
  Star,
  TrendingUp,
  TrendingDown,
  Medal,
  Crown,
  Shield,
  Swords,
  Eye,
  BarChart3,
  Map,
  Zap,
  Award
} from 'lucide-react';
import { formatNumber, formatDate, formatDuration } from '../../utils/i18n';

interface PlayerStatsProps {
  player: PlayerData;
  timeRange?: '7d' | '30d' | '90d' | '1y' | 'all';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y' | 'all') => void;
  comparisonPlayer?: PlayerData;
  className?: string;
}

interface PlayerData {
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
  currentRank: number;
  previousRank?: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster' | 'Legend';
  rating: number;
  ratingChange: number;
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    totalPlaytime: number;
    averageGameDuration: number;
    longestWinStreak: number;
    currentStreak: number;
    points: number;
    level: number;
    xp: number;
    xpToNextLevel: number;
  };
  factionStats: Array<{
    faction: 'USA' | 'China' | 'GLA';
    games: number;
    wins: number;
    losses: number;
    winRate: number;
    preferencePercentage: number;
    averageScore: number;
    bestScore: number;
  }>;
  mapStats: Array<{
    map: string;
    games: number;
    wins: number;
    losses: number;
    winRate: number;
    averageScore: number;
    bestTime: number;
  }>;
  gameMode: Array<{
    mode: 'skirmish' | 'multiplayer' | 'tournament';
    games: number;
    wins: number;
    losses: number;
    winRate: number;
    averageScore: number;
  }>;
  recentMatches: Array<{
    id: string;
    date: string;
    opponent: {
      id: number;
      username: string;
      avatar?: string;
    };
    result: 'win' | 'loss' | 'draw';
    playerFaction: 'USA' | 'China' | 'GLA';
    opponentFaction: 'USA' | 'China' | 'GLA';
    map: string;
    duration: number;
    score: number;
    ratingChange: number;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockedAt: string;
    category: 'gameplay' | 'social' | 'competitive' | 'special';
  }>;
  seasonStats: {
    currentSeason: number;
    seasonRank: number;
    seasonRating: number;
    seasonWins: number;
    seasonLosses: number;
    seasonWinRate: number;
    peakRating: number;
    peakRank: number;
    seasonsPlayed: number;
    bestSeasonRank: number;
  };
  activityStats: {
    gamesThisWeek: number;
    gamesThisMonth: number;
    averageGamesPerDay: number;
    mostActiveHour: string;
    mostActiveDay: string;
    longestSession: number;
    totalSessions: number;
  };
  socialStats: {
    friendsCount: number;
    followersCount: number;
    followingCount: number;
    clanContributions: number;
    helpfulRatings: number;
    forumPosts: number;
  };
  performanceMetrics: {
    economyScore: number;
    tacticsScore: number;
    microScore: number;
    strategyScore: number;
    teamworkScore: number;
    adaptabilityScore: number;
  };
}

const PlayerStats: React.FC<PlayerStatsProps> = ({
  player,
  timeRange = '30d',
  onTimeRangeChange,
  comparisonPlayer,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'factions' | 'maps' | 'matches' | 'achievements' | 'performance'>('overview');

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

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win':
        return 'text-tactical-green';
      case 'loss':
        return 'text-alert-red';
      case 'draw':
        return 'text-victory-gold';
      default:
        return 'text-muted-foreground';
    }
  };

  const getAchievementRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-victory-gold border-victory-gold bg-victory-gold/10';
      case 'epic':
        return 'text-purple-500 border-purple-500 bg-purple-500/10';
      case 'rare':
        return 'text-command-blue border-command-blue bg-command-blue/10';
      default:
        return 'text-muted-foreground border-border bg-muted/50';
    }
  };

  const getRankChange = (change: number) => {
    if (change > 0) {
      return (
        <div className="flex items-center space-x-1 rtl:space-x-reverse text-tactical-green">
          <TrendingUp size={16} />
          <span className="text-sm">+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center space-x-1 rtl:space-x-reverse text-alert-red">
          <TrendingDown size={16} />
          <span className="text-sm">{change}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1 rtl:space-x-reverse text-muted-foreground">
        <div className="w-4 h-4 rounded-full bg-current opacity-50"></div>
        <span className="text-sm">-</span>
      </div>
    );
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="military-card p-4 text-center">
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-2">
            <Trophy className="text-victory-gold" size={24} />
            {getRankChange(player.ratingChange)}
          </div>
          <div className="text-2xl font-bold text-foreground">{player.currentRank}</div>
          <div className="text-sm text-muted-foreground">الترتيب الحالي</div>
          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${getTierColor(player.tier)}`}>
            {player.tier}
          </div>
        </div>

        <div className="military-card p-4 text-center">
          <Target className="w-8 h-8 mx-auto text-tactical-green mb-2" />
          <div className="text-2xl font-bold text-foreground">{formatNumber(player.rating, 'ar')}</div>
          <div className="text-sm text-muted-foreground">نقاط التقييم</div>
          <div className={`text-xs mt-1 ${player.ratingChange >= 0 ? 'text-tactical-green' : 'text-alert-red'}`}>
            {player.ratingChange >= 0 ? '+' : ''}{player.ratingChange}
          </div>
        </div>

        <div className="military-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{player.stats.winRate}%</div>
          <div className="text-sm text-muted-foreground">معدل الفوز</div>
          <div className="text-xs text-muted-foreground mt-1">
            {player.stats.wins}W / {player.stats.losses}L
          </div>
        </div>

        <div className="military-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{formatNumber(player.stats.totalGames, 'ar')}</div>
          <div className="text-sm text-muted-foreground">إجمالي المباريات</div>
          <div className="text-xs text-muted-foreground mt-1">
            {player.stats.draws} تعادل
          </div>
        </div>
      </div>

      {/* Player Info */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">معلومات اللاعب</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">المستوى:</span>
              <span className="font-medium text-foreground">{player.stats.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">البلد:</span>
              <span className="font-medium text-foreground">{player.country}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">العشيرة:</span>
              <span className="font-medium text-foreground">
                {player.clan ? `[${player.clan.tag}] ${player.clan.name}` : 'غير منضم'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">وقت اللعب الإجمالي:</span>
              <span className="font-medium text-foreground">{formatDuration(player.stats.totalPlaytime)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">السلسلة الحالية:</span>
              <span className={`font-medium ${player.stats.currentStreak > 0 ? 'text-tactical-green' : 'text-alert-red'}`}>
                {player.stats.currentStreak > 0 ? '+' : ''}{player.stats.currentStreak}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">أطول سلسلة فوز:</span>
              <span className="font-medium text-foreground">{player.stats.longestWinStreak}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">متوسط مدة المباراة:</span>
              <span className="font-medium text-foreground">{formatDuration(player.stats.averageGameDuration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">النقاط:</span>
              <span className="font-medium text-foreground">{formatNumber(player.stats.points, 'ar')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Season Stats */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">إحصائيات الموسم</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <Crown className="w-8 h-8 mx-auto text-victory-gold mb-2" />
            <div className="text-lg font-bold text-foreground">{player.seasonStats.seasonRank}</div>
            <div className="text-sm text-muted-foreground">ترتيب الموسم</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <Star className="w-8 h-8 mx-auto text-command-blue mb-2" />
            <div className="text-lg font-bold text-foreground">{formatNumber(player.seasonStats.peakRating, 'ar')}</div>
            <div className="text-sm text-muted-foreground">أعلى تقييم</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-foreground">{player.seasonStats.seasonWinRate}%</div>
            <div className="text-sm text-muted-foreground">معدل فوز الموسم</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-foreground">{player.seasonStats.seasonsPlayed}</div>
            <div className="text-sm text-muted-foreground">مواسم مُلعبة</div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">إحصائيات النشاط</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-foreground">{player.activityStats.gamesThisWeek}</div>
            <div className="text-sm text-muted-foreground">مباريات هذا الأسبوع</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-foreground">{player.activityStats.averageGamesPerDay}</div>
            <div className="text-sm text-muted-foreground">متوسط المباريات يومياً</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-foreground">{player.activityStats.mostActiveHour}</div>
            <div className="text-sm text-muted-foreground">أكثر الأوقات نشاطاً</div>
          </div>
        </div>
      </div>
    </div>
  );

  const FactionsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {player.factionStats.map((faction, index) => (
          <div key={index} className="military-card p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <div className="text-4xl">{getFactionIcon(faction.faction)}</div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{faction.faction}</h3>
                <div className="text-sm text-muted-foreground">
                  {faction.preferencePercentage}% من المباريات
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المباريات:</span>
                <span className="font-medium text-foreground">{faction.games}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">معدل الفوز:</span>
                <span className={`font-medium ${faction.winRate >= 50 ? 'text-tactical-green' : 'text-alert-red'}`}>
                  {faction.winRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">متوسط النقاط:</span>
                <span className="font-medium text-foreground">{formatNumber(faction.averageScore, 'ar')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">أفضل نقاط:</span>
                <span className="font-medium text-foreground">{formatNumber(faction.bestScore, 'ar')}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-tactical-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${faction.winRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MapsTab = () => (
    <div className="space-y-6">
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">إحصائيات الخرائط</h3>
        <div className="space-y-4">
          {player.mapStats.slice(0, 10).map((map, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Map className="text-muted-foreground" size={20} />
                <div>
                  <div className="font-medium text-foreground">{map.map}</div>
                  <div className="text-sm text-muted-foreground">
                    {map.games} مباراة • {map.wins}W/{map.losses}L
                  </div>
                </div>
              </div>
              <div className="text-right rtl:text-left">
                <div className={`font-medium ${map.winRate >= 50 ? 'text-tactical-green' : 'text-alert-red'}`}>
                  {map.winRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatNumber(map.averageScore, 'ar')} نقطة
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const MatchesTab = () => (
    <div className="space-y-6">
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">المباريات الأخيرة</h3>
        <div className="space-y-4">
          {player.recentMatches.slice(0, 10).map((match, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                  match.result === 'win' ? 'bg-tactical-green text-white' :
                  match.result === 'loss' ? 'bg-alert-red text-white' :
                  'bg-victory-gold text-white'
                }`}>
                  {match.result === 'win' ? 'W' : match.result === 'loss' ? 'L' : 'D'}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="font-medium text-foreground">vs {match.opponent.username}</span>
                    <span className="text-sm text-muted-foreground">في {match.map}</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
                    <span>{getFactionIcon(match.playerFaction)} vs {getFactionIcon(match.opponentFaction)}</span>
                    <span>•</span>
                    <span>{formatDuration(match.duration)}</span>
                    <span>•</span>
                    <span>{formatDate(new Date(match.date), 'ar', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right rtl:text-left">
                <div className="font-medium text-foreground">
                  {formatNumber(match.score, 'ar')} نقطة
                </div>
                <div className={`text-sm ${match.ratingChange >= 0 ? 'text-tactical-green' : 'text-alert-red'}`}>
                  {match.ratingChange >= 0 ? '+' : ''}{match.ratingChange} تقييم
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AchievementsTab = () => (
    <div className="space-y-6">
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">الإنجازات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {player.achievements.map((achievement, index) => (
            <div key={index} className={`border-2 rounded-lg p-4 ${getAchievementRarityColor(achievement.rarity)}`}>
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <div className="font-semibold">{achievement.name}</div>
                  <div className="text-xs opacity-75">{achievement.description}</div>
                </div>
              </div>
              <div className="text-xs opacity-75">
                {formatDate(new Date(achievement.unlockedAt), 'ar')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PerformanceTab = () => (
    <div className="space-y-6">
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">مؤشرات الأداء</h3>
        <div className="space-y-4">
          {Object.entries(player.performanceMetrics).map(([key, value], index) => {
            const metricNames = {
              economyScore: 'الاقتصاد',
              tacticsScore: 'التكتيكات',
              microScore: 'الإدارة الدقيقة',
              strategyScore: 'الاستراتيجية',
              teamworkScore: 'العمل الجماعي',
              adaptabilityScore: 'التأقلم'
            };
            
            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-foreground font-medium">{metricNames[key] || key}</span>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div 
                      className="bg-tactical-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-foreground w-8">{value}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <img 
            src={player.avatar || '/default-avatar.png'} 
            alt={player.displayName || player.username}
            className="w-16 h-16 rounded-full border-2 border-border"
          />
          <div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <h1 className="text-2xl font-bold text-foreground">
                {player.displayName || player.username}
              </h1>
              {player.verified && (
                <div className="text-tactical-green">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="text-muted-foreground">#{player.currentRank} • {player.country}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange?.(e.target.value as any)}
            className="bg-input border border-border rounded px-3 py-2 text-sm"
          >
            <option value="7d">آخر 7 أيام</option>
            <option value="30d">آخر 30 يوم</option>
            <option value="90d">آخر 3 أشهر</option>
            <option value="1y">آخر عام</option>
            <option value="all">كل الأوقات</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 rtl:space-x-reverse">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
            { id: 'factions', label: 'الفصائل', icon: Shield },
            { id: 'maps', label: 'الخرائط', icon: Map },
            { id: 'matches', label: 'المباريات', icon: Swords },
            { id: 'achievements', label: 'الإنجازات', icon: Award },
            { id: 'performance', label: 'الأداء', icon: Target },
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
      {activeTab === 'factions' && <FactionsTab />}
      {activeTab === 'maps' && <MapsTab />}
      {activeTab === 'matches' && <MatchesTab />}
      {activeTab === 'achievements' && <AchievementsTab />}
      {activeTab === 'performance' && <PerformanceTab />}
    </div>
  );
};

export default PlayerStats; 