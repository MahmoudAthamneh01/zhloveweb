import React, { useState } from 'react';
import { Calendar, Users, Trophy, Crown, Star, Eye, MapPin, Clock, DollarSign } from 'lucide-react';

interface Tournament {
  id: number;
  name: string;
  description: string;
  image?: string;
  status: 'upcoming' | 'open' | 'live' | 'completed' | 'cancelled';
  format: string;
  gameMode: string;
  participants: number;
  maxParticipants: number;
  prizePool: number;
  entryFee: number;
  startDate: string;
  registrationDeadline: string;
  region: string;
  organizerName: string;
  organizerAvatar?: string;
  isPrivate: boolean;
  isFeatured?: boolean;
  isParticipant?: boolean;
  views?: number;
  createdAt: string;
}

interface EnhancedTournamentCardProps {
  tournament: Tournament;
  onJoin?: (tournamentId: number) => void;
  onView?: (tournamentId: number) => void;
  onWatch?: (tournamentId: number) => void;
  className?: string;
}

const EnhancedTournamentCard: React.FC<EnhancedTournamentCardProps> = ({
  tournament,
  onJoin,
  onView,
  onWatch,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-600 text-white';
      case 'live': return 'bg-red-600 text-white animate-pulse';
      case 'completed': return 'bg-gray-600 text-white';
      case 'upcoming': return 'bg-blue-600 text-white';
      case 'cancelled': return 'bg-red-800 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'مفتوح للتسجيل';
      case 'live': return 'جاري الآن';
      case 'completed': return 'منتهية';
      case 'upcoming': return 'قريباً';
      case 'cancelled': return 'ملغية';
      default: return 'غير محدد';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrize = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount}`;
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const startDate = new Date(tournament.startDate);
    const regDeadline = new Date(tournament.registrationDeadline);
    
    if (tournament.status === 'open') {
      const timeLeft = regDeadline.getTime() - now.getTime();
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) return `${days} يوم متبقي`;
      if (hours > 0) return `${hours} ساعة متبقية`;
      return 'ينتهي قريباً';
    }
    
    if (tournament.status === 'upcoming') {
      const timeLeft = startDate.getTime() - now.getTime();
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      
      if (days > 0) return `تبدأ خلال ${days} يوم`;
      return 'تبدأ قريباً';
    }
    
    return '';
  };

  const getParticipantProgress = () => {
    return (tournament.participants / tournament.maxParticipants) * 100;
  };

  const isNearlyFull = () => {
    return getParticipantProgress() >= 80;
  };

  const isNew = () => {
    const now = new Date();
    const created = new Date(tournament.createdAt);
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  return (
    <div className={`group relative ${className}`}>
      {/* Featured Tournament Glow Effect */}
      {tournament.isFeatured && (
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-300 animate-pulse"></div>
      )}
      
      <div className={`relative bg-card border rounded-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl ${
        tournament.isFeatured 
          ? 'border-yellow-500/50 hover:shadow-yellow-500/20' 
          : 'border-border hover:shadow-green-500/10'
      }`}>
        
        {/* Tournament Image/Header */}
        <div className="relative h-48 bg-gradient-to-r from-gray-800 to-gray-900 overflow-hidden">
          {tournament.image && !imageError ? (
            <img 
              src={tournament.image} 
              alt={tournament.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
              tournament.isFeatured 
                ? 'from-yellow-600 to-yellow-800' 
                : 'from-green-600 to-green-800'
            }`}>
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {tournament.isFeatured ? '👑' : '🏆'}
                </div>
                <div className="text-white font-bold text-lg">{tournament.name}</div>
              </div>
            </div>
          )}
          
          {/* Overlay Elements */}
          <div className="absolute inset-0 bg-black bg-opacity-20">
            {/* Featured Badge */}
            {tournament.isFeatured && (
              <div className="absolute top-4 left-4 flex items-center space-x-1 rtl:space-x-reverse bg-yellow-600 px-3 py-1 rounded-full">
                <Crown className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-bold">مميزة</span>
              </div>
            )}

            {/* New Badge */}
            {isNew() && !tournament.isFeatured && (
              <div className="absolute top-4 left-4 bg-green-600 px-3 py-1 rounded-full">
                <span className="text-white text-xs font-bold">جديدة</span>
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(tournament.status)}`}>
                {getStatusText(tournament.status)}
              </span>
            </div>
            
            {/* Live Indicator */}
            {tournament.status === 'live' && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 rtl:space-x-reverse bg-red-600 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-bold">LIVE</span>
              </div>
            )}
            
            {/* Prize Pool */}
            {tournament.prizePool > 0 && (
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 backdrop-blur-sm px-3 py-1 rounded-full">
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 font-bold text-sm">{formatPrize(tournament.prizePool)}</span>
                </div>
              </div>
            )}

            {/* Entry Fee */}
            {tournament.entryFee > 0 && (
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-xs">رسوم: ${tournament.entryFee}</span>
              </div>
            )}

            {/* Private Tournament Indicator */}
            {tournament.isPrivate && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-600 px-2 py-1 rounded-full">
                <span className="text-white text-xs">خاصة</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Tournament Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-green-400 transition-colors">
                {tournament.name}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-3 mb-3">{tournament.description}</p>
              
              {/* Organizer */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  {tournament.organizerAvatar ? (
                    <img src={tournament.organizerAvatar} alt={tournament.organizerName} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-xs">{tournament.organizerName[0]}</span>
                  )}
                </div>
                <span className="text-gray-400 text-sm">بواسطة {tournament.organizerName}</span>
              </div>
            </div>
          </div>
          
          {/* Tournament Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Users className="w-4 h-4 text-gray-400" />
              <div className="flex-1">
                <span className={`${isNearlyFull() ? 'text-orange-400' : 'text-gray-300'}`}>
                  {tournament.participants}/{tournament.maxParticipants}
                </span>
                <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      isNearlyFull() ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${getParticipantProgress()}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{formatDate(tournament.startDate)}</span>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Trophy className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{tournament.format}</span>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{tournament.region}</span>
            </div>
          </div>

          {/* Time Remaining */}
          {getTimeRemaining() && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4 p-2 bg-blue-900/20 rounded-lg">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">{getTimeRemaining()}</span>
            </div>
          )}

          {/* Views and Stats */}
          {tournament.views && (
            <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Eye className="w-3 h-3" />
                <span>{tournament.views} مشاهدة</span>
              </div>
              <div>
                منذ {formatDate(tournament.createdAt)}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-3 rtl:space-x-reverse">
            <button 
              onClick={() => onView?.(tournament.id)}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 text-sm font-medium transform hover:scale-105"
            >
              عرض التفاصيل
            </button>
            
            {tournament.status === 'open' && !tournament.isParticipant && (
              <button 
                onClick={() => onJoin?.(tournament.id)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 text-sm font-medium transform hover:scale-105"
              >
                {tournament.isPrivate ? 'طلب انضمام' : 'انضمام'}
              </button>
            )}
            
            {tournament.status === 'open' && tournament.isParticipant && (
              <button className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium cursor-not-allowed">
                مشارك
              </button>
            )}
            
            {tournament.status === 'live' && (
              <button 
                onClick={() => onWatch?.(tournament.id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 text-sm font-medium transform hover:scale-105 animate-pulse"
              >
                مشاهدة مباشرة
              </button>
            )}
            
            {tournament.status === 'completed' && (
              <button 
                onClick={() => onView?.(tournament.id)}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 text-sm font-medium transform hover:scale-105"
              >
                عرض النتائج
              </button>
            )}
          </div>
        </div>

        {/* Featured Tournament Shine Effect */}
        {tournament.isFeatured && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTournamentCard; 