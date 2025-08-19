import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../firebase'

export function Dashboard() {
  const [stats, setStats] = useState({
    tours: 0,
    posts: 0,
    customers: 0,
    staff: 0
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Count tours
      const toursSnapshot = await getDocs(collection(db, 'TOURS'))
      const toursCount = toursSnapshot.size
      
      // Count posts
      const postsSnapshot = await getDocs(collection(db, 'POSTS'))
      const postsCount = postsSnapshot.size
      
      // Count customers (users)
      const customersSnapshot = await getDocs(collection(db, 'users'))
      const customersCount = customersSnapshot.size
      
      // Count staff (admins)
      const staffSnapshot = await getDocs(collection(db, 'admins'))
      const staffCount = staffSnapshot.size
      
      setStats({
        tours: toursCount,
        posts: postsCount,
        customers: customersCount,
        staff: staffCount
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeedData = async (type: 'tours' | 'posts' | 'all') => {
    try {
      setMessage('Đang thêm dữ liệu...')
      
      if (type === 'tours' || type === 'all') {
        const { seedToursData } = await import('../../utils/seedData')
        const result = await seedToursData()
        if (result.success) {
          setMessage(`✅ Đã thêm ${result.count} tours thành công!`)
        } else {
          setMessage('❌ Lỗi khi thêm tours')
        }
      }
      
      if (type === 'posts' || type === 'all') {
        const { seedPostsData } = await import('../../utils/seedData')
        const result = await seedPostsData()
        if (result.success) {
          setMessage(`✅ Đã thêm ${result.count} posts thành công!`)
        } else {
          setMessage('❌ Lỗi khi thêm posts')
        }
      }
      
      if (type === 'all') {
        setMessage('🎉 Đã thêm tất cả dữ liệu mẫu!')
      }
      
      // Reload stats after seeding
      setTimeout(() => {
        loadStats()
        setMessage(null)
      }, 3000)
      
    } catch (err: any) {
      setMessage('❌ Lỗi: ' + err.message)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Quản Trị</h1>
        <p>Chào mừng bạn đến với trang quản trị website du lịch</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏖️</div>
          <div className="stat-content">
            <h3>{loading ? '...' : stats.tours}</h3>
            <p>Tours</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{loading ? '...' : stats.posts}</h3>
            <p>Bài viết</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{loading ? '...' : stats.customers}</h3>
            <p>Khách hàng</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-content">
            <h3>{loading ? '...' : stats.staff}</h3>
            <p>Nhân viên</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Thao Tác Nhanh</h2>
        
        <div className="action-buttons">
          <button 
            onClick={() => handleSeedData('tours')}
            className="action-btn tours-btn"
          >
            🌱 Thêm 20 Tours Mẫu
          </button>
          
          <button 
            onClick={() => handleSeedData('posts')}
            className="action-btn posts-btn"
          >
            📝 Thêm 20 Posts Mẫu
          </button>
          
          <button 
            onClick={() => handleSeedData('all')}
            className="action-btn all-btn"
          >
            🚀 Thêm Tất Cả Dữ Liệu
          </button>
        </div>
        
        {message && (
          <div className="message" style={{
            padding: '12px',
            marginTop: '16px',
            borderRadius: '6px',
            backgroundColor: message.includes('✅') ? '#dcfce7' : '#fef2f2',
            color: message.includes('✅') ? '#166534' : '#dc2626',
            border: `1px solid ${message.includes('✅') ? '#bbf7d0' : '#fecaca'}`
          }}>
            {message}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Hoạt Động Gần Đây</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-time">Hôm nay</span>
            <span className="activity-text">Khởi tạo hệ thống quản trị</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">Hôm nay</span>
            <span className="activity-text">Cập nhật Firestore Rules</span>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard {
          padding: 24px;
          max-width: 1200px;
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
        
        .dashboard-header {
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
        
        .dashboard-header h1 {
          font-size: 2.5rem;
          color: #1f2937;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .dashboard-header p {
          font-size: 1.1rem;
          color: #6b7280;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideInUp 0.6s ease-out;
          animation-fill-mode: both;
        }
        
        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }
        
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
        
        .stat-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .stat-icon {
          font-size: 2.5rem;
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        .stat-content h3 {
          font-size: 2rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
          animation: countUp 2s ease-out;
        }
        
        @keyframes countUp {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .stat-content p {
          color: #6b7280;
          margin: 0;
        }
        
        .quick-actions {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 32px;
          animation: slideInLeft 0.8s ease-out;
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .quick-actions h2 {
          color: #1f2937;
          margin-bottom: 20px;
        }
        
        .action-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        
        .action-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .action-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .action-btn:hover::before {
          left: 100%;
        }
        
        .tours-btn {
          background: #f59e0b;
          color: white;
        }
        
        .posts-btn {
          background: #8b5cf6;
          color: white;
        }
        
        .all-btn {
          background: #ef4444;
          color: white;
        }
        
        .action-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .action-btn:active {
          transform: translateY(-1px) scale(1.02);
        }
        
        .recent-activity {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          animation: slideInRight 0.8s ease-out;
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .recent-activity h2 {
          color: #1f2937;
          margin-bottom: 20px;
        }
        
        .activity-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
          transition: all 0.2s;
        }
        
        .activity-item:hover {
          background: #f9fafb;
          padding-left: 12px;
          padding-right: 12px;
          margin-left: -12px;
          margin-right: -12px;
          border-radius: 6px;
        }
        
        .activity-time {
          color: #6b7280;
          font-size: 0.9rem;
        }
        
        .activity-text {
          color: #374151;
        }
        
        .message {
          animation: slideInDown 0.5s ease-out;
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .action-buttons {
            flex-direction: column;
          }
          
          .action-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
