import React, { useState } from 'react';
import { Heart, MessageCircle, Flag, Edit, Trash2, Reply } from 'lucide-react';
import { useAuth } from '../../store/auth';
import { formatRelativeTime } from '../../utils/i18n';

interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    avatar?: string;
    rank: string;
    level: number;
    isOnline: boolean;
  };
  stats: {
    likes: number;
    replies: number;
  };
  parentId?: number;
  replies?: Comment[];
  isLiked: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommentListProps {
  comments: Comment[];
  postId: number;
  onLike?: (commentId: number) => void;
  onReply?: (commentId: number, parentId?: number) => void;
  onEdit?: (commentId: number) => void;
  onDelete?: (commentId: number) => void;
  onReport?: (commentId: number) => void;
  maxDepth?: number;
  currentDepth?: number;
  className?: string;
}

const CommentItem: React.FC<{
  comment: Comment;
  postId: number;
  onLike?: (commentId: number) => void;
  onReply?: (commentId: number, parentId?: number) => void;
  onEdit?: (commentId: number) => void;
  onDelete?: (commentId: number) => void;
  onReport?: (commentId: number) => void;
  maxDepth: number;
  currentDepth: number;
}> = ({
  comment,
  postId,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onReport,
  maxDepth,
  currentDepth,
}) => {
  const { user } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const isAuthor = user?.id === comment.author.id;
  const isAdmin = user?.rank === 'admin' || user?.rank === 'moderator';
  const canEdit = isAuthor || isAdmin;
  const canDelete = isAuthor || isAdmin;
  const canReply = currentDepth < maxDepth;

  const handleLike = () => {
    onLike?.(comment.id);
  };

  const handleReply = () => {
    if (canReply) {
      setShowReplyForm(true);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply?.(comment.id, comment.parentId);
      setReplyContent('');
      setShowReplyForm(false);
      setShowReplies(true);
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    onEdit?.(comment.id);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete?.(comment.id);
    }
  };

  const handleReport = () => {
    onReport?.(comment.id);
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  return (
    <div className={`
      ${currentDepth > 0 ? 'ml-8 rtl:mr-8 rtl:ml-0' : ''}
      ${currentDepth > 0 ? 'border-l-2 rtl:border-r-2 rtl:border-l-0 border-border pl-4 rtl:pr-4 rtl:pl-0' : ''}
    `}>
      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Author Avatar */}
            <div className="relative">
              <img
                src={comment.author.avatar || '/default-avatar.png'}
                alt={comment.author.username}
                className="w-8 h-8 rounded-full object-cover border border-border"
              />
              {comment.author.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-tactical-green rounded-full border border-background"></div>
              )}
            </div>

            {/* Author Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <h4 className="font-semibold text-foreground text-sm truncate">
                  {comment.author.username}
                </h4>
                <span className="rank-badge text-xs">
                  {comment.author.rank}
                </span>
                <span className="text-xs text-muted-foreground">
                  Level {comment.author.level}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(new Date(comment.createdAt), 'ar')}
                {comment.isEdited && (
                  <span className="ml-1 rtl:mr-1 opacity-70">(edited)</span>
                )}
              </p>
            </div>
          </div>

          {/* Options Menu */}
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 hover:bg-accent rounded-full transition-colors"
            >
              <div className="flex flex-col space-y-1">
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              </div>
            </button>

            {showOptions && (
              <div className="absolute right-0 rtl:left-0 mt-2 w-40 bg-popover border border-border rounded-lg shadow-lg z-50">
                <div className="py-1">
                  {canEdit && (
                    <button
                      onClick={handleEdit}
                      className="w-full px-3 py-2 text-left rtl:text-right hover:bg-accent transition-colors flex items-center space-x-2 rtl:space-x-reverse text-sm"
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left rtl:text-right hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center space-x-2 rtl:space-x-reverse text-sm"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  )}
                  {!isAuthor && (
                    <button
                      onClick={handleReport}
                      className="w-full px-3 py-2 text-left rtl:text-right hover:bg-accent transition-colors flex items-center space-x-2 rtl:space-x-reverse text-sm"
                    >
                      <Flag size={14} />
                      <span>Report</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comment Content */}
        <div className="mb-3">
          <div 
            className="text-foreground text-sm leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
        </div>

        {/* Comment Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`
                flex items-center space-x-1 rtl:space-x-reverse text-sm transition-colors
                ${comment.isLiked 
                  ? 'text-red-500' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Heart size={14} className={comment.isLiked ? 'fill-current' : ''} />
              <span>{comment.stats.likes}</span>
            </button>

            {/* Reply Button */}
            {canReply && (
              <button
                onClick={handleReply}
                className="flex items-center space-x-1 rtl:space-x-reverse text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Reply size={14} />
                <span>Reply</span>
              </button>
            )}

            {/* Toggle Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={toggleReplies}
                className="flex items-center space-x-1 rtl:space-x-reverse text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle size={14} />
                <span>
                  {showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <form onSubmit={handleSubmitReply} className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex space-x-3 rtl:space-x-reverse">
              <img
                src={user?.avatar || '/default-avatar.png'}
                alt={user?.username}
                className="w-6 h-6 rounded-full object-cover border border-border flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full p-2 bg-input border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  rows={3}
                  disabled={isSubmitting}
                />
                <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-2">
                  <button
                    type="button"
                    onClick={() => setShowReplyForm(false)}
                    className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isSubmitting || !replyContent.trim()}
                  >
                    {isSubmitting ? 'Posting...' : 'Post Reply'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Nested Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onLike={onLike}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onReport={onReport}
              maxDepth={maxDepth}
              currentDepth={currentDepth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentList: React.FC<CommentListProps> = ({
  comments,
  postId,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onReport,
  maxDepth = 3,
  currentDepth = 0,
  className = '',
}) => {
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'likes'>('newest');
  const [showAllComments, setShowAllComments] = useState(false);

  // Sort comments based on selected criteria
  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'likes':
        return b.stats.likes - a.stats.likes;
      default:
        return 0;
    }
  });

  // Show only top-level comments initially
  const topLevelComments = sortedComments.filter(comment => !comment.parentId);
  const displayedComments = showAllComments ? topLevelComments : topLevelComments.slice(0, 5);

  if (comments.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
        <p className="text-muted-foreground">No comments yet</p>
        <p className="text-sm text-muted-foreground mt-1">Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Comments ({comments.length})
        </h3>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'likes')}
            className="bg-input border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {displayedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
            onLike={onLike}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={onReport}
            maxDepth={maxDepth}
            currentDepth={currentDepth}
          />
        ))}
      </div>

      {/* Load More Button */}
      {!showAllComments && topLevelComments.length > 5 && (
        <div className="text-center pt-4">
          <button
            onClick={() => setShowAllComments(true)}
            className="btn btn-outline btn-sm"
          >
            Show {topLevelComments.length - 5} more comments
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentList; 