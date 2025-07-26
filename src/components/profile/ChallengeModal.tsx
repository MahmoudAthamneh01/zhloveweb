import React, { useState, useEffect } from 'react';
import { X, Sword, Calendar, Clock, Trophy, Star } from 'lucide-react';

interface User {
  id: number;
  username: string;
  avatar?: string;
  level?: number;
  rank?: string;
}

const ChallengeModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [challengeType, setChallengeType] = useState<'1v1' | 'clan_war'>('1v1');
  const [gameMode, setGameMode] = useState<string>('classic');
  const [map, setMap] = useState<string>('random');
  const [wager, setWager] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const gameModes = [
    { id: 'classic', name: 'كلاسيكي', icon: '🎮' },
    { id: 'tournament', name: 'بطولة', icon: '🏆' },
    { id: 'ranked', name: 'مرتب', icon: '⭐' },
    { id: 'custom', name: 'مخصص', icon: '⚙️' }
  ];

  const maps = [
    { id: 'random', name: 'عشوائي' },
    { id: 'desert_fury', name: 'صحراء الغضب' },
    { id: 'winter_wolf', name: 'ذئب الشتاء' },
    { id: 'tournament_desert', name: 'صحراء البطولة' },
    { id: 'green_pastures', name: 'المراعي الخضراء' },
    { id: 'scorched_earth', name: 'الأرض المحروقة' }
  ];

  useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      setTargetUser(event.detail.user);
      setIsOpen(true);
    };

    window.addEventListener('openChallengeModal', handleOpenModal as EventListener);
    
    return () => {
      window.removeEventListener('openChallengeModal', handleOpenModal as EventListener);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;

    setLoading(true);
    
    try {
      const token = localStorage.getItem('zh_love_token');
      const response = await fetch('http://localhost:8080/api/challenges/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          challengedUserId: targetUser.id,
          type: challengeType,
          gameMode,
          map,
          wager,
          message
        })
      });

      if (response.ok) {
        // Also send a message notification
        await fetch('http://localhost:8080/api/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipient: targetUser.username,
            subject: `تحدي جديد ${challengeType === '1v1' ? '1v1' : 'حرب عشائر'}`,
            message: `لقد تم إرسال تحدي إليك!\n\nنوع التحدي: ${challengeType === '1v1' ? '1v1' : 'حرب عشائر'}\nنمط اللعب: ${gameModes.find(m => m.id === gameMode)?.name}\nالخريطة: ${maps.find(m => m.id === map)?.name}\nالرهان: ${wager} نقطة\n\nالرسالة: ${message}\n\nيمكنك قبول أو رفض التحدي من خلال صفحة التحديات.`
          })
        });

        alert('تم إرسال التحدي بنجاح!');
        handleClose();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'حدث خطأ أثناء إرسال التحدي');
      }
    } catch (error) {
      console.error('Error sending challenge:', error);
      alert('حدث خطأ أثناء إرسال التحدي');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTargetUser(null);
    setChallengeType('1v1');
    setGameMode('classic');
    setMap('random');
    setWager(0);
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Sword className="w-6 h-6 text-red-400" />
            <h2 className="text-xl font-bold text-white">إرسال تحدي</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Target User */}
          {targetUser && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">تحدي اللاعب:</h3>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
                  {targetUser.avatar ? (
                    <img src={targetUser.avatar} alt={targetUser.username} className="w-10 h-10 rounded-full" />
                  ) : (
                    <span className="text-white font-bold">{targetUser.username[0]}</span>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{targetUser.username}</p>
                  <p className="text-gray-400 text-sm">المستوى {targetUser.level || 1} - {targetUser.rank || 'مبتدئ'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Challenge Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">نوع التحدي</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setChallengeType('1v1')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  challengeType === '1v1'
                    ? 'border-green-500 bg-green-900/20 text-green-300'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <Trophy className="w-8 h-8 mx-auto mb-2" />
                  <h4 className="font-medium">1v1</h4>
                  <p className="text-xs opacity-75">مباراة فردية</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setChallengeType('clan_war')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  challengeType === 'clan_war'
                    ? 'border-green-500 bg-green-900/20 text-green-300'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                }`}
              >
                <div className="text-center">
                  <Star className="w-8 h-8 mx-auto mb-2" />
                  <h4 className="font-medium">حرب عشائر</h4>
                  <p className="text-xs opacity-75">تحدي جماعي</p>
                </div>
              </button>
            </div>
          </div>

          {/* Game Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">نمط اللعب</label>
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {gameModes.map(mode => (
                <option key={mode.id} value={mode.id}>
                  {mode.icon} {mode.name}
                </option>
              ))}
            </select>
          </div>

          {/* Map Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">الخريطة</label>
            <select
              value={map}
              onChange={(e) => setMap(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {maps.map(mapOption => (
                <option key={mapOption.id} value={mapOption.id}>
                  {mapOption.name}
                </option>
              ))}
            </select>
          </div>

          {/* Wager */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">الرهان (نقاط)</label>
            <input
              type="number"
              value={wager}
              onChange={(e) => setWager(parseInt(e.target.value) || 0)}
              min="0"
              max="1000"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
            />
            <p className="text-xs text-gray-400 mt-1">النقاط التي سيحصل عليها الفائز</p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">رسالة التحدي</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="اكتب رسالة تحدي (اختياري)..."
            />
          </div>

          {/* Challenge Preview */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">معاينة التحدي:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">النوع:</span>
                <span className="text-white">{challengeType === '1v1' ? 'مباراة 1v1' : 'حرب عشائر'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">النمط:</span>
                <span className="text-white">{gameModes.find(m => m.id === gameMode)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">الخريطة:</span>
                <span className="text-white">{maps.find(m => m.id === map)?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">الرهان:</span>
                <span className="text-white">{wager} نقطة</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 rtl:space-x-reverse">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 rtl:space-x-reverse"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <Sword className="w-4 h-4" />
                  <span>إرسال التحدي</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeModal; 