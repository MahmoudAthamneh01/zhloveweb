import React, { useState, useRef } from 'react';
import { Bold, Italic, Link, Image, Code, Quote, List, ListOrdered, Eye, EyeOff, Send, X } from 'lucide-react';
import { useAuth } from '../../store/auth';

interface PostFormProps {
  onSubmit: (postData: PostData) => Promise<void>;
  onCancel?: () => void;
  editData?: PostData;
  isEditing?: boolean;
  categories: Category[];
  className?: string;
}

interface PostData {
  id?: number;
  title: string;
  content: string;
  categoryId: number;
  tags: string[];
  isDraft?: boolean;
  isPinned?: boolean;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  description?: string;
}

const PostForm: React.FC<PostFormProps> = ({
  onSubmit,
  onCancel,
  editData,
  isEditing = false,
  categories,
  className = '',
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<PostData>({
    title: editData?.title || '',
    content: editData?.content || '',
    categoryId: editData?.categoryId || (categories[0]?.id || 1),
    tags: editData?.tags || [],
    isDraft: editData?.isDraft || false,
    isPinned: editData?.isPinned || false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters long';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const draftData = { ...formData, isDraft: true };
    setIsSubmitting(true);
    try {
      await onSubmit(draftData);
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const beforeText = text.substring(0, start);
    const selectedText = text.substring(start, end);
    const afterText = text.substring(end);

    const newText = beforeText + before + selectedText + after + afterText;
    
    setFormData(prev => ({ ...prev, content: newText }));
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);

  return (
    <div className={`bg-card border border-border rounded-lg p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </h2>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <img
            src={user?.avatar || '/default-avatar.png'}
            alt={user?.username}
            className="w-10 h-10 rounded-full object-cover border-2 border-border"
          />
          <div>
            <p className="font-semibold text-foreground">{user?.username}</p>
            <p className="text-sm text-muted-foreground">
              Level {user?.level} • {user?.rank}
            </p>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
            Post Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={`
              w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring
              ${errors.title ? 'border-destructive' : ''}
            `}
            placeholder="Enter your post title..."
            disabled={isSubmitting}
          />
          {errors.title && (
            <p className="text-destructive text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
            Category *
          </label>
          <select
            id="category"
            value={formData.categoryId}
            onChange={(e) => setFormData(prev => ({ ...prev, categoryId: parseInt(e.target.value) }))}
            className={`
              w-full p-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring
              ${errors.categoryId ? 'border-destructive' : ''}
            `}
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {selectedCategory && (
            <p className="text-sm text-muted-foreground mt-1">
              {selectedCategory.description}
            </p>
          )}
          {errors.categoryId && (
            <p className="text-destructive text-sm mt-1">{errors.categoryId}</p>
          )}
        </div>

        {/* Content Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="content" className="block text-sm font-medium text-foreground">
              Content *
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-1 rtl:space-x-reverse text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
            </button>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse p-2 bg-muted border border-border rounded-t-lg">
            <button
              type="button"
              onClick={() => insertMarkdown('**', '**')}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('*', '*')}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('[Link Text](', ')')}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Link"
            >
              <Link size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('![Alt Text](', ')')}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Image"
            >
              <Image size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('`', '`')}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Code"
            >
              <Code size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('> ', '')}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Quote"
            >
              <Quote size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('- ', '')}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('1. ', '')}
              className="p-1 hover:bg-accent rounded transition-colors"
              title="Numbered List"
            >
              <ListOrdered size={16} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex">
            {/* Editor */}
            <div className={`${showPreview ? 'w-1/2' : 'w-full'} transition-all duration-200`}>
              <textarea
                ref={textareaRef}
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className={`
                  w-full p-3 bg-input border border-border rounded-b-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none
                  ${showPreview ? 'rounded-br-none border-r-0' : ''}
                  ${errors.content ? 'border-destructive' : ''}
                `}
                placeholder="Write your post content here... (Supports Markdown)"
                rows={12}
                disabled={isSubmitting}
              />
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="w-1/2 p-3 bg-muted border border-border rounded-br-lg border-l-0">
                <div className="prose prose-sm max-w-none text-foreground">
                  {formData.content ? (
                    <div dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br>') }} />
                  ) : (
                    <p className="text-muted-foreground italic">Preview will appear here...</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {errors.content && (
            <p className="text-destructive text-sm mt-1">{errors.content}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-2">
            Tags (Optional)
          </label>
          <div className="space-y-2">
            {/* Tags Display */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagAdd}
              className="w-full p-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Add tags (press Enter or comma to add)"
              disabled={isSubmitting || formData.tags.length >= 10}
            />
            <p className="text-xs text-muted-foreground">
              Press Enter or comma to add tags. Maximum 10 tags.
            </p>
          </div>
        </div>

        {/* Admin Options */}
        {(user?.rank === 'admin' || user?.rank === 'moderator') && (
          <div className="space-y-3 p-3 bg-muted rounded-lg">
            <h3 className="text-sm font-medium text-foreground">Admin Options</h3>
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <label className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                  className="rounded border-border"
                />
                <span className="text-sm text-foreground">Pin this post</span>
              </label>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="btn btn-outline btn-sm"
            >
              Save as Draft
            </button>
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-sm flex items-center space-x-1 rtl:space-x-reverse"
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Publishing...' : (isEditing ? 'Update Post' : 'Publish Post')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostForm; 