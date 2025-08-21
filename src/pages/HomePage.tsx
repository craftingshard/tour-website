import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, limit } from 'firebase/firestore'
import { db } from '../firebase'
import { useApp } from '../context/AppProviders'
import { TourCard } from '../components/TourCard'
import { Carousel } from '../components/Carousel'

export function HomePage() {
  const { tours } = useApp()
  const navigate = useNavigate()
  const [firestoreTours, setFirestoreTours] = useState<any[]>([])
  const [firestorePosts, setFirestorePosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<{ location?: string; minPrice?: number; maxPrice?: number; category?: string }>({})
  const [pendingFilter, setPendingFilter] = useState<{ location?: string; minPrice?: number; maxPrice?: number; category?: string }>({})

  useEffect(() => {
    loadFirestoreData()
  }, [])

  const loadFirestoreData = async () => {
    try {
      setLoading(true)
      
      // Load tours from Firestore - Load all tours first to debug
      const toursSnapshot = await getDocs(
        query(
          collection(db, 'TOURS'),
          limit(20)
        )
      )
      // console.log('Firestore tours found:', toursSnapshot.docs.length)
      const toursData = toursSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // console.log('Tours data:', toursData)
      
      // Load posts from Firestore - Load all posts first to debug
      const postsSnapshot = await getDocs(
        query(
          collection(db, 'POSTS'),
          limit(10)
        )
      )
      // console.log('Posts snapshot size:', postsSnapshot.size)
      // console.log('Firestore posts found:', postsSnapshot.docs.length)
      const postsData = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      // console.log('Posts data:', postsData)
      
      setFirestoreTours(toursData)
      setFirestorePosts(postsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Combine tours with deduplication by id to avoid duplicate keys
  const allTours = useMemo(() => {
    const seen = new Set<string>()
    const out: any[] = []
    for (const t of tours) {
      const id = t.id
      if (!seen.has(id)) { seen.add(id); out.push(t) }
    }
    for (const t of firestoreTours) {
      const id = t.id
      if (!seen.has(id)) { seen.add(id); out.push(t) }
    }
    return out
  }, [tours, firestoreTours])
  const filteredTours = useMemo(() => {
    return allTours.filter(t => {
      const matchesLocation = filter.location ? String(t.location || '').toLowerCase().includes(filter.location.toLowerCase()) : true
      const price = Number(t.price) || 0
      const matchesMin = filter.minPrice != null ? price >= filter.minPrice : true
      const matchesMax = filter.maxPrice != null ? price <= filter.maxPrice : true
      const matchesCategory = filter.category ? String(t.category || '').toLowerCase().includes(filter.category.toLowerCase()) : true
      return matchesLocation && matchesMin && matchesMax && matchesCategory
    })
  }, [allTours, filter])

  const hotTours = useMemo(() => filteredTours.filter(t => t.hot || t.featured), [filteredTours])
  const topTours = useMemo(() => [...filteredTours].sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0,10), [filteredTours])
  
  // console.log('Debug HomePage:')
  // console.log('- context tours:', tours.length)
  // console.log('- firestore tours:', firestoreTours.length)
  // console.log('- all tours:', allTours.length)
  // console.log('- hot tours:', hotTours.length)
  // console.log('- top tours:', topTours.length)

  if (loading) {
    return (
      <div className="container">
        <div className="loading-section">
          <div className="loading-spinner">🔄</div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap'}}>
        <h2 style={{margin:'8px 0'}}>Khám phá Việt Nam</h2>
        <div className="muted">Khám phá những điểm đến tuyệt vời</div>
      </div>

      <h3 className="section-title">Tour HOT ({hotTours.length})</h3>
      {hotTours.length > 0 ? (
        <Carousel
          height={650}
          itemWidth={400}
          items={hotTours.map(t => (
            <TourCard key={t.id} tour={t} />
          ))}
          ariaLabel="Hot Tours"
        />
      ) : (
        <div className="grid grid-3">
          {allTours.slice(0, 6).map(t => (
            <TourCard key={t.id} tour={t} />
          ))}
        </div>
      )}

      {/* Tour Filters - on submit navigate to results page; keep carousel intact */}
      <div className="card" style={{margin:'12px 0', padding:'12px', perspective:'1000px'}}>
        <form onSubmit={(e)=> { e.preventDefault(); navigate('/tours', { state: { filter: pendingFilter } }) }} style={{transformStyle:'preserve-3d'}}>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12}}>
            <input placeholder="Địa điểm" value={pendingFilter.location || ''} onChange={e=>setPendingFilter(f=>({...f, location:e.target.value}))} style={{transform:'rotateX(6deg)'}} />
            <input type="number" placeholder="Giá từ" value={pendingFilter.minPrice ?? ''} onChange={e=>setPendingFilter(f=>({...f, minPrice: e.target.value===''? undefined : Number(e.target.value)}))} style={{transform:'rotateY(-6deg)'}} />
            <input type="number" placeholder="Giá đến" value={pendingFilter.maxPrice ?? ''} onChange={e=>setPendingFilter(f=>({...f, maxPrice: e.target.value===''? undefined : Number(e.target.value)}))} style={{transform:'rotateY(6deg)'}} />
            <button className="btn primary" type="submit" style={{transform:'translateZ(20px)', boxShadow:'0 10px 20px rgba(0,0,0,.25)'}}>Lọc</button>
            <button type="button" className="btn ghost" onClick={()=>{ setFilter({}); setPendingFilter({}) }}>Xóa lọc</button>
          </div>
        </form>
      </div>

      <h3 className="section-title">Tour nổi bật ({topTours.length})</h3>
      <div className="grid grid-3">
        {topTours.length > 0 ? topTours.map(t => (
          <TourCard key={t.id} tour={t} />
        )) : (
          <div className="muted">Không có tour nào để hiển thị</div>
        )}
      </div>

      {/* Posts Section */}
      <h3 className="section-title">Bài viết mới nhất ({firestorePosts.length})</h3>
      <div className="posts-grid">
        {firestorePosts.length > 0 ? firestorePosts.map(post => (
          <div key={post.id} className="post-card" onClick={()=> navigate(`/guide/${post.id}`)}>
            {post.imageUrl && (
              <div className="post-image">
                <img src={post.imageUrl} alt={post.title} />
              </div>
            )}
            <div className="post-content">
              <div className="post-meta">
                <span className="post-category">{post.category}</span>
                <span className="post-date">
                  {post.publishedAt?.toDate?.()?.toLocaleDateString('vi-VN') || 
                   new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <h4 className="post-title">{post.title}</h4>
              <p className="post-excerpt">{post.excerpt || post.content?.substring(0, 150) + '...'}</p>
              <div className="post-author">Bởi: {post.author}</div>
              <div className="post-stats">
                <span>👁️ {post.views || 0}</span>
                <span>❤️ {post.likes || 0}</span>
                <span>📖 {post.readTime || '5 phút'}</span>
              </div>
            </div>
          </div>
        )) : (
          <div className="muted">Không có bài viết nào để hiển thị</div>
        )}
      </div>

      <style>{`
        .loading-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          gap: 1rem;
        }
        
        .loading-spinner {
          font-size: 3rem;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        
        .post-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        
        .post-card:hover {
          transform: translateY(-4px) rotateX(2deg) rotateY(-2deg);
          box-shadow: 0 20px 30px -10px rgba(0,0,0,.2);
        }
        
        .post-image {
          height: 200px;
          overflow: hidden;
        }
        
        .post-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
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
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .post-date {
          color: #6b7280;
          font-size: 0.9rem;
        }
        
        .post-title {
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.4;
        }
        
        .post-excerpt {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        
        .post-author {
          color: #374151;
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        
        .post-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.9rem;
          color: #6b7280;
        }
        
        .section-title {
          margin: 2.5rem 0 1.5rem 0;
          font-size: 1.8rem;
          font-weight: 700;
          color: #1f2937;
        }
        
        @media (max-width: 768px) {
          .posts-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .post-content {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}


