import React from 'react';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  Medal,
  Eye,
  MapPin,
  Crown,
  Target,
  Zap,
  Gift,
  CheckCircle,
  AlertCircle,
  Play
} from 'lucide-react';
import { formatNumber, formatDate, formatDuration } from '../../utils/i18n';

interface TournamentCardProps {
  tournament: Tournament;
  onJoin?: (tournamentId: number) => void;
  onView?: (tournamentId: number) => void;
  onShare?: (tournamentId: number) => void;
  isCompact?: boolean;
  showActions?: boolean;
  currentUserId?: number;
  className?: string;
}

interface Tournament {
  id: number;
  name: string;
  description: string;
  banner?: string;
  type: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss' | 'ladder';
  format: '1v1' | '2v2' | '3v3' | '4v4' | 'team';
  status: 'upcoming' | 'registration' | 'in_progress' | 'completed' | 'cancelled';
  gameMode: 'ranked' | 'casual' | 'custom';
  maxParticipants: number;
  currentParticipants: number;
  prizePool: number;
  currency: 'USD' | 'SAR' | 'AED' | 'EGP';
  entryFee: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  createdAt: string;
  updatedAt: string;
  organizer: {
    id: number;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  rules: {
    mapPool: string[];
    gameSettings: string;
    timeLimit: number;
    allowedFactions: string[];
    banRules?: string;
  };
  prizes: Array<{
    position: number;
    amount: number;
    title: string;
    description?: string;
  }>;
  sponsors?: Array<{
    name: string;
    logo: string;
    url?: string;
  }>;
  participants: Array<{
    id: number;
    username: string;
    displayName: string;
    avatar: string;
    rank: number;
    rating: number;
    registeredAt: string;
    teamName?: string;
    teammates?: Array<{
      id: number;
      username: string;
      displayName: string;
    }>;
  }>;
  brackets?: {
    currentRound: number;
    totalRounds: number;
    matches: Array<{
      id: number;
      round: number;
      participant1: any;
      participant2: any;
      winner?: any;
      status: 'pending' | 'in_progress' | 'completed';
      scheduledAt?: string;
    }>;
  };
  stats: {
    totalViews: number;
    totalMatches: number;
    averageMatchDuration: number;
    totalPrizeMoney: number;
    popularityScore: number;
  };
  tags: string[];
  featured: boolean;
  isRegistered?: boolean;
  canRegister?: boolean;
  region: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  streamUrl?: string;
  discordServer?: string;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onJoin,
  onView,
  onShare,
  isCompact = false,
  showActions = true,
  currentUserId,
  className = '',
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-command-blue/20 text-command-blue';
      case 'registration':
        return 'bg-tactical-green/20 text-tactical-green';
      case 'in_progress':
        return 'bg-victory-gold/20 text-victory-gold';
      case 'completed':
        return 'bg-neutral-silver/20 text-neutral-silver';
      case 'cancelled':
        return 'bg-alert-red/20 text-alert-red';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'قادمة';
      case 'registration':
        return 'التسجيل مفتوح';
      case 'in_progress':
        return 'جارية';
      case 'completed':
        return 'منتهية';
      case 'cancelled':
        return 'ملغية';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'single_elimination':
        return 'إقصاء مباشر';
      case 'double_elimination':
        return 'إقصاء مزدوج';
      case 'round_robin':
        return 'دوري';
      case 'swiss':
        return 'سويسري';
      case 'ladder':
        return 'سلم';
      default:
        return type;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-tactical-green/20 text-tactical-green';
      case 'intermediate':
        return 'bg-victory-gold/20 text-victory-gold';
      case 'advanced':
        return 'bg-orange-500/20 text-orange-500';
      case 'pro':
        return 'bg-alert-red/20 text-alert-red';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'مبتدئ';
      case 'intermediate':
        return 'متوسط';
      case 'advanced':
        return 'متقدم';
      case 'pro':
        return 'محترف';
      default:
        return difficulty;
    }
  };

  const getTimeUntilStart = () => {
    const now = new Date();
    const startTime = new Date(tournament.startDate);
    const diffMs = startTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return null;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `خلال ${days} يوم`;
    if (hours > 0) return `خلال ${hours} ساعة`;
    return 'قريباً';
  };

  const getParticipationPercentage = () => {
    return (tournament.currentParticipants / tournament.maxParticipants) * 100;
  };

  if (isCompact) {
    return (
      <div className={`military-card hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}>
        <div className="relative">
          {tournament.banner && (
            <div className="relative h-32 overflow-hidden rounded-t-lg">
              <img 
                src={tournament.banner} 
                alt={tournament.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              {tournament.featured && (
                <div className="absolute top-3 right-3 bg-victory-gold text-black px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 rtl:space-x-reverse">
                  <Crown size={12} />
                  <span>مميزة</span>
                </div>
              )}
              <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                {getStatusText(tournament.status)}
              </div>
            </div>
          )}
          
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-lg truncate">{tournament.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{tournament.description}</p>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse ml-2 rtl:mr-2">
                <Trophy size={16} className="text-victory-gold" />
                <span className="text-sm font-bold text-victory-gold">
                  {formatNumber(tournament.prizePool, 'ar')} {tournament.currency}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-muted-foreground">
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Users size={14} />
                  <span>{tournament.currentParticipants}/{tournament.maxParticipants}</span>
                </div>
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <Calendar size={14} />
                  <span>{formatDate(new Date(tournament.startDate), 'ar', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tournament.difficulty)}`}>
                {getDifficultyText(tournament.difficulty)}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>المشاركون</span>
                <span>{getParticipationPercentage().toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-tactical-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getParticipationPercentage()}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <img 
                  src={tournament.organizer.avatar} 
                  alt={tournament.organizer.displayName}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-muted-foreground">{tournament.organizer.displayName}</span>
                {tournament.organizer.verified && (
                  <CheckCircle size={14} className="text-tactical-green" />
                )}
              </div>
              
              {showActions && (
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => onView?.(tournament.id)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Eye size={16} />
                  </button>
                  {tournament.canRegister && !tournament.isRegistered && (
                    <button
                      onClick={() => onJoin?.(tournament.id)}
                      className="btn btn-sm btn-primary"
                    >
                      انضمام
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full Card View
  return (
    <div className={`military-card hover:shadow-xl transition-all duration-300 ${className}`}>
      <div className="relative">
        {tournament.banner && (
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <img 
              src={tournament.banner} 
              alt={tournament.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            
            {/* Badges */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              {tournament.featured && (
                <div className="bg-victory-gold text-black px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1 rtl:space-x-reverse">
                  <Crown size={16} />
                  <span>مميزة</span>
                </div>
              )}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tournament.status)}`}>
                {getStatusText(tournament.status)}
              </div>
            </div>
            
            {/* Title Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl font-bold text-white mb-2">{tournament.name}</h2>
              <p className="text-gray-200 text-sm line-clamp-2">{tournament.description}</p>
            </div>
          </div>
        )}
        
        <div className="p-6">
          {/* Tournament Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <Trophy className="w-8 h-8 mx-auto text-victory-gold mb-2" />
              <div className="text-lg font-bold text-foreground">
                {formatNumber(tournament.prizePool, 'ar')} {tournament.currency}
              </div>
              <div className="text-sm text-muted-foreground">جائزة إجمالية</div>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <Users className="w-8 h-8 mx-auto text-command-blue mb-2" />
              <div className="text-lg font-bold text-foreground">
                {tournament.currentParticipants}/{tournament.maxParticipants}
              </div>
              <div className="text-sm text-muted-foreground">مشارك</div>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <Calendar className="w-8 h-8 mx-auto text-tactical-green mb-2" />
              <div className="text-lg font-bold text-foreground">
                {formatDate(new Date(tournament.startDate), 'ar', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-sm text-muted-foreground">تاريخ البداية</div>
            </div>
            
            <div className="text-center p-3 bg-muted rounded-lg">
              <Target className="w-8 h-8 mx-auto text-orange-500 mb-2" />
              <div className="text-lg font-bold text-foreground">{getTypeText(tournament.type)}</div>
              <div className="text-sm text-muted-foreground">نوع البطولة</div>
            </div>
          </div>
          
          {/* Tournament Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3">تفاصيل البطولة</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">النوع:</span>
                  <span className="font-medium text-foreground">{tournament.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المستوى:</span>
                  <span className={`font-medium px-2 py-1 rounded-full text-xs ${getDifficultyColor(tournament.difficulty)}`}>
                    {getDifficultyText(tournament.difficulty)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رسوم الدخول:</span>
                  <span className="font-medium text-foreground">
                    {tournament.entryFee > 0 ? `${tournament.entryFee} ${tournament.currency}` : 'مجاناً'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المنطقة:</span>
                  <span className="font-medium text-foreground">{tournament.region}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-3">الجوائز</h4>
              <div className="space-y-2">
                {tournament.prizes.slice(0, 3).map((prize, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      {index === 0 && <Crown className="text-victory-gold" size={16} />}
                      {index === 1 && <Medal className="text-neutral-silver" size={16} />}
                      {index === 2 && <Medal className="text-amber-600" size={16} />}
                      <span className="text-sm text-foreground">{prize.title}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {formatNumber(prize.amount, 'ar')} {tournament.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Progress and Timer */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">التسجيل</span>
              <span className="text-sm text-muted-foreground">
                {tournament.currentParticipants}/{tournament.maxParticipants} مشارك
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 mb-3">
              <div 
                className="bg-tactical-green h-3 rounded-full transition-all duration-300"
                style={{ width: `${getParticipationPercentage()}%` }}
              ></div>
            </div>
            
            {tournament.status === 'upcoming' && getTimeUntilStart() && (
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
                <Clock size={16} />
                <span>البداية {getTimeUntilStart()}</span>
              </div>
            )}
          </div>
          
          {/* Organizer */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <img 
                src={tournament.organizer.avatar} 
                alt={tournament.organizer.displayName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <span className="font-medium text-foreground">{tournament.organizer.displayName}</span>
                  {tournament.organizer.verified && (
                    <CheckCircle size={16} className="text-tactical-green" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">منظم البطولة</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
              <Eye size={16} />
              <span>{formatNumber(tournament.stats.totalViews, 'ar')} مشاهدة</span>
            </div>
          </div>
          
          {/* Tags */}
          {tournament.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {tournament.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => onView?.(tournament.id)}
                  className="btn btn-outline"
                >
                  <Eye size={16} />
                  <span>عرض التفاصيل</span>
                </button>
                
                {tournament.streamUrl && (
                  <button className="btn btn-outline">
                    <Play size={16} />
                    <span>المشاهدة المباشرة</span>
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                {tournament.canRegister && !tournament.isRegistered && (
                  <button
                    onClick={() => onJoin?.(tournament.id)}
                    className="btn btn-primary"
                  >
                    <Trophy size={16} />
                    <span>الانضمام للبطولة</span>
                  </button>
                )}
                
                {tournament.isRegistered && (
                  <button className="btn btn-outline text-tactical-green border-tactical-green">
                    <CheckCircle size={16} />
                    <span>مسجل</span>
                  </button>
                )}
                
                <button
                  onClick={() => onShare?.(tournament.id)}
                  className="btn btn-outline"
                >
                  مشاركة
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentCard; 