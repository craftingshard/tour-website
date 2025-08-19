import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase'

export function DataDisplayPage() {
  const [tours, setTours] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'tours' | 'posts'>('tours')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load tours
      const toursQuery = query(
        collection(db, 'TOURS'),
        orderBy('createdAt', 'desc'),
        limit(20)
      )
      const toursSnapshot = await getDocs(toursQuery)
      const toursData = toursSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTours(toursData)

      // Load posts
      const postsQuery = query(
        collection(db, 'POSTS'),
        orderBy('publishedAt', 'desc'),
        limit(20)
      )
      const postsSnapshot = await getDocs(postsQuery)
      const postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setPosts(postsData)

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ'
  }

  const formatDate = (date: any) => {
    if (date?.toDate) {
      return date.toDate().toLocaleDateString('vi-VN')
    }
    return new Date(date).toLocaleDateString('vi-VN')
  }

  return (
    <div className="data-display">
      <div className="page-header">
        <h1>📊 Hiển Thị Dữ Liệu</h1>
        <p>Xem dữ liệu tours và posts từ database</p>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'tours' ? 'active' : ''}`}
          onClick={() => setActiveTab('tours')}
        >
          🏖️ Tours ({tours.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📝 Posts ({posts.length})
        </button>
      </div>

      {/* Content */}
      <div className="content-section">
        {loading ? (
          <div className="loading">🔄 Đang tải dữ liệu...</div>
        ) : (
          <>
            {activeTab === 'tours' && (
              <div className="tours-grid">
                {tours.map(tour => (
                  <div key={tour.id} className="tour-card">
                    <div className="tour-image">
                      <img src={tour.imageUrl || 'https://picsum.photos/300/200'} alt={tour.name} />
                      {tour.featured && <span className="featured-badge">⭐ Nổi bật</span>}
                    </div>
                    <div className="tour-content">
                      <h3 className="tour-name">{tour.name}</h3>
                      <p className="tour-location">📍 {tour.location}</p>
                      <p className="tour-description">{tour.description?.substring(0, 100)}...</p>
                      <div className="tour-details">
                        <span className="tour-price">{formatCurrency(tour.price || 0)}</span>
                        <span className="tour-duration">⏱️ {tour.duration}</span>
                      </div>
                      <div className="tour-meta">
                        <span className="tour-rating">⭐ {tour.rating || 'N/A'}</span>
                        <span className="tour-category">🏷️ {tour.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="posts-grid">
                {posts.map(post => (
                  <div key={post.id} className="post-card">
                    <div className="post-image">
                      <img src={post.imageUrl || 'https://picsum.photos/300/200'} alt={post.title} />
                      {post.featured && <span className="featured-badge">⭐ Nổi bật</span>}
                    </div>
                    <div className="post-content">
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-excerpt">{post.content?.substring(0, 150)}...</p>
                      <div className="post-meta">
                        <span className="post-author">👤 {post.author}</span>
                        <span className="post-category">🏷️ {post.category}</span>
                      </div>
                      <div className="post-stats">
                        <span className="post-read-time">⏱️ {post.readTime}</span>
                        <span className="post-views">👁️ {post.views || 0}</span>
                        <span className="post-likes">❤️ {post.likes || 0}</span>
                      </div>
                      <div className="post-tags">
                        {post.tags?.slice(0, 3).map((tag: string, index: number) => (
                          <span key={index} className="post-tag">{tag}</span>
                        ))}
                      </div>
                      <p className="post-date">📅 {formatDate(post.publishedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .data-display {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
          animation: fadeInUp 0.6s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 32px;
          animation: slideInDown 0.8s ease-out;
        }
        
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .page-header h1 {
          font-size: 2.5rem;
          color: #1f2937;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .page-header p {
          font-size: 1.1rem;
          color: #6b7280;
        }

        .tab-navigation {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
          gap: 16px;
        }

        .tab-button {
          padding: 12px 24px;
          border: 2px solid #e5e7eb;
          background: white;
          color: #6b7280;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tab-button:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-2px);
        }

        .tab-button.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .content-section {
          min-height: 400px;
        }

        .loading {
          text-align: center;
          padding: 80px;
          color: #6b7280;
          font-size: 1.2rem;
        }

        .tours-grid,
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .tour-card,
        .post-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          animation: slideInUp 0.6s ease-out;
          animation-fill-mode: both;
        }

        .tour-card:nth-child(1) { animation-delay: 0.1s; }
        .tour-card:nth-child(2) { animation-delay: 0.2s; }
        .tour-card:nth-child(3) { animation-delay: 0.3s; }
        .tour-card:nth-child(4) { animation-delay: 0.4s; }
        .tour-card:nth-child(5) { animation-delay: 0.5s; }
        .tour-card:nth-child(6) { animation-delay: 0.6s; }

        .post-card:nth-child(1) { animation-delay: 0.1s; }
        .post-card:nth-child(2) { animation-delay: 0.2s; }
        .post-card:nth-child(3) { animation-delay: 0.3s; }
        .post-card:nth-child(4) { animation-delay: 0.4s; }
        .post-card:nth-child(5) { animation-delay: 0.5s; }
        .post-card:nth-child(6) { animation-delay: 0.6s; }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tour-card:hover,
        .post-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .tour-image,
        .post-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .tour-image img,
        .post-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .tour-card:hover .tour-image img,
        .post-card:hover .post-image img {
          transform: scale(1.05);
        }

        .featured-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #f59e0b;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .tour-content,
        .post-content {
          padding: 20px;
        }

        .tour-name,
        .post-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .tour-location {
          color: #6b7280;
          margin: 0 0 12px 0;
          font-size: 0.875rem;
        }

        .tour-description,
        .post-excerpt {
          color: #4b5563;
          margin: 0 0 16px 0;
          line-height: 1.6;
          font-size: 0.875rem;
        }

        .tour-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .tour-price {
          font-size: 1.125rem;
          font-weight: 600;
          color: #059669;
        }

        .tour-duration {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .tour-meta,
        .post-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .tour-rating,
        .tour-category,
        .post-author,
        .post-category {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .post-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .post-read-time,
        .post-views,
        .post-likes {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .post-tags {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .post-tag {
          background: #f3f4f6;
          color: #374151;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .post-date {
          color: #9ca3af;
          font-size: 0.875rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .tours-grid,
          .posts-grid {
            grid-template-columns: 1fr;
          }
          
          .tab-navigation {
            flex-direction: column;
            align-items: center;
          }
          
          .tab-button {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  )
}
