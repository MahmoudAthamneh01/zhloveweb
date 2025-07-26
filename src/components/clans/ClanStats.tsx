import React, { useState } from 'react';
import { Trophy, Users, Star, Swords, TrendingUp, TrendingDown, Calendar, Target, Award, Crown } from 'lucide-react';
import { formatNumber, formatDate } from '../../utils/i18n';

interface ClanStatsProps {
  stats: ClanStatistics;
  history?: ClanHistoryEntry[];
  achievements?: ClanAchievement[];
  wars?: ClanWar[];
  className?: string;
}

interface ClanStatistics {
  overall: {
    totalMembers: number;
    activeMembers: number;
    level: number;
    xp: number;
    xpToNextLevel: number;
    trophies: number;
    averageTrophies: number;
    totalWins: number;
    totalLosses: number;
    winRate: number;
  };
  wars: {
    totalWars: number;
    warsWon: number;
    warsLost: number;
    warWinRate: number;
    currentStreak: number;
    bestStreak: number;
    totalStars: number;
    averageStars: number;
  };
  members: {
    newMembersThisWeek: number;
    newMembersThisMonth: number;
    activeMembersToday: number;
    topContributor: {
      username: string;
      contributions: number;
    };
    mostImproved: {
      username: string;
      improvement: number;
    };
  };
  activity: {
    totalGames: number;
    gamesThisWeek: number;
    averageGamesPerMember: number;
    peakActiveTime: string;
    mostActiveDay: string;
  };
}

interface ClanHistoryEntry {
  date: string;
  event: 'member_joined' | 'member_left' | 'war_won' | 'war_lost' | 'level_up' | 'achievement';
  description: string;
  impact?: {
    trophies?: number;
    members?: number;
    level?: number;
  };
}

interface ClanAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress?: {
    current: number;
    required: number;
  };
}

interface ClanWar {
  id: number;
  opponent: {
    name: string;
    tag: string;
    level: number;
  };
  status: 'preparation' | 'battle' | 'ended';
  result?: 'victory' | 'defeat' | 'draw';
  startTime: string;
  endTime?: string;
  stats: {
    ourStars: number;
    theirStars: number;
    ourDestruction: number;
    theirDestruction: number;
    participants: number;
  };
}

const ClanStats: React.FC<ClanStatsProps> = ({
  stats,
  history = [],
  achievements = [],
  wars = [],
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'wars' | 'members' | 'history'>('overview');

  const getRarityColor = (rarity: string) => {
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

  const getWarResultColor = (result?: string) => {
    switch (result) {
      case 'victory':
        return 'text-tactical-green bg-tactical-green/20';
      case 'defeat':
        return 'text-alert-red bg-alert-red/20';
      case 'draw':
        return 'text-victory-gold bg-victory-gold/20';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="military-card p-4 text-center">
          <Trophy className="w-8 h-8 mx-auto text-victory-gold mb-2" />
          <div className="text-2xl font-bold text-foreground">{formatNumber(stats.overall.trophies, 'ar')}</div>
          <div className="text-sm text-muted-foreground">إجمالي الكؤوس</div>
          <div className="text-xs text-tactical-green mt-1">
            متوسط {formatNumber(stats.overall.averageTrophies, 'ar')} لكل عضو
          </div>
        </div>

        <div className="military-card p-4 text-center">
          <Users className="w-8 h-8 mx-auto text-tactical-green mb-2" />
          <div className="text-2xl font-bold text-foreground">{stats.overall.totalMembers}</div>
          <div className="text-sm text-muted-foreground">إجمالي الأعضاء</div>
          <div className="text-xs text-tactical-green mt-1">
            {stats.overall.activeMembers} نشط
          </div>
        </div>

        <div className="military-card p-4 text-center">
          <Star className="w-8 h-8 mx-auto text-command-blue mb-2" />
          <div className="text-2xl font-bold text-foreground">{stats.overall.winRate}%</div>
          <div className="text-sm text-muted-foreground">معدل الفوز</div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatNumber(stats.overall.totalWins, 'ar')}W / {formatNumber(stats.overall.totalLosses, 'ar')}L
          </div>
        </div>

        <div className="military-card p-4 text-center">
          <Crown className="w-8 h-8 mx-auto text-victory-gold mb-2" />
          <div className="text-2xl font-bold text-foreground">{stats.overall.level}</div>
          <div className="text-sm text-muted-foreground">مستوى العشيرة</div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className="bg-victory-gold rounded-full h-2 transition-all duration-300"
              style={{ width: `${(stats.overall.xp / (stats.overall.xp + stats.overall.xpToNextLevel)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">نظرة عامة على النشاط</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold text-foreground">{formatNumber(stats.activity.totalGames, 'ar')}</div>
            <div className="text-sm text-muted-foreground">إجمالي المباريات</div>
            <div className="text-xs text-tactical-green">
              {formatNumber(stats.activity.gamesThisWeek, 'ar')} هذا الأسبوع
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stats.activity.averageGamesPerMember}</div>
            <div className="text-sm text-muted-foreground">متوسط المباريات لكل عضو</div>
            <div className="text-xs text-muted-foreground">
              ذروة النشاط: {stats.activity.peakActiveTime}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stats.members.activeMembersToday}</div>
            <div className="text-sm text-muted-foreground">نشط اليوم</div>
            <div className="text-xs text-muted-foreground">
              يوم أكثر نشاطاً: {stats.activity.mostActiveDay}
            </div>
          </div>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">أفضل المساهمين</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
              <Trophy className="text-victory-gold" size={20} />
              <span className="font-medium text-foreground">أفضل مساهم</span>
            </div>
            <div className="text-lg font-bold text-foreground">{stats.members.topContributor.username}</div>
            <div className="text-sm text-muted-foreground">
              {formatNumber(stats.members.topContributor.contributions, 'ar')} مساهمة
            </div>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
              <TrendingUp className="text-tactical-green" size={20} />
              <span className="font-medium text-foreground">أكثر تحسناً</span>
            </div>
            <div className="text-lg font-bold text-foreground">{stats.members.mostImproved.username}</div>
            <div className="text-sm text-muted-foreground">
              +{formatNumber(stats.members.mostImproved.improvement, 'ar')} كأس
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const WarsTab = () => (
    <div className="space-y-6">
      {/* War Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="military-card p-4 text-center">
          <Swords className="w-8 h-8 mx-auto text-alert-red mb-2" />
          <div className="text-2xl font-bold text-foreground">{stats.wars.totalWars}</div>
          <div className="text-sm text-muted-foreground">إجمالي الحروب</div>
        </div>

        <div className="military-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{stats.wars.warWinRate}%</div>
          <div className="text-sm text-muted-foreground">معدل فوز الحروب</div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.wars.warsWon}W / {stats.wars.warsLost}L
          </div>
        </div>

        <div className="military-card p-4 text-center">
          <Target className="w-8 h-8 mx-auto text-victory-gold mb-2" />
          <div className="text-2xl font-bold text-foreground">{formatNumber(stats.wars.totalStars, 'ar')}</div>
          <div className="text-sm text-muted-foreground">إجمالي النجوم</div>
          <div className="text-xs text-tactical-green mt-1">
            متوسط {stats.wars.averageStars} لكل حرب
          </div>
        </div>

        <div className="military-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{stats.wars.currentStreak}</div>
          <div className="text-sm text-muted-foreground">السلسلة الحالية</div>
          <div className="text-xs text-muted-foreground mt-1">
            أفضل سلسلة: {stats.wars.bestStreak}
          </div>
        </div>
      </div>

      {/* Recent Wars */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">الحروب الأخيرة</h3>
        <div className="space-y-4">
          {wars.slice(0, 5).map((war) => (
            <div key={war.id} className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="text-lg font-semibold text-foreground">
                    vs [{war.opponent.tag}] {war.opponent.name}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Level {war.opponent.level}
                  </span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {war.result && (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getWarResultColor(war.result)}`}>
                      {war.result === 'victory' ? 'نصر' : war.result === 'defeat' ? 'هزيمة' : 'تعادل'}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {formatDate(new Date(war.startTime), 'ar', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              
              {war.status === 'ended' && (
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{war.stats.ourStars} - {war.stats.theirStars}</div>
                    <div className="text-muted-foreground">النجوم</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{war.stats.ourDestruction}% - {war.stats.theirDestruction}%</div>
                    <div className="text-muted-foreground">الدمار</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{war.stats.participants}</div>
                    <div className="text-muted-foreground">المشاركون</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const MembersTab = () => (
    <div className="space-y-6">
      {/* Member Growth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="military-card p-4 text-center">
          <div className="text-2xl font-bold text-tactical-green">{stats.members.newMembersThisWeek}</div>
          <div className="text-sm text-muted-foreground">أعضاء جدد هذا الأسبوع</div>
        </div>
        <div className="military-card p-4 text-center">
          <div className="text-2xl font-bold text-command-blue">{stats.members.newMembersThisMonth}</div>
          <div className="text-sm text-muted-foreground">أعضاء جدد هذا الشهر</div>
        </div>
        <div className="military-card p-4 text-center">
          <div className="text-2xl font-bold text-victory-gold">{stats.members.activeMembersToday}</div>
          <div className="text-sm text-muted-foreground">نشط اليوم</div>
        </div>
      </div>

      {/* Member Activity Chart Placeholder */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">نشاط الأعضاء خلال الأسبوع</h3>
        <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-2 opacity-50" />
            <p className="text-muted-foreground">الرسم البياني لنشاط الأعضاء</p>
            <p className="text-sm text-muted-foreground">سيتم تنفيذه مع Chart.js أو مكتبة مماثلة</p>
          </div>
        </div>
      </div>
    </div>
  );

  const HistoryTab = () => (
    <div className="space-y-6">
      {/* Achievements */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">الإنجازات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className={`border-2 rounded-lg p-4 ${getRarityColor(achievement.rarity)}`}>
              <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                <div className="text-2xl">{achievement.icon}</div>
                <div>
                  <div className="font-semibold">{achievement.name}</div>
                  <div className="text-xs opacity-75">{achievement.description}</div>
                </div>
              </div>
              <div className="text-xs opacity-75">
                تم الحصول عليه في {formatDate(new Date(achievement.unlockedAt), 'ar')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent History */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">التاريخ الأخير</h3>
        <div className="space-y-3">
          {history.slice(0, 10).map((entry, index) => (
            <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-muted rounded-lg">
              <div className="w-2 h-2 bg-tactical-green rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="text-sm text-foreground">{entry.description}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(new Date(entry.date), 'ar', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              {entry.impact && (
                <div className="text-sm">
                  {entry.impact.trophies && (
                    <span className="text-victory-gold">+{entry.impact.trophies} 🏆</span>
                  )}
                  {entry.impact.members && (
                    <span className="text-tactical-green">+{entry.impact.members} 👥</span>
                  )}
                  {entry.impact.level && (
                    <span className="text-command-blue">+{entry.impact.level} ⭐</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 rtl:space-x-reverse">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: Star },
            { id: 'wars', label: 'الحروب', icon: Swords },
            { id: 'members', label: 'الأعضاء', icon: Users },
            { id: 'history', label: 'التاريخ', icon: Calendar },
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
      {activeTab === 'wars' && <WarsTab />}
      {activeTab === 'members' && <MembersTab />}
      {activeTab === 'history' && <HistoryTab />}
    </div>
  );
};

export default ClanStats; 