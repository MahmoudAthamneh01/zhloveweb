import React, { useState } from 'react';
import { Trophy, Medal, Award, Crown, Users, Search, Filter, ChevronDown } from 'lucide-react';
import { formatDate } from '../../utils/i18n';

interface ParticipantListProps {
  participants: Participant[];
  tournament: Tournament;
  onParticipantClick?: (participant: Participant) => void;
  showStats?: boolean;
  allowSearch?: boolean;
  className?: string;
}

interface Participant {
  id: number;
  username: string;
  avatar?: string;
  seed?: number;
  rank: string;
  level: number;
  isOnline: boolean;
  joinedAt: string;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
  };
  tournamentStats?: {
    position?: number;
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    isEliminated: boolean;
    eliminatedAt?: string;
    prize?: number;
  };
  country?: string;
  verified: boolean;
}

interface Tournament {
  id: number;
  name: string;
  status: 'upcoming' | 'registration' | 'ongoing' | 'completed' | 'cancelled';
  maxParticipants: number;
  currentParticipants: number;
}

const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  tournament,
  onParticipantClick,
  showStats = true,
  allowSearch = true,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'seed' | 'joinedAt' | 'rank' | 'winRate' | 'position'>('seed');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'eliminated'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter participants based on search and filters
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = !searchTerm || 
      participant.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && !participant.tournamentStats?.isEliminated) ||
      (filterStatus === 'eliminated' && participant.tournamentStats?.isEliminated);
    
    return matchesSearch && matchesFilter;
  });

  // Sort participants
  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'seed':
        aValue = a.seed || 999;
        bValue = b.seed || 999;
        break;
      case 'joinedAt':
        aValue = new Date(a.joinedAt).getTime();
        bValue = new Date(b.joinedAt).getTime();
        break;
      case 'rank':
        aValue = a.level;
        bValue = b.level;
        break;
      case 'winRate':
        aValue = a.stats.winRate;
        bValue = b.stats.winRate;
        break;
      case 'position':
        aValue = a.tournamentStats?.position || 999;
        bValue = b.tournamentStats?.position || 999;
        break;
      default:
        aValue = a.id;
        bValue = b.id;
    }
    
    const multiplier = sortOrder === 'desc' ? -1 : 1;
    return (aValue - bValue) * multiplier;
  });

  const getPositionIcon = (position?: number) => {
    if (!position) return null;
    
    switch (position) {
      case 1:
        return <Crown className="text-victory-gold" size={20} />;
      case 2:
        return <Medal className="text-neutral-silver" size={20} />;
      case 3:
        return <Award className="text-bronze" size={20} />;
      default:
        return null;
    }
  };

  const getPositionText = (position?: number) => {
    if (!position) return '';
    
    switch (position) {
      case 1:
        return 'البطل';
      case 2:
        return 'الوصيف';
      case 3:
        return 'المركز الثالث';
      default:
        return `المركز ${position}`;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'legend':
        return 'text-victory-gold';
      case 'master':
        return 'text-command-blue';
      case 'expert':
        return 'text-tactical-green';
      case 'advanced':
        return 'text-neutral-silver';
      case 'intermediate':
        return 'text-bronze';
      default:
        return 'text-muted-foreground';
    }
  };

  const ParticipantCard: React.FC<{ participant: Participant; index: number }> = ({ participant, index }) => {
    const handleClick = () => {
      onParticipantClick?.(participant);
    };

    return (
      <div 
        className={`
          bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer
          ${participant.tournamentStats?.isEliminated ? 'opacity-60' : ''}
        `}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          {/* Participant Info */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Position/Seed */}
            <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full text-sm font-semibold">
              {tournament.status === 'completed' && participant.tournamentStats?.position ? (
                getPositionIcon(participant.tournamentStats.position) || `#${participant.tournamentStats.position}`
              ) : (
                participant.seed || index + 1
              )}
            </div>

            {/* Avatar */}
            <div className="relative">
              <img 
                src={participant.avatar || '/default-avatar.png'} 
                alt={participant.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-border"
              />
              {participant.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-tactical-green rounded-full border-2 border-background"></div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <h3 className="font-semibold text-foreground truncate">
                  {participant.username}
                </h3>
                {participant.verified && (
                  <div className="text-tactical-green">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                )}
                {participant.country && (
                  <span className="text-xs text-muted-foreground">
                    {participant.country}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                <span className={`font-medium ${getRankColor(participant.rank)}`}>
                  {participant.rank}
                </span>
                <span className="text-muted-foreground">
                  Level {participant.level}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          {showStats && (
            <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm">
              {/* Tournament Position */}
              {tournament.status === 'completed' && participant.tournamentStats?.position && (
                <div className="text-center">
                  <div className="font-semibold text-foreground">
                    {getPositionText(participant.tournamentStats.position)}
                  </div>
                  {participant.tournamentStats.prize && (
                    <div className="text-xs text-victory-gold">
                      ${participant.tournamentStats.prize}
                    </div>
                  )}
                </div>
              )}

              {/* Tournament Stats */}
              {tournament.status === 'ongoing' && participant.tournamentStats && (
                <div className="text-center">
                  <div className="font-semibold text-foreground">
                    {participant.tournamentStats.matchesWon}W - {participant.tournamentStats.matchesLost}L
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {participant.tournamentStats.isEliminated ? 'خارج المنافسة' : 'نشط'}
                  </div>
                </div>
              )}

              {/* General Stats */}
              <div className="text-center">
                <div className="font-semibold text-foreground">
                  {participant.stats.winRate}%
                </div>
                <div className="text-xs text-muted-foreground">
                  معدل الفوز
                </div>
              </div>

              <div className="text-center">
                <div className="font-semibold text-foreground">
                  {participant.stats.gamesPlayed}
                </div>
                <div className="text-xs text-muted-foreground">
                  مباراة
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Eliminated Status */}
        {participant.tournamentStats?.isEliminated && participant.tournamentStats.eliminatedAt && (
          <div className="mt-3 p-2 bg-alert-red/10 border border-alert-red/20 rounded-lg">
            <div className="text-sm text-alert-red">
              خرج من المنافسة في {formatDate(new Date(participant.tournamentStats.eliminatedAt), 'ar')}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center space-x-2 rtl:space-x-reverse">
            <Users size={20} />
            <span>المشاركون</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredParticipants.length} من {participants.length} مشارك
          </p>
        </div>
        
        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-outline btn-sm flex items-center space-x-1 rtl:space-x-reverse"
        >
          <Filter size={16} />
          <span>تصفية</span>
          <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Search and Filters */}
      {(allowSearch || showFilters) && (
        <div className={`space-y-4 ${showFilters ? 'block' : 'hidden'}`}>
          {/* Search */}
          {allowSearch && (
            <div className="relative">
              <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="البحث عن مشارك..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {/* Sort and Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <label className="text-sm font-medium text-foreground">ترتيب حسب:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-input border border-border rounded px-2 py-1 text-sm"
              >
                <option value="seed">البذرة</option>
                <option value="joinedAt">تاريخ الانضمام</option>
                <option value="rank">الرتبة</option>
                <option value="winRate">معدل الفوز</option>
                {tournament.status === 'completed' && <option value="position">المركز</option>}
              </select>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <label className="text-sm font-medium text-foreground">الترتيب:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="bg-input border border-border rounded px-2 py-1 text-sm"
              >
                <option value="asc">تصاعدي</option>
                <option value="desc">تنازلي</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <label className="text-sm font-medium text-foreground">الحالة:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-input border border-border rounded px-2 py-1 text-sm"
              >
                <option value="all">الكل</option>
                <option value="active">نشط</option>
                <option value="eliminated">خارج المنافسة</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Participants List */}
      <div className="space-y-3">
        {sortedParticipants.length > 0 ? (
          sortedParticipants.map((participant, index) => (
            <ParticipantCard 
              key={participant.id} 
              participant={participant} 
              index={index}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد مشاركون'}
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {showStats && participants.length > 0 && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold text-foreground mb-3">إحصائيات عامة</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-tactical-green">
                {participants.filter(p => p.isOnline).length}
              </div>
              <div className="text-muted-foreground">متصل الآن</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-victory-gold">
                {participants.filter(p => p.verified).length}
              </div>
              <div className="text-muted-foreground">مؤكد</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-command-blue">
                {Math.round(participants.reduce((sum, p) => sum + p.stats.winRate, 0) / participants.length)}%
              </div>
              <div className="text-muted-foreground">متوسط معدل الفوز</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">
                {participants.reduce((sum, p) => sum + p.stats.gamesPlayed, 0)}
              </div>
              <div className="text-muted-foreground">إجمالي المباريات</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantList; 