import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  Download,
  Share2,
  Star,
  MessageCircle,
  Flag,
  Eye,
  Clock,
  Users,
  Trophy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDuration } from '../../utils/i18n';

interface ReplayViewerProps {
  replay: GameReplay;
  onClose?: () => void;
  onRate?: (rating: number) => void;
  onDownload?: () => void;
  onShare?: () => void;
  onFlag?: () => void;
  onComment?: (comment: string) => void;
  className?: string;
}

interface GameReplay {
  id: number;
  title: string;
  description?: string;
  uploadedAt: string;
  uploadedBy: {
    id: number;
    username: string;
    avatar?: string;
    verified: boolean;
  };
  gameInfo: {
    map: string;
    mode: string;
    duration: number;
    players: Array<{
      id: number;
      username: string;
      faction: 'USA' | 'China' | 'GLA';
      result: 'win' | 'lose' | 'draw';
      score: number;
      isAI?: boolean;
    }>;
  };
  stats: {
    views: number;
    downloads: number;
    rating: number;
    totalRatings: number;
    featured: boolean;
  };
  tags: string[];
  category: string;
  quality: string;
  fileSize: number;
  comments?: Array<{
    id: number;
    user: {
      id: number;
      username: string;
      avatar?: string;
    };
    content: string;
    timestamp: string;
    likes: number;
  }>;
}

const ReplayViewer: React.FC<ReplayViewerProps> = ({
  replay,
  onClose,
  onRate,
  onDownload,
  onShare,
  onFlag,
  onComment,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    
    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const changePlaybackSpeed = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    onRate?.(rating);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onComment?.(newComment);
      setNewComment('');
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
      case 'lose':
        return 'text-alert-red';
      case 'draw':
        return 'text-victory-gold';
      default:
        return 'text-muted-foreground';
    }
  };

  const StarRating = ({ rating, interactive = false }: { rating: number; interactive?: boolean }) => (
    <div className="flex items-center space-x-1 rtl:space-x-reverse">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && handleRating(star)}
          className={`${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          } transition-transform`}
          disabled={!interactive}
        >
          <Star
            size={16}
            className={star <= rating ? 'fill-victory-gold text-victory-gold' : 'text-muted-foreground'}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className={`bg-background ${className}`}>
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        {/* Placeholder for actual video player */}
        <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-bold mb-2">مشغل الريبلاي</h3>
            <p className="text-gray-300">
              سيتم دمج مشغل الريبلاي الفعلي هنا
            </p>
            <div className="mt-4 flex items-center justify-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm">الخريطة: {replay.gameInfo.map}</span>
              <span className="text-sm">•</span>
              <span className="text-sm">المدة: {formatDuration(replay.gameInfo.duration)}</span>
            </div>
          </div>
        </div>

        {/* Video Controls Overlay */}
        <div 
          className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          <button
            onClick={togglePlay}
            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="text-white" size={24} />
            ) : (
              <Play className="text-white" size={24} />
            )}
          </button>
        </div>

        {/* Control Bar */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-white/20 rounded-full h-1">
              <div 
                className="bg-tactical-green h-1 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button onClick={togglePlay} className="text-white hover:text-tactical-green">
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              <button className="text-white hover:text-tactical-green">
                <RotateCcw size={20} />
              </button>
              
              <button className="text-white hover:text-tactical-green">
                <RotateCw size={20} />
              </button>
              
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button onClick={toggleMute} className="text-white hover:text-tactical-green">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <div className="w-20 bg-white/20 rounded-full h-1">
                  <div 
                    className="bg-white h-1 rounded-full"
                    style={{ width: `${volume * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-white text-sm">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </div>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-tactical-green"
                >
                  <Settings size={20} />
                </button>
                
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-3 text-white min-w-[200px]">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">سرعة التشغيل</label>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                          {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => changePlaybackSpeed(speed)}
                              className={`text-xs px-2 py-1 rounded ${
                                playbackSpeed === speed ? 'bg-tactical-green' : 'bg-white/20'
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">الجودة</label>
                        <select className="w-full mt-1 bg-white/20 rounded px-2 py-1 text-sm">
                          <option>HD</option>
                          <option>Standard</option>
                          <option>Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button onClick={toggleFullscreen} className="text-white hover:text-tactical-green">
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-2">{replay.title}</h1>
            {replay.description && (
              <p className="text-muted-foreground mb-3">{replay.description}</p>
            )}
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-muted-foreground">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Eye size={16} />
                <span>{replay.stats.views.toLocaleString()} مشاهدة</span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Clock size={16} />
                <span>{formatDuration(replay.gameInfo.duration)}</span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Users size={16} />
                <span>{replay.gameInfo.players.length} لاعب</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <StarRating rating={userRating} interactive={true} />
            <span className="text-sm text-muted-foreground">
              ({replay.stats.totalRatings} تقييم)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <img 
              src={replay.uploadedBy.avatar || '/default-avatar.png'} 
              alt={replay.uploadedBy.username}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <span className="font-medium text-foreground">{replay.uploadedBy.username}</span>
                {replay.uploadedBy.verified && (
                  <div className="text-tactical-green">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                رفع في {new Date(replay.uploadedAt).toLocaleDateString('ar')}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button onClick={onDownload} className="btn btn-outline btn-sm">
              <Download size={16} />
              <span>تحميل</span>
            </button>
            <button onClick={onShare} className="btn btn-outline btn-sm">
              <Share2 size={16} />
              <span>مشاركة</span>
            </button>
            <button onClick={onFlag} className="btn btn-outline btn-sm text-alert-red">
              <Flag size={16} />
              <span>إبلاغ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Game Details */}
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">تفاصيل المباراة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-foreground mb-2">معلومات عامة</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الخريطة:</span>
                <span className="font-medium">{replay.gameInfo.map}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">نوع المباراة:</span>
                <span className="font-medium">{replay.gameInfo.mode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المدة:</span>
                <span className="font-medium">{formatDuration(replay.gameInfo.duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الجودة:</span>
                <span className="font-medium">{replay.quality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">حجم الملف:</span>
                <span className="font-medium">{replay.fileSize.toFixed(1)} MB</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-foreground mb-2">إحصائيات</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المشاهدات:</span>
                <span className="font-medium">{replay.stats.views.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">التحميلات:</span>
                <span className="font-medium">{replay.stats.downloads.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">التقييم:</span>
                <span className="font-medium">{replay.stats.rating.toFixed(1)}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الفئة:</span>
                <span className="font-medium">{replay.category}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Players */}
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">اللاعبين</h2>
        
        <div className="space-y-3">
          {replay.gameInfo.players.map((player, index) => (
            <div key={player.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="text-2xl">{getFactionIcon(player.faction)}</div>
                <div>
                  <div className="font-medium text-foreground">{player.username}</div>
                  <div className="text-sm text-muted-foreground">{player.faction}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="text-center">
                  <div className="text-sm font-bold text-foreground">{player.score.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">نقاط</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  player.result === 'win' ? 'bg-tactical-green/20 text-tactical-green' :
                  player.result === 'lose' ? 'bg-alert-red/20 text-alert-red' :
                  'bg-victory-gold/20 text-victory-gold'
                }`}>
                  {player.result === 'win' ? 'فوز' : player.result === 'lose' ? 'هزيمة' : 'تعادل'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">التعليقات</h2>
          <button
            onClick={() => setShowComments(!showComments)}
            className="btn btn-outline btn-sm"
          >
            <MessageCircle size={16} />
            <span>{replay.comments?.length || 0} تعليق</span>
          </button>
        </div>
        
        {showComments && (
          <div className="space-y-4">
            {/* Add Comment */}
            <form onSubmit={handleCommentSubmit} className="flex space-x-2 rtl:space-x-reverse">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="أضف تعليقاً..."
                className="flex-1 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="submit" className="btn btn-primary">
                إرسال
              </button>
            </form>
            
            {/* Comments List */}
            <div className="space-y-3">
              {replay.comments?.map((comment) => (
                <div key={comment.id} className="flex space-x-3 rtl:space-x-reverse">
                  <img 
                    src={comment.user.avatar || '/default-avatar.png'} 
                    alt={comment.user.username}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                        <span className="font-medium text-foreground">{comment.user.username}</span>
                        <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm text-foreground">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                      <button className="text-xs text-muted-foreground hover:text-tactical-green">
                        إعجاب ({comment.likes})
                      </button>
                      <button className="text-xs text-muted-foreground hover:text-foreground">
                        رد
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplayViewer; 