import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore'
import { db } from '../firebase'

export function GuidePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState<any>(null)
  const postsPerPage = 10

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async (isLoadMore = false) => {
    try {
      setLoading(true)
      
      let q = query(
        collection(db, 'POSTS'),
        orderBy('createdAt', 'desc'),
        limit(postsPerPage)
      )

      if (isLoadMore && lastDoc) {
        q = query(
          collection(db, 'POSTS'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(postsPerPage)
        )
      }

      const snapshot = await getDocs(q)
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      if (isLoadMore) {
        setPosts(prev => [...prev, ...postsData])
      } else {
        setPosts(postsData)
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1])
      setHasMore(snapshot.docs.length === postsPerPage)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadPosts(true)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div className="container">
      <div className="guide-header">
        <h2>Cẩm nang du lịch</h2>
        <p>Khám phá những bài viết hữu ích về du lịch Việt Nam</p>
      </div>

      {loading && posts.length === 0 ? (
        <div className="loading-section">
          <div className="loading-spinner">🔄</div>
          <p>Đang tải bài viết...</p>
        </div>
      ) : (
        <>
          <div className="posts-grid">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                {post.imageUrl && (
                  <div className="post-image">
                    <img src={post.imageUrl} alt={post.title} />
                  </div>
                )}
                <div className="post-content">
                  <div className="post-meta">
                    <span className="post-category">{post.category || 'Du lịch'}</span>
                    <span className="post-date">
                      {formatDate(post.createdAt || post.publishedAt)}
                    </span>
                  </div>
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-excerpt">
                    {post.excerpt || post.content?.substring(0, 150) + '...'}
                  </p>
                  <div className="post-author">Bởi: {post.author || 'Admin'}</div>
                  <div className="post-stats">
                    <span>👁️ {post.views || 0}</span>
                    <span>❤️ {post.likes || 0}</span>
                    <span>📖 {post.readTime || '5 phút'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="load-more-section">
              <button 
                className="btn primary load-more-btn"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'Đang tải...' : 'Xem thêm bài viết'}
              </button>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="no-more-posts">
              <p>Đã hiển thị tất cả bài viết</p>
            </div>
          )}

          {posts.length === 0 && !loading && (
            <div className="no-posts">
              <div className="no-posts-icon">📝</div>
              <p>Chưa có bài viết nào</p>
            </div>
          )}
        </>
      )}

      <style>{`
        .guide-header {
          text-align: center;
          margin-bottom: 2rem;
          padding: 2rem 0;
        }

        .guide-header h2 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: var(--text);
        }

        .guide-header p {
          color: var(--muted);
          font-size: 1.1rem;
        }

        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .post-card {
          background: var(--card);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .post-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .post-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .post-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s ease;
        }

        .post-card:hover .post-image img {
          transform: scale(1.05);
        }

        .post-content {
          padding: 1.5rem;
        }

        .post-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .post-category {
          background: var(--primary);
          color: #06101a;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .post-date {
          color: var(--muted);
          font-size: 0.8rem;
        }

        .post-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          line-height: 1.4;
          color: var(--text);
        }

        .post-excerpt {
          color: var(--muted);
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .post-author {
          font-size: 0.85rem;
          color: var(--muted);
          margin-bottom: 0.75rem;
        }

        .post-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: var(--muted);
        }

        .load-more-section {
          text-align: center;
          margin: 2rem 0;
        }

        .load-more-btn {
          padding: 0.75rem 2rem;
          font-size: 1rem;
          border-radius: 8px;
        }

        .no-more-posts {
          text-align: center;
          padding: 2rem;
          color: var(--muted);
        }

        .no-posts {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--muted);
        }

        .no-posts-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .loading-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .loading-spinner {
          font-size: 3rem;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .posts-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .guide-header h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  )
}


