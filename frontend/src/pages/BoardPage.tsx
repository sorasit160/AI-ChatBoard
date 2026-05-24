import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { boardApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import './BoardPage.css';

interface Post {
  id: string;
  title: string;
  content: string;
  username: string;
  views: number;
  reply_count: number;
  is_pinned: boolean;
  created_at: string;
}

interface Reply {
  id: string;
  content: string;
  username: string;
  created_at: string;
}

export default function BoardPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  // Lists state
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // View state
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoadingPost, setIsLoadingPost] = useState(false);

  // Form state
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPosts = useCallback(async (pageNum: number, searchQuery: string, reset = false) => {
    try {
      setIsLoading(true);
      const res = await boardApi.getPosts({ page: pageNum, limit: 10, search: searchQuery });
      if (reset) {
        setPosts(res.data.posts);
      } else {
        setPosts((prev) => [...prev, ...res.data.posts]);
      }
      setHasMore(res.data.pagination.page < res.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1, search, true);
  }, [search, fetchPosts]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, search, false);
  };

  const handleViewPost = async (id: string) => {
    try {
      setIsLoadingPost(true);
      setActivePostId(id);
      const res = await boardApi.getPost(id);
      setActivePost(res.data.post);
      setReplies(res.data.replies);
    } catch (err) {
      console.error(err);
      setActivePostId(null);
    } finally {
      setIsLoadingPost(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await boardApi.createPost(newPost);
      setPosts([res.data.post, ...posts]);
      setShowNewPostModal(false);
      setNewPost({ title: '', content: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || !activePostId) return;

    try {
      setIsSubmitting(true);
      const res = await boardApi.createReply(activePostId, newReply);
      setReplies([...replies, res.data.reply]);
      setNewReply('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm(t('board.confirmDelete'))) return;
    try {
      await boardApi.deletePost(id);
      setPosts(posts.filter((p) => p.id !== id));
      if (activePostId === id) setActivePostId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  if (activePostId) {
    return (
      <div className="board-page page-layout container animate-fade-in">
        <button className="btn btn-ghost btn-sm mb-lg" onClick={() => setActivePostId(null)}>
          {t('board.backToBoard')}
        </button>

        {isLoadingPost ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : activePost ? (
          <div className="thread-view">
            <div className="glass-card post-main">
              <div className="post-main-header">
                <h1 className="post-main-title">{activePost.title}</h1>
                <div className="post-meta">
                  <span className="post-author">👤 {activePost.username}</span>
                  <span className="post-date">📅 {formatDate(activePost.created_at)}</span>
                  <span className="post-views">👁️ {activePost.views} {t('board.views')}</span>
                </div>
              </div>
              <div className="post-main-content">{activePost.content}</div>
              
              {(user?.role === 'admin' || user?.username === activePost.username) && (
                <div className="post-actions">
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeletePost(activePost.id)}>
                    🗑️ {t('board.deletePost')}
                  </button>
                </div>
              )}
            </div>

            <div className="replies-section">
              <h3 className="replies-title">{replies.length} {t('board.replies')}</h3>
              
              {replies.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state-desc">{t('board.noReplies')}</p>
                </div>
              ) : (
                <div className="replies-list">
                  {replies.map(reply => (
                    <div key={reply.id} className="reply-card">
                      <div className="reply-header">
                        <span className="reply-author">👤 {reply.username}</span>
                        <span className="reply-date">{formatDate(reply.created_at)}</span>
                      </div>
                      <div className="reply-content">{reply.content}</div>
                    </div>
                  ))}
                </div>
              )}

              <form className="reply-form glass-card" onSubmit={handleCreateReply}>
                <textarea
                  className="input"
                  placeholder={t('board.replyPlaceholder')}
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  rows={3}
                  required
                  disabled={isSubmitting}
                />
                <div className="reply-form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!newReply.trim() || isSubmitting}
                  >
                    {isSubmitting ? '...' : t('board.submitReply')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="board-page page-layout container animate-fade-in">
      <div className="board-header">
        <div>
          <h1 className="gradient-text" style={{ margin: 0 }}>{t('board.title')}</h1>
          <p className="board-subtitle">{t('board.subtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewPostModal(true)}>
          ✍️ {t('board.newPost')}
        </button>
      </div>

      <div className="board-controls">
        <input
          type="search"
          className="input search-input"
          placeholder={t('board.search')}
          value={search}
          onChange={handleSearch}
        />
      </div>

      <div className="posts-list">
        {isLoading && page === 1 ? (
          <div className="empty-state"><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3 className="empty-state-title">{t('board.noPostsFound')}</h3>
            <p className="empty-state-desc">{search ? 'Try adjusting your search query' : t('board.beFirst')}</p>
          </div>
        ) : (
          <>
            {posts.map((post, idx) => (
              <div 
                key={post.id} 
                className={`glass-card post-card ${post.is_pinned ? 'pinned' : ''}`}
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => handleViewPost(post.id)}
              >
                <div className="post-card-content">
                  <div className="post-card-header">
                    {post.is_pinned && <span className="badge badge-primary">📌 {t('board.pinned')}</span>}
                    <h3 className="post-card-title">{post.title}</h3>
                  </div>
                  <p className="post-card-preview">{post.content}</p>
                  <div className="post-card-footer">
                    <span className="post-author">{post.username}</span>
                    <span className="post-date">{formatDate(post.created_at)}</span>
                  </div>
                </div>
                <div className="post-card-stats">
                  <div className="stat-pill">
                    <span>💬</span>
                    <span>{post.reply_count}</span>
                  </div>
                  <div className="stat-pill">
                    <span>👁️</span>
                    <span>{post.views}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <div className="load-more-container">
                <button 
                  className="btn btn-secondary" 
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? '...' : t('board.loadMore')}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showNewPostModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{t('board.newPost')}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowNewPostModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreatePost}>
              <div className="modal-body">
                <div className="input-group">
                  <label className="input-label">{t('board.postTitle')}</label>
                  <input
                    type="text"
                    className="input"
                    placeholder={t('board.titlePlaceholder')}
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    required
                    maxLength={200}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">{t('board.postContent')}</label>
                  <textarea
                    className="input"
                    placeholder={t('board.contentPlaceholder')}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    required
                    rows={6}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowNewPostModal(false)} disabled={isSubmitting}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={!newPost.title || !newPost.content || isSubmitting}>
                  {isSubmitting ? '...' : t('board.submitPost')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
