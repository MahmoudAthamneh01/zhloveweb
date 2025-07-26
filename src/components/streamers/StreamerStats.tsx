import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Users, 
  Play, 
  Calendar,
  Clock,
  Star,
  Trophy,
  Target,
  BarChart3,
  Youtube,
  Twitch,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';
import { formatNumber, formatDate, formatDuration } from '../../utils/i18n';

interface StreamerStatsProps {
  streamer: StreamerData;
  timeRange?: '7d' | '30d' | '90d' | '1y' | 'all';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y' | 'all') => void;
  className?: string;
}

interface StreamerData {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
  banner?: string;
  verified: boolean;
  platforms: Array<{
    type: 'youtube' | 'twitch' | 'facebook' | 'tiktok';
    followers: number;
    subscribers?: number;
    totalViews: number;
    verified: boolean;
  }>;
  overallStats: {
    totalFollowers: number;
    totalViews: number;
    totalVideos: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    averageViews: number;
    averageEngagement: number;
    rating: number;
    totalRatings: number;
  };
  recentStats: {
    period: string;
    views: number;
    viewsChange: number;
    followers: number;
    followersChange: number;
    engagement: number;
    engagementChange: number;
    videosUploaded: number;
    avgViewDuration: number;
    topVideo: {
      id: string;
      title: string;
      views: number;
      thumbnail: string;
    };
  };
  contentStats: {
    uploadFrequency: number; // videos per week
    averageVideoDuration: number;
    mostPopularHour: string;
    mostPopularDay: string;
    topCategories: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    topTags: Array<{
      tag: string;
      count: number;
    }>;
  };
  audienceStats: {
    demographics: {
      ageGroups: Array<{
        range: string;
        percentage: number;
      }>;
      genders: Array<{
        type: 'male' | 'female' | 'other';
        percentage: number;
      }>;
      topCountries: Array<{
        country: string;
        percentage: number;
      }>;
    };
    engagement: {
      avgWatchTime: number;
      returnViewers: number;
      newViewers: number;
      commentRate: number;
      likeRate: number;
      shareRate: number;
    };
  };
  gameStats: {
    totalPlaytime: number;
    favoriteGeneral: 'USA' | 'China' | 'GLA';
    gamesPlayed: number;
    winRate: number;
    rank: string;
    level: number;
    achievements: number;
    mostPlayedMaps: Array<{
      map: string;
      count: number;
    }>;
  };
  milestones: Array<{
    id: string;
    type: 'followers' | 'views' | 'videos' | 'rating';
    value: number;
    achievedAt: string;
    description: string;
  }>;
  collaborations: Array<{
    id: string;
    partner: {
      id: number;
      username: string;
      displayName: string;
      avatar: string;
    };
    type: 'video' | 'stream' | 'tournament';
    title: string;
    views: number;
    date: string;
  }>;
}

const StreamerStats: React.FC<StreamerStatsProps> = ({
  streamer,
  timeRange = '30d',
  onTimeRangeChange,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'audience' | 'game' | 'milestones'>('overview');

  const getTimeRangeText = (range: string) => {
    switch (range) {
      case '7d':
        return 'آخر 7 أيام';
      case '30d':
        return 'آخر 30 يوم';
      case '90d':
        return 'آخر 3 أشهر';
      case '1y':
        return 'آخر عام';
      case 'all':
        return 'كل الأوقات';
      default:
        return range;
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-tactical-green';
    if (change < 0) return 'text-alert-red';
    return 'text-muted-foreground';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp size={16} />;
    if (change < 0) return <TrendingDown size={16} />;
    return <div className="w-4 h-4 rounded-full bg-current opacity-50"></div>;
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <Youtube size={16} className="text-red-500" />;
      case 'twitch':
        return <Twitch size={16} className="text-purple-500" />;
      default:
        return <Play size={16} />;
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

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="military-card p-4 text-center">
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-2">
            <Users className="text-tactical-green" size={24} />
            <div className={`flex items-center space-x-1 rtl:space-x-reverse ${getChangeColor(streamer.recentStats.followersChange)}`}>
              {getChangeIcon(streamer.recentStats.followersChange)}
              <span className="text-xs">
                {streamer.recentStats.followersChange > 0 ? '+' : ''}{streamer.recentStats.followersChange}%
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{formatNumber(streamer.overallStats.totalFollowers, 'ar')}</div>
          <div className="text-sm text-muted-foreground">إجمالي المتابعين</div>
        </div>

        <div className="military-card p-4 text-center">
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-2">
            <Eye className="text-command-blue" size={24} />
            <div className={`flex items-center space-x-1 rtl:space-x-reverse ${getChangeColor(streamer.recentStats.viewsChange)}`}>
              {getChangeIcon(streamer.recentStats.viewsChange)}
              <span className="text-xs">
                {streamer.recentStats.viewsChange > 0 ? '+' : ''}{streamer.recentStats.viewsChange}%
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{formatNumber(streamer.overallStats.totalViews, 'ar')}</div>
          <div className="text-sm text-muted-foreground">إجمالي المشاهدات</div>
        </div>

        <div className="military-card p-4 text-center">
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-2">
            <Play className="text-victory-gold" size={24} />
            <div className="text-xs text-muted-foreground">
              +{streamer.recentStats.videosUploaded} هذا الشهر
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{streamer.overallStats.totalVideos}</div>
          <div className="text-sm text-muted-foreground">إجمالي الفيديوهات</div>
        </div>

        <div className="military-card p-4 text-center">
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-2">
            <Star className="text-orange-500" size={24} />
            <div className={`flex items-center space-x-1 rtl:space-x-reverse ${getChangeColor(streamer.recentStats.engagementChange)}`}>
              {getChangeIcon(streamer.recentStats.engagementChange)}
              <span className="text-xs">
                {streamer.recentStats.engagementChange > 0 ? '+' : ''}{streamer.recentStats.engagementChange}%
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{streamer.overallStats.averageEngagement.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">معدل التفاعل</div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">إحصائيات المنصات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {streamer.platforms.map((platform, index) => (
            <div key={index} className="bg-muted rounded-lg p-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                {getPlatformIcon(platform.type)}
                <span className="font-medium text-foreground capitalize">{platform.type}</span>
                {platform.verified && (
                  <div className="text-tactical-green">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-semibold text-foreground">{formatNumber(platform.followers, 'ar')}</div>
                  <div className="text-muted-foreground">متابع</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{formatNumber(platform.totalViews, 'ar')}</div>
                  <div className="text-muted-foreground">مشاهدة</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Performance */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">الأداء الأخير ({getTimeRangeText(timeRange)})</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">المشاهدات</span>
              <div className={`flex items-center space-x-1 rtl:space-x-reverse ${getChangeColor(streamer.recentStats.viewsChange)}`}>
                {getChangeIcon(streamer.recentStats.viewsChange)}
                <span className="text-xs">
                  {streamer.recentStats.viewsChange > 0 ? '+' : ''}{streamer.recentStats.viewsChange}%
                </span>
              </div>
            </div>
            <div className="text-xl font-bold text-foreground">{formatNumber(streamer.recentStats.views, 'ar')}</div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">المتابعين الجدد</span>
              <div className={`flex items-center space-x-1 rtl:space-x-reverse ${getChangeColor(streamer.recentStats.followersChange)}`}>
                {getChangeIcon(streamer.recentStats.followersChange)}
                <span className="text-xs">
                  {streamer.recentStats.followersChange > 0 ? '+' : ''}{streamer.recentStats.followersChange}%
                </span>
              </div>
            </div>
            <div className="text-xl font-bold text-foreground">{formatNumber(streamer.recentStats.followers, 'ar')}</div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">متوسط وقت المشاهدة</span>
            </div>
            <div className="text-xl font-bold text-foreground">{formatDuration(streamer.recentStats.avgViewDuration)}</div>
          </div>
        </div>
      </div>

      {/* Top Video */}
      {streamer.recentStats.topVideo && (
        <div className="military-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">الفيديو الأكثر شعبية</h3>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <img 
              src={streamer.recentStats.topVideo.thumbnail} 
              alt={streamer.recentStats.topVideo.title}
              className="w-32 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-foreground mb-1">{streamer.recentStats.topVideo.title}</h4>
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
                <Eye size={14} />
                <span>{formatNumber(streamer.recentStats.topVideo.views, 'ar')} مشاهدة</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const ContentTab = () => (
    <div className="space-y-6">
      {/* Upload Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="military-card p-4 text-center">
          <Calendar className="w-8 h-8 mx-auto text-tactical-green mb-2" />
          <div className="text-xl font-bold text-foreground">{streamer.contentStats.uploadFrequency}</div>
          <div className="text-sm text-muted-foreground">فيديو/أسبوع</div>
        </div>
        <div className="military-card p-4 text-center">
          <Clock className="w-8 h-8 mx-auto text-command-blue mb-2" />
          <div className="text-xl font-bold text-foreground">{formatDuration(streamer.contentStats.averageVideoDuration)}</div>
          <div className="text-sm text-muted-foreground">متوسط المدة</div>
        </div>
        <div className="military-card p-4 text-center">
          <BarChart3 className="w-8 h-8 mx-auto text-victory-gold mb-2" />
          <div className="text-xl font-bold text-foreground">{streamer.contentStats.mostPopularHour}</div>
          <div className="text-sm text-muted-foreground">أفضل وقت نشر</div>
        </div>
        <div className="military-card p-4 text-center">
          <Target className="w-8 h-8 mx-auto text-orange-500 mb-2" />
          <div className="text-xl font-bold text-foreground">{streamer.contentStats.mostPopularDay}</div>
          <div className="text-sm text-muted-foreground">أفضل يوم نشر</div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">أهم الفئات</h3>
        <div className="space-y-3">
          {streamer.contentStats.topCategories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <span className="font-medium text-foreground">{category.category}</span>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div 
                    className="bg-tactical-green h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">{category.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Tags */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">أهم التاقات</h3>
        <div className="flex flex-wrap gap-2">
          {streamer.contentStats.topTags.map((tag, index) => (
            <span 
              key={index}
              className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center space-x-1 rtl:space-x-reverse"
            >
              <span>#{tag.tag}</span>
              <span className="text-xs opacity-75">({tag.count})</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const AudienceTab = () => (
    <div className="space-y-6">
      {/* Engagement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="military-card p-4 text-center">
          <Heart className="w-8 h-8 mx-auto text-tactical-green mb-2" />
          <div className="text-xl font-bold text-foreground">{streamer.audienceStats.engagement.likeRate.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">معدل الإعجاب</div>
        </div>
        <div className="military-card p-4 text-center">
          <MessageCircle className="w-8 h-8 mx-auto text-command-blue mb-2" />
          <div className="text-xl font-bold text-foreground">{streamer.audienceStats.engagement.commentRate.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">معدل التعليق</div>
        </div>
        <div className="military-card p-4 text-center">
          <Share2 className="w-8 h-8 mx-auto text-victory-gold mb-2" />
          <div className="text-xl font-bold text-foreground">{streamer.audienceStats.engagement.shareRate.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">معدل المشاركة</div>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="military-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">الفئات العمرية</h3>
          <div className="space-y-3">
            {streamer.audienceStats.demographics.ageGroups.map((group, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{group.range}</span>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-tactical-green h-2 rounded-full"
                      style={{ width: `${group.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">{group.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="military-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">أهم البلدان</h3>
          <div className="space-y-3">
            {streamer.audienceStats.demographics.topCountries.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{country.country}</span>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-command-blue h-2 rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">{country.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Viewer Stats */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">إحصائيات المشاهدين</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-foreground">{formatDuration(streamer.audienceStats.engagement.avgWatchTime)}</div>
            <div className="text-sm text-muted-foreground">متوسط وقت المشاهدة</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-foreground">{streamer.audienceStats.engagement.returnViewers}%</div>
            <div className="text-sm text-muted-foreground">مشاهدين عائدين</div>
          </div>
          <div className="bg-muted rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-foreground">{streamer.audienceStats.engagement.newViewers}%</div>
            <div className="text-sm text-muted-foreground">مشاهدين جدد</div>
          </div>
        </div>
      </div>
    </div>
  );

  const GameTab = () => (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="military-card p-4 text-center">
          <div className="text-3xl mb-2">{getFactionIcon(streamer.gameStats.favoriteGeneral)}</div>
          <div className="text-lg font-bold text-foreground">{streamer.gameStats.favoriteGeneral}</div>
          <div className="text-sm text-muted-foreground">الفصيل المفضل</div>
        </div>
        <div className="military-card p-4 text-center">
          <Trophy className="w-8 h-8 mx-auto text-victory-gold mb-2" />
          <div className="text-lg font-bold text-foreground">{streamer.gameStats.rank}</div>
          <div className="text-sm text-muted-foreground">الرتبة</div>
        </div>
        <div className="military-card p-4 text-center">
          <Star className="w-8 h-8 mx-auto text-command-blue mb-2" />
          <div className="text-lg font-bold text-foreground">{streamer.gameStats.level}</div>
          <div className="text-sm text-muted-foreground">المستوى</div>
        </div>
        <div className="military-card p-4 text-center">
          <Target className="w-8 h-8 mx-auto text-tactical-green mb-2" />
          <div className="text-lg font-bold text-foreground">{streamer.gameStats.winRate}%</div>
          <div className="text-sm text-muted-foreground">معدل الفوز</div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">الإحصائيات التفصيلية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">إجمالي وقت اللعب:</span>
              <span className="font-medium text-foreground">{formatDuration(streamer.gameStats.totalPlaytime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">المباريات المُلعبة:</span>
              <span className="font-medium text-foreground">{formatNumber(streamer.gameStats.gamesPlayed, 'ar')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الإنجازات:</span>
              <span className="font-medium text-foreground">{streamer.gameStats.achievements}</span>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-2">الخرائط الأكثر لعباً</h4>
            <div className="space-y-2">
              {streamer.gameStats.mostPlayedMaps.map((map, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{map.map}</span>
                  <span className="text-sm text-muted-foreground">{map.count} مرة</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MilestonesTab = () => (
    <div className="space-y-6">
      {/* Milestones */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">الإنجازات والمعالم</h3>
        <div className="space-y-4">
          {streamer.milestones.map((milestone) => (
            <div key={milestone.id} className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-muted rounded-lg">
              <div className="w-10 h-10 bg-tactical-green/20 rounded-full flex items-center justify-center">
                <Trophy className="text-tactical-green" size={20} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">{milestone.description}</div>
                <div className="text-sm text-muted-foreground">
                  {formatNumber(milestone.value, 'ar')} • {formatDate(new Date(milestone.achievedAt), 'ar')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collaborations */}
      <div className="military-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">التعاونات</h3>
        <div className="space-y-4">
          {streamer.collaborations.map((collab) => (
            <div key={collab.id} className="flex items-center space-x-3 rtl:space-x-reverse p-3 bg-muted rounded-lg">
              <img 
                src={collab.partner.avatar} 
                alt={collab.partner.displayName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="font-medium text-foreground">{collab.title}</div>
                <div className="text-sm text-muted-foreground">
                  مع {collab.partner.displayName} • {formatNumber(collab.views, 'ar')} مشاهدة
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(new Date(collab.date), 'ar')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">إحصائيات المحتوى</h2>
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
            { id: 'content', label: 'المحتوى', icon: Play },
            { id: 'audience', label: 'الجمهور', icon: Users },
            { id: 'game', label: 'إحصائيات اللعبة', icon: Trophy },
            { id: 'milestones', label: 'الإنجازات', icon: Star },
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
      {activeTab === 'content' && <ContentTab />}
      {activeTab === 'audience' && <AudienceTab />}
      {activeTab === 'game' && <GameTab />}
      {activeTab === 'milestones' && <MilestonesTab />}
    </div>
  );
};

export default StreamerStats; 