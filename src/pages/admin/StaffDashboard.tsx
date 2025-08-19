import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAdmin } from '../../context/AdminProviders'

export function StaffDashboard() {
  const { currentUser } = useAdmin()
  const [stats, setStats] = useState({
    myTours: 0,
    myPosts: 0,
    myBookings: 0,
    recentBookings: [] as any[]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStaffStats()
  }, [currentUser])

  const loadStaffStats = async () => {
    if (!currentUser) return
    
    try {
      setLoading(true)
      
      // Count tours created by this staff member
      const toursSnapshot = await getDocs(
        query(collection(db, 'TOURS'), where('createdBy', '==', currentUser.uid))
      )
      const myTours = toursSnapshot.size
      
      // Count posts created by this staff member
      const postsSnapshot = await getDocs(
        query(collection(db, 'POSTS'), where('author', '==', currentUser.name))
      )
      const myPosts = postsSnapshot.size
      
      // Count bookings handled by this staff member
      const bookingsSnapshot = await getDocs(
        query(collection(db, 'bookings'), where('handledBy', '==', currentUser.uid))
      )
      const myBookings = bookingsSnapshot.size
      
      // Get recent bookings (last 5)
      const recentBookingsSnapshot = await getDocs(
        query(
          collection(db, 'bookings'),
          orderBy('createdAt', 'desc'),
          limit(5)
        )
      )
      const recentBookings = recentBookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setStats({
        myTours,
        myPosts,
        myBookings,
        recentBookings
      })
    } catch (error) {
      console.error('Error loading staff stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <div className="staff-dashboard">
        <div className="loading-container">
          <div className="loading-spinner">🔄</div>
          <div>Đang tải dữ liệu...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="staff-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Chào mừng, {currentUser?.name}!</h1>
          <p>Đây là bảng điều khiển dành cho nhân viên</p>
        </div>
        <div className="user-badge">
          <span className="badge-role">Nhân viên</span>
          <span className="badge-dept">{currentUser?.department || 'Không xác định'}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card tours">
          <div className="stat-icon">🏔️</div>
          <div className="stat-content">
            <div className="stat-number">{stats.myTours}</div>
            <div className="stat-label">Tours của tôi</div>
          </div>
        </div>
        
        <div className="stat-card posts">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-number">{stats.myPosts}</div>
            <div className="stat-label">Bài viết của tôi</div>
          </div>
        </div>
        
        <div className="stat-card bookings">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.myBookings}</div>
            <div className="stat-label">Đặt tour đã xử lý</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Thao tác nhanh</h2>
        <div className="actions-grid">
          <a href="/admin/tours" className="action-card">
            <div className="action-icon">🏔️</div>
            <div className="action-content">
              <div className="action-title">Quản lý Tours</div>
              <div className="action-desc">Thêm và chỉnh sửa tours</div>
            </div>
          </a>
          
          <a href="/admin/posts" className="action-card">
            <div className="action-icon">📝</div>
            <div className="action-content">
              <div className="action-title">Quản lý Bài viết</div>
              <div className="action-desc">Tạo và chỉnh sửa bài viết</div>
            </div>
          </a>
          
          <a href="/admin/bookings" className="action-card">
            <div className="action-icon">📅</div>
            <div className="action-content">
              <div className="action-title">Đặt tour</div>
              <div className="action-desc">Xử lý đặt tour của khách hàng</div>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>Hoạt động gần đây</h2>
        <div className="activity-list">
          {stats.recentBookings.length > 0 ? (
            stats.recentBookings.map((booking: any) => (
              <div key={booking.id} className="activity-item">
                <div className="activity-icon">📅</div>
                <div className="activity-content">
                  <div className="activity-title">
                    Đặt tour: {booking.tourName || 'Không xác định'}
                  </div>
                  <div className="activity-details">
                    Khách hàng: {booking.customerName || 'Không xác định'} • 
                    Ngày đặt: {formatDate(booking.createdAt)}
                  </div>
                </div>
                <div className={`activity-status ${booking.status || 'pending'}`}>
                  {booking.status === 'confirmed' ? 'Đã xác nhận' :
                   booking.status === 'cancelled' ? 'Đã hủy' :
                   booking.status === 'completed' ? 'Hoàn thành' : 'Chờ xác nhận'}
                </div>
              </div>
            ))
          ) : (
            <div className="no-activity">
              <div className="no-activity-icon">📭</div>
              <p>Chưa có hoạt động nào gần đây</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .staff-dashboard {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
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
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border-radius: 16px;
          color: white;
        }
        
        .welcome-section h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          font-weight: 700;
        }
        
        .welcome-section p {
          margin: 0;
          opacity: 0.9;
          font-size: 1.1rem;
        }
        
        .user-badge {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }
        
        .badge-role {
          background: rgba(255,255,255,0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .badge-dept {
          font-size: 0.8rem;
          opacity: 0.8;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: transform 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
        }
        
        .stat-card.tours {
          border-left: 4px solid #3b82f6;
        }
        
        .stat-card.posts {
          border-left: 4px solid #8b5cf6;
        }
        
        .stat-card.bookings {
          border-left: 4px solid #059669;
        }
        
        .stat-icon {
          font-size: 3rem;
          opacity: 0.8;
        }
        
        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }
        
        .stat-label {
          color: #6b7280;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .quick-actions {
          margin-bottom: 3rem;
        }
        
        .quick-actions h2 {
          margin-bottom: 1.5rem;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .action-card {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1.5rem;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }
        
        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 12px -1px rgba(0, 0, 0, 0.15);
        }
        
        .action-icon {
          font-size: 2.5rem;
          opacity: 0.8;
        }
        
        .action-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }
        
        .action-desc {
          color: #6b7280;
          font-size: 0.9rem;
        }
        
        .recent-activity h2 {
          margin-bottom: 1.5rem;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .activity-list {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .activity-item:last-child {
          border-bottom: none;
        }
        
        .activity-icon {
          font-size: 1.5rem;
          opacity: 0.7;
        }
        
        .activity-content {
          flex: 1;
        }
        
        .activity-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }
        
        .activity-details {
          color: #6b7280;
          font-size: 0.9rem;
        }
        
        .activity-status {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .activity-status.pending {
          background: #fef3c7;
          color: #d97706;
        }
        
        .activity-status.confirmed {
          background: #d1fae5;
          color: #059669;
        }
        
        .activity-status.cancelled {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .activity-status.completed {
          background: #dbeafe;
          color: #2563eb;
        }
        
        .no-activity {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }
        
        .no-activity-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        @media (max-width: 768px) {
          .staff-dashboard {
            padding: 1rem;
          }
          
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .user-badge {
            align-items: center;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
