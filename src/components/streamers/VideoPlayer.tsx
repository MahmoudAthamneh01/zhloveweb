import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  RotateCcw, 
  RotateCw,
  Download,
  Share2,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Flag,
  Clock,
  Eye,
  Calendar
} from 'lucide-react';
import { formatDuration, formatNumber, formatDate } from '../../utils/i18n';

interface VideoPlayerProps {
  video: StreamerVideo;
  onLike?: (videoId: string) => void;
  onDislike?: (videoId: string) => void;
  onShare?: (videoId: string) => void;
  onDownload?: (videoId: string) => void;
  onFlag?: (videoId: string) => void;
  onComment?: (videoId: string, comment: string) => void;
  autoPlay?: boolean;
  showComments?: boolean;
  className?: string;
}

interface StreamerVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  views: number;
  likes: number;
  dislikes: number;
  publishedAt: string;
  updatedAt: string;
  streamer: {
    id: number;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
    followers: number;
  };
  category: 'tutorial' | 'gameplay' | 'review' | 'news' | 'entertainment';
  tags: string[];
  gameInfo?: {
    map: string;
    faction: string;
    gameMode: string;
    difficulty: string;
  };
  isLive?: boolean;
  quality: Array<{
    label: string;
    value: string;
    url: string;
  }>;
  comments?: Array<{
    id: string;
    user: {
      id: number;
      username: string;
      avatar: string;
    };
    content: string;
    timestamp: string;
    likes: number;
    replies?: Array<{
      id: string;
      user: {
        id: number;
        username: string;
        avatar: string;
      };
      content: string;
      timestamp: string;
    }>;
  }>;
  isLiked?: boolean;
  isDisliked?: boolean;
  isSubscribed?: boolean;
  nextVideo?: {
    id: string;
    title: string;
    thumbnail: string;
    duration: number;
  };
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onLike,
  onDislike,
  onShare,
  onDownload,
  onFlag,
  onComment,
  autoPlay = false,
  showComments = true,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentQuality, setCurrentQuality] = useState(video.quality[0]);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateTime = () => setCurrentTime(videoElement.currentTime);
    const updateDuration = () => setDuration(videoElement.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('loadedmetadata', updateDuration);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    
    return () => {
      videoElement.removeEventListener('timeupdate', updateTime);
      videoElement.removeEventListener('loadedmetadata', updateDuration);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  };

  const handleSeek = (time: number) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    videoElement.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    videoElement.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    if (isMuted) {
      videoElement.volume = volume;
      setIsMuted(false);
    } else {
      videoElement.volume = 0;
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
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    videoElement.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const handleQualityChange = (quality: typeof video.quality[0]) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const currentTime = videoElement.currentTime;
    setCurrentQuality(quality);
    videoElement.src = quality.url;
    videoElement.currentTime = currentTime;
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onComment?.(video.id, newComment);
      setNewComment('');
    }
  };

  const toggleCommentExpanded = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tutorial':
        return 'bg-tactical-green/20 text-tactical-green';
      case 'gameplay':
        return 'bg-command-blue/20 text-command-blue';
      case 'review':
        return 'bg-victory-gold/20 text-victory-gold';
      case 'news':
        return 'bg-purple-500/20 text-purple-500';
      case 'entertainment':
        return 'bg-orange-500/20 text-orange-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'tutorial':
        return 'تعليمي';
      case 'gameplay':
        return 'جيم بلاي';
      case 'review':
        return 'مراجعة';
      case 'news':
        return 'أخبار';
      case 'entertainment':
        return 'ترفيه';
      default:
        return category;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={currentQuality.url}
          poster={video.thumbnail}
          className="w-full aspect-video"
          autoPlay={autoPlay}
          onClick={togglePlay}
        />
        
        {/* Controls Overlay */}
        <div 
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Play/Pause Button */}
          <div className="absolute inset-0 flex items-center justify-center">
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
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-white/20 rounded-full h-1 cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                handleSeek(percent * duration);
              }}>
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
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
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
                          <label className="text-sm font-medium">الجودة</label>
                          <div className="space-y-1 mt-1">
                            {video.quality.map((quality) => (
                              <button
                                key={quality.value}
                                onClick={() => handleQualityChange(quality)}
                                className={`w-full text-left px-2 py-1 rounded text-sm ${
                                  currentQuality.value === quality.value ? 'bg-tactical-green' : 'bg-white/20'
                                }`}
                              >
                                {quality.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">السرعة</label>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse mt-1">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
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

        {/* Live Badge */}
        {video.isLive && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 rtl:space-x-reverse">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>مباشر</span>
          </div>
        )}

        {/* Category Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(video.category)}`}>
          {getCategoryText(video.category)}
        </div>
      </div>

      {/* Video Info */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{video.title}</h1>
          <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-muted-foreground">
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Eye size={16} />
              <span>{formatNumber(video.views, 'ar')} مشاهدة</span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Calendar size={16} />
              <span>{formatDate(new Date(video.publishedAt), 'ar')}</span>
            </div>
            <div className="flex items-center space-x-1 rtl:space-x-reverse">
              <Clock size={16} />
              <span>{formatDuration(video.duration)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={() => onLike?.(video.id)}
              className={`flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 rounded-lg transition-colors ${
                video.isLiked ? 'bg-tactical-green text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <ThumbsUp size={16} />
              <span>{formatNumber(video.likes, 'ar')}</span>
            </button>
            
            <button
              onClick={() => onDislike?.(video.id)}
              className={`flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 rounded-lg transition-colors ${
                video.isDisliked ? 'bg-alert-red text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <ThumbsDown size={16} />
              <span>{formatNumber(video.dislikes, 'ar')}</span>
            </button>
            
            <button
              onClick={() => onShare?.(video.id)}
              className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <Share2 size={16} />
              <span>مشاركة</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => onDownload?.(video.id)}
              className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <Download size={16} />
              <span>تحميل</span>
            </button>
            
            <button
              onClick={() => onFlag?.(video.id)}
              className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-alert-red hover:text-white transition-colors"
            >
              <Flag size={16} />
              <span>إبلاغ</span>
            </button>
          </div>
        </div>

        {/* Streamer Info */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <img 
              src={video.streamer.avatar} 
              alt={video.streamer.displayName}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <h3 className="font-semibold text-foreground">{video.streamer.displayName}</h3>
                {video.streamer.verified && (
                  <div className="text-tactical-green">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatNumber(video.streamer.followers, 'ar')} متابع
              </div>
            </div>
          </div>
          
          <button className={`btn ${video.isSubscribed ? 'btn-outline' : 'btn-primary'}`}>
            {video.isSubscribed ? 'ملاحظة' : 'متابعة'}
          </button>
        </div>

        {/* Description */}
        <div className="bg-muted rounded-lg p-4">
          <p className="text-foreground whitespace-pre-wrap">{video.description}</p>
          
          {/* Game Info */}
          {video.gameInfo && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">الخريطة:</span>
                <span className="font-medium ml-1">{video.gameInfo.map}</span>
              </div>
              <div>
                <span className="text-muted-foreground">الفصيل:</span>
                <span className="font-medium ml-1">{video.gameInfo.faction}</span>
              </div>
              <div>
                <span className="text-muted-foreground">وضع اللعب:</span>
                <span className="font-medium ml-1">{video.gameInfo.gameMode}</span>
              </div>
              <div>
                <span className="text-muted-foreground">الصعوبة:</span>
                <span className="font-medium ml-1">{video.gameInfo.difficulty}</span>
              </div>
            </div>
          )}
          
          {/* Tags */}
          {video.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {video.tags.map((tag) => (
                <span key={tag} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">التعليقات</h2>
            <span className="text-sm text-muted-foreground">
              {video.comments?.length || 0} تعليق
            </span>
          </div>
          
          {/* Add Comment */}
          <form onSubmit={handleCommentSubmit} className="flex space-x-3 rtl:space-x-reverse">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="أضف تعليقاً..."
              className="flex-1 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button type="submit" className="btn btn-primary">
              <MessageCircle size={16} />
              <span>إرسال</span>
            </button>
          </form>
          
          {/* Comments List */}
          <div className="space-y-4">
            {video.comments?.map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="flex space-x-3 rtl:space-x-reverse">
                  <img 
                    src={comment.user.avatar} 
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
                    <div className="flex items-center space-x-3 rtl:space-x-reverse mt-2">
                      <button className="text-xs text-muted-foreground hover:text-tactical-green">
                        إعجاب ({comment.likes})
                      </button>
                      <button className="text-xs text-muted-foreground hover:text-foreground">
                        رد
                      </button>
                      {comment.replies && comment.replies.length > 0 && (
                        <button 
                          onClick={() => toggleCommentExpanded(comment.id)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          {expandedComments.has(comment.id) ? 'إخفاء' : 'عرض'} الردود ({comment.replies.length})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Replies */}
                {comment.replies && expandedComments.has(comment.id) && (
                  <div className="mr-11 rtl:ml-11 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex space-x-3 rtl:space-x-reverse">
                        <img 
                          src={reply.user.avatar} 
                          alt={reply.user.username}
                          className="w-6 h-6 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="bg-muted rounded-lg p-2">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                              <span className="font-medium text-foreground text-sm">{reply.user.username}</span>
                              <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                            </div>
                            <p className="text-sm text-foreground">{reply.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer; 