import React, { useState } from 'react';
import { Crown, Shield, Users, UserPlus, UserMinus, Search, Filter, MoreVertical, Star, Trophy, Calendar, MessageCircle } from 'lucide-react';
import { formatDate, formatNumber } from '../../utils/i18n';

interface ClanMembersProps {
  members: ClanMember[];
  currentUserRole: 'leader' | 'officer' | 'member' | 'none';
  currentUserId: number;
  onPromote?: (memberId: number) => void;
  onDemote?: (memberId: number) => void;
  onKick?: (memberId: number) => void;
  onInvite?: () => void;
  onMessage?: (memberId: number) => void;
  className?: string;
}

interface ClanMember {
  id: number;
  username: string;
  avatar?: string;
  role: 'leader' | 'officer' | 'member';
  level: number;
  rank: string;
  isOnline: boolean;
  joinedAt: string;
  lastActive: string;
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
    trophies: number;
    contributions: number;
  };
  permissions: {
    canInvite: boolean;
    canKick: boolean;
    canPromote: boolean;
    canManageWars: boolean;
  };
  country?: string;
  verified: boolean;
}

const ClanMembers: React.FC<ClanMembersProps> = ({
  members,
  currentUserRole,
  currentUserId,
  onPromote,
  onDemote,
  onKick,
  onInvite,
  onMessage,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'leader' | 'officer' | 'member'>('all');
  const [sortBy, setSortBy] = useState<'role' | 'level' | 'joinedAt' | 'lastActive' | 'contributions'>('role');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showInactive, setShowInactive] = useState(false);

  const canManageMembers = currentUserRole === 'leader' || currentUserRole === 'officer';
  const isLeader = currentUserRole === 'leader';

  // Filter members
  const filteredMembers = members.filter(member => {
    const matchesSearch = !searchTerm || 
      member.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    const isActive = showInactive || 
      new Date().getTime() - new Date(member.lastActive).getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days
    
    return matchesSearch && matchesRole && isActive;
  });

  // Sort members
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'role':
        const roleOrder = { leader: 3, officer: 2, member: 1 };
        aValue = roleOrder[a.role];
        bValue = roleOrder[b.role];
        break;
      case 'level':
        aValue = a.level;
        bValue = b.level;
        break;
      case 'joinedAt':
        aValue = new Date(a.joinedAt).getTime();
        bValue = new Date(b.joinedAt).getTime();
        break;
      case 'lastActive':
        aValue = new Date(a.lastActive).getTime();
        bValue = new Date(b.lastActive).getTime();
        break;
      case 'contributions':
        aValue = a.stats.contributions;
        bValue = b.stats.contributions;
        break;
      default:
        return 0;
    }
    
    const multiplier = sortOrder === 'desc' ? -1 : 1;
    return (aValue - bValue) * multiplier;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader':
        return <Crown size={16} className="text-victory-gold" />;
      case 'officer':
        return <Shield size={16} className="text-command-blue" />;
      case 'member':
        return <Users size={16} className="text-tactical-green" />;
      default:
        return null;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'leader':
        return 'قائد';
      case 'officer':
        return 'ضابط';
      case 'member':
        return 'عضو';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'leader':
        return 'text-victory-gold bg-victory-gold/20';
      case 'officer':
        return 'text-command-blue bg-command-blue/20';
      case 'member':
        return 'text-tactical-green bg-tactical-green/20';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const canPromoteMember = (member: ClanMember) => {
    if (!canManageMembers) return false;
    if (member.id === currentUserId) return false;
    if (member.role === 'leader') return false;
    if (member.role === 'officer' && currentUserRole !== 'leader') return false;
    return true;
  };

  const canDemoteMember = (member: ClanMember) => {
    if (!canManageMembers) return false;
    if (member.id === currentUserId) return false;
    if (member.role === 'leader') return false;
    if (member.role === 'officer' && currentUserRole !== 'leader') return false;
    return member.role !== 'member';
  };

  const canKickMember = (member: ClanMember) => {
    if (!canManageMembers) return false;
    if (member.id === currentUserId) return false;
    if (member.role === 'leader') return false;
    if (member.role === 'officer' && currentUserRole !== 'leader') return false;
    return true;
  };

  const MemberCard: React.FC<{ member: ClanMember }> = ({ member }) => {
    const [showActions, setShowActions] = useState(false);
    
    const handlePromote = () => {
      onPromote?.(member.id);
      setShowActions(false);
    };

    const handleDemote = () => {
      onDemote?.(member.id);
      setShowActions(false);
    };

    const handleKick = () => {
      if (window.confirm(`هل أنت متأكد من طرد ${member.username} من العشيرة؟`)) {
        onKick?.(member.id);
      }
      setShowActions(false);
    };

    const handleMessage = () => {
      onMessage?.(member.id);
      setShowActions(false);
    };

    return (
      <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          {/* Member Info */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Avatar */}
            <div className="relative">
              <img 
                src={member.avatar || '/default-avatar.png'} 
                alt={member.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-border"
              />
              {member.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-tactical-green rounded-full border-2 border-background"></div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <h3 className="font-semibold text-foreground truncate">
                  {member.username}
                </h3>
                {member.verified && (
                  <div className="text-tactical-green">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                )}
                {member.country && (
                  <span className="text-xs text-muted-foreground">
                    {member.country}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm">
                <div className="flex items-center space-x-1 rtl:space-x-reverse">
                  {getRoleIcon(member.role)}
                  <span className="font-medium">{getRoleText(member.role)}</span>
                </div>
                <span className="text-muted-foreground">
                  Level {member.level}
                </span>
                <span className="text-muted-foreground">
                  {member.rank}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {/* Role Badge */}
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(member.role)}`}>
              {getRoleText(member.role)}
            </span>

            {/* Action Menu */}
            {canManageMembers && member.id !== currentUserId && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 hover:bg-accent rounded-full transition-colors"
                >
                  <MoreVertical size={16} />
                </button>

                {showActions && (
                  <div className="absolute right-0 rtl:left-0 mt-2 w-40 bg-popover border border-border rounded-lg shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={handleMessage}
                        className="w-full px-3 py-2 text-left rtl:text-right hover:bg-accent transition-colors flex items-center space-x-2 rtl:space-x-reverse text-sm"
                      >
                        <MessageCircle size={14} />
                        <span>إرسال رسالة</span>
                      </button>

                      {canPromoteMember(member) && member.role === 'member' && (
                        <button
                          onClick={handlePromote}
                          className="w-full px-3 py-2 text-left rtl:text-right hover:bg-accent transition-colors flex items-center space-x-2 rtl:space-x-reverse text-sm"
                        >
                          <Shield size={14} />
                          <span>ترقية لضابط</span>
                        </button>
                      )}

                      {canPromoteMember(member) && member.role === 'officer' && isLeader && (
                        <button
                          onClick={handlePromote}
                          className="w-full px-3 py-2 text-left rtl:text-right hover:bg-accent transition-colors flex items-center space-x-2 rtl:space-x-reverse text-sm"
                        >
                          <Crown size={14} />
                          <span>نقل القيادة</span>
                        </button>
                      )}

                      {canDemoteMember(member) && (
                        <button
                          onClick={handleDemote}
                          className="w-full px-3 py-2 text-left rtl:text-right hover:bg-accent transition-colors flex items-center space-x-2 rtl:space-x-reverse text-sm"
                        >
                          <UserMinus size={14} />
                          <span>تخفيض الرتبة</span>
                        </button>
                      )}

                      {canKickMember(member) && (
                        <button
                          onClick={handleKick}
                          className="w-full px-3 py-2 text-left rtl:text-right hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center space-x-2 rtl:space-x-reverse text-sm"
                        >
                          <UserMinus size={14} />
                          <span>طرد من العشيرة</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Member Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 p-3 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-sm font-bold text-foreground">{member.stats.winRate}%</div>
            <div className="text-xs text-muted-foreground">معدل الفوز</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-foreground">{formatNumber(member.stats.trophies, 'ar')}</div>
            <div className="text-xs text-muted-foreground">كؤوس</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-foreground">{formatNumber(member.stats.contributions, 'ar')}</div>
            <div className="text-xs text-muted-foreground">مساهمات</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-foreground">
              {formatDate(new Date(member.joinedAt), 'ar', { month: 'short', year: '2-digit' })}
            </div>
            <div className="text-xs text-muted-foreground">انضم في</div>
          </div>
        </div>

        {/* Last Active */}
        <div className="mt-3 text-xs text-muted-foreground">
          آخر نشاط: {formatDate(new Date(member.lastActive), 'ar', { 
            day: 'numeric', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
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
            <span>أعضاء العشيرة</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredMembers.length} من {members.length} عضو
          </p>
        </div>
        
        {canManageMembers && onInvite && (
          <button onClick={onInvite} className="btn btn-primary flex items-center space-x-2 rtl:space-x-reverse">
            <UserPlus size={16} />
            <span>دعوة عضو</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="البحث عن عضو..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Filter size={16} className="text-muted-foreground" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="bg-input border border-border rounded px-2 py-1 text-sm"
            >
              <option value="all">جميع الأدوار</option>
              <option value="leader">قائد</option>
              <option value="officer">ضابط</option>
              <option value="member">عضو</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="text-sm text-muted-foreground">ترتيب حسب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-input border border-border rounded px-2 py-1 text-sm"
            >
              <option value="role">الدور</option>
              <option value="level">المستوى</option>
              <option value="joinedAt">تاريخ الانضمام</option>
              <option value="lastActive">آخر نشاط</option>
              <option value="contributions">المساهمات</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="bg-input border border-border rounded px-2 py-1 text-sm"
            >
              <option value="desc">تنازلي</option>
              <option value="asc">تصاعدي</option>
            </select>
          </div>

          <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-border"
            />
            <span>إظهار غير النشطين</span>
          </label>
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-4">
        {sortedMembers.length > 0 ? (
          sortedMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد أعضاء'}
            </p>
          </div>
        )}
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="military-card p-4 text-center">
          <div className="text-2xl font-bold text-victory-gold mb-1">
            {members.filter(m => m.role === 'leader').length}
          </div>
          <div className="text-sm text-muted-foreground">قادة</div>
        </div>
        <div className="military-card p-4 text-center">
          <div className="text-2xl font-bold text-command-blue mb-1">
            {members.filter(m => m.role === 'officer').length}
          </div>
          <div className="text-sm text-muted-foreground">ضباط</div>
        </div>
        <div className="military-card p-4 text-center">
          <div className="text-2xl font-bold text-tactical-green mb-1">
            {members.filter(m => m.role === 'member').length}
          </div>
          <div className="text-sm text-muted-foreground">أعضاء</div>
        </div>
      </div>
    </div>
  );
};

export default ClanMembers; 