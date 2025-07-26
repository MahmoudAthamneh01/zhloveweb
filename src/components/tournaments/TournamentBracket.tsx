import React, { useState, useEffect } from 'react';
import { Trophy, Users, Calendar, Clock, Play, CheckCircle, XCircle } from 'lucide-react';

interface Match {
  id: number;
  round: number;
  position: number;
  player1: {
    id: number;
    name: string;
    avatar?: string;
    seed?: number;
  } | null;
  player2: {
    id: number;
    name: string;
    avatar?: string;
    seed?: number;
  } | null;
  winner?: number;
  score1?: number;
  score2?: number;
  status: 'pending' | 'live' | 'completed' | 'walkover';
  scheduledTime?: string;
  completedTime?: string;
}

interface TournamentBracketProps {}

const TournamentBracket: React.FC<TournamentBracketProps> = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournamentId, setTournamentId] = useState<string>('');
  const [format, setFormat] = useState<string>('single_elimination');
  const [rounds, setRounds] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  useEffect(() => {
    const handleLoadBracket = (event: CustomEvent) => {
      setTournamentId(event.detail.tournamentId);
      loadBracket(event.detail.tournamentId);
    };

    window.addEventListener('loadTournamentBracket', handleLoadBracket as EventListener);
    
    return () => {
      window.removeEventListener('loadTournamentBracket', handleLoadBracket as EventListener);
    };
  }, []);

  const loadBracket = async (id: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch(`http://localhost:8080/api/tournaments/${id}/bracket`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
        setFormat(data.format || 'single_elimination');
        setRounds(data.rounds || 0);
      }
    } catch (error) {
      console.error('Error loading bracket:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchesByRound = (round: number) => {
    return matches.filter(match => match.round === round);
  };

  const getMatchStatus = (match: Match) => {
    switch (match.status) {
      case 'live':
        return { color: 'text-red-400', icon: <Play className="w-4 h-4" />, label: 'جاري' };
      case 'completed':
        return { color: 'text-green-400', icon: <CheckCircle className="w-4 h-4" />, label: 'منتهي' };
      case 'walkover':
        return { color: 'text-yellow-400', icon: <XCircle className="w-4 h-4" />, label: 'انسحاب' };
      default:
        return { color: 'text-gray-400', icon: <Clock className="w-4 h-4" />, label: 'معلق' };
    }
  };

  const getRoundName = (round: number) => {
    if (format === 'single_elimination') {
      const totalRounds = rounds;
      const roundsFromEnd = totalRounds - round + 1;
      
      if (roundsFromEnd === 1) return 'النهائي';
      if (roundsFromEnd === 2) return 'نصف النهائي';
      if (roundsFromEnd === 3) return 'ربع النهائي';
      if (roundsFromEnd === 4) return 'ثمن النهائي';
      return `الجولة ${round}`;
    }
    return `الجولة ${round}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-400">جاري تحميل البراكت...</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">البراكت غير متاح</h3>
        <p className="text-gray-400 mb-4">لم يتم إنشاء البراكت بعد</p>
        <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
          إنشاء البراكت
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bracket Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">البراكت</h2>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <span className="text-gray-400">
              {format === 'single_elimination' ? 'إقصاء مباشر' : 'إقصاء مزدوج'}
            </span>
            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
              {rounds} جولات
            </span>
          </div>
        </div>
      </div>

      {/* Bracket View */}
      <div className="bg-card border border-border rounded-lg p-6 overflow-x-auto">
        <div className="min-w-full">
          <div className="flex space-x-8 rtl:space-x-reverse">
            {Array.from({ length: rounds }, (_, roundIndex) => {
              const round = roundIndex + 1;
              const roundMatches = getMatchesByRound(round);
              
              return (
                <div key={round} className="flex-shrink-0 w-64">
                  {/* Round Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {getRoundName(round)}
                    </h3>
                    <div className="text-sm text-gray-400">
                      {roundMatches.length} مباراة
                    </div>
                  </div>

                  {/* Round Matches */}
                  <div className="space-y-4">
                    {roundMatches.map((match, index) => (
                      <div
                        key={match.id}
                        className={`bg-gray-800 rounded-lg border transition-all cursor-pointer hover:shadow-lg ${
                          match.status === 'live' 
                            ? 'border-red-500/50 shadow-red-500/20' 
                            : match.status === 'completed' 
                              ? 'border-green-500/50' 
                              : 'border-gray-700 hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedMatch(match)}
                        style={{
                          animation: `fade-in-up 0.6s ease-out ${index * 0.1}s forwards`,
                          opacity: 0
                        }}
                      >
                        {/* Match Header */}
                        <div className="p-3 border-b border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              مباراة {match.position}
                            </span>
                            <div className={`flex items-center space-x-1 rtl:space-x-reverse ${getMatchStatus(match).color}`}>
                              {getMatchStatus(match).icon}
                              <span className="text-xs">
                                {getMatchStatus(match).label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Players */}
                        <div className="p-3 space-y-2">
                          {/* Player 1 */}
                          <div className={`flex items-center justify-between p-2 rounded ${
                            match.winner === match.player1?.id ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-700/50'
                          }`}>
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                                {match.player1?.avatar ? (
                                  <img src={match.player1.avatar} alt={match.player1.name} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <span className="text-white text-sm font-bold">
                                    {match.player1?.name?.[0] || '?'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-medium truncate">
                                  {match.player1?.name || 'TBD'}
                                </div>
                                {match.player1?.seed && (
                                  <div className="text-xs text-gray-400">
                                    #{match.player1.seed}
                                  </div>
                                )}
                              </div>
                            </div>
                            {match.status === 'completed' && (
                              <div className="text-white font-bold">
                                {match.score1 || 0}
                              </div>
                            )}
                          </div>

                          {/* VS */}
                          <div className="text-center text-xs text-gray-400">
                            VS
                          </div>

                          {/* Player 2 */}
                          <div className={`flex items-center justify-between p-2 rounded ${
                            match.winner === match.player2?.id ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-700/50'
                          }`}>
                            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
                                {match.player2?.avatar ? (
                                  <img src={match.player2.avatar} alt={match.player2.name} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <span className="text-white text-sm font-bold">
                                    {match.player2?.name?.[0] || '?'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-sm font-medium truncate">
                                  {match.player2?.name || 'TBD'}
                                </div>
                                {match.player2?.seed && (
                                  <div className="text-xs text-gray-400">
                                    #{match.player2.seed}
                                  </div>
                                )}
                              </div>
                            </div>
                            {match.status === 'completed' && (
                              <div className="text-white font-bold">
                                {match.score2 || 0}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Match Footer */}
                        {(match.scheduledTime || match.completedTime) && (
                          <div className="p-3 border-t border-gray-700">
                            <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-xs text-gray-400">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {match.status === 'completed' && match.completedTime
                                  ? `انتهت: ${formatDate(match.completedTime)}`
                                  : match.scheduledTime
                                    ? `موعد: ${formatDate(match.scheduledTime)}`
                                    : 'غير محدد'
                                }
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  تفاصيل المباراة
                </h3>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Match Status */}
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg ${
                    selectedMatch.status === 'live' ? 'bg-red-900/20 text-red-400' :
                    selectedMatch.status === 'completed' ? 'bg-green-900/20 text-green-400' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {getMatchStatus(selectedMatch).icon}
                    <span className="font-medium">
                      {getMatchStatus(selectedMatch).label}
                    </span>
                  </div>
                </div>

                {/* Players */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`bg-gray-800 rounded-lg p-4 ${
                    selectedMatch.winner === selectedMatch.player1?.id ? 'ring-2 ring-green-500' : ''
                  }`}>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        {selectedMatch.player1?.avatar ? (
                          <img src={selectedMatch.player1.avatar} alt={selectedMatch.player1.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <span className="text-white text-xl font-bold">
                            {selectedMatch.player1?.name?.[0] || '?'}
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {selectedMatch.player1?.name || 'في انتظار المشارك'}
                      </h4>
                      {selectedMatch.player1?.seed && (
                        <div className="text-sm text-gray-400">
                          ترتيب: #{selectedMatch.player1.seed}
                        </div>
                      )}
                      {selectedMatch.status === 'completed' && (
                        <div className="text-2xl font-bold text-white mt-2">
                          {selectedMatch.score1 || 0}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`bg-gray-800 rounded-lg p-4 ${
                    selectedMatch.winner === selectedMatch.player2?.id ? 'ring-2 ring-green-500' : ''
                  }`}>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        {selectedMatch.player2?.avatar ? (
                          <img src={selectedMatch.player2.avatar} alt={selectedMatch.player2.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <span className="text-white text-xl font-bold">
                            {selectedMatch.player2?.name?.[0] || '?'}
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {selectedMatch.player2?.name || 'في انتظار المشارك'}
                      </h4>
                      {selectedMatch.player2?.seed && (
                        <div className="text-sm text-gray-400">
                          ترتيب: #{selectedMatch.player2.seed}
                        </div>
                      )}
                      {selectedMatch.status === 'completed' && (
                        <div className="text-2xl font-bold text-white mt-2">
                          {selectedMatch.score2 || 0}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Info */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">الجولة:</span>
                      <span className="text-white mr-2 rtl:mr-0 rtl:ml-2">
                        {getRoundName(selectedMatch.round)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">رقم المباراة:</span>
                      <span className="text-white mr-2 rtl:mr-0 rtl:ml-2">
                        {selectedMatch.position}
                      </span>
                    </div>
                    {selectedMatch.scheduledTime && (
                      <div>
                        <span className="text-gray-400">الموعد:</span>
                        <span className="text-white mr-2 rtl:mr-0 rtl:ml-2">
                          {formatDate(selectedMatch.scheduledTime)}
                        </span>
                      </div>
                    )}
                    {selectedMatch.completedTime && (
                      <div>
                        <span className="text-gray-400">انتهت:</span>
                        <span className="text-white mr-2 rtl:mr-0 rtl:ml-2">
                          {formatDate(selectedMatch.completedTime)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center space-x-4 rtl:space-x-reverse">
                  {selectedMatch.status === 'live' && (
                    <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                      مشاهدة مباشرة
                    </button>
                  )}
                  {selectedMatch.status === 'completed' && (
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      عرض التفاصيل
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedMatch(null)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentBracket; 