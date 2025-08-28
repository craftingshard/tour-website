import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, limit, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAdmin } from '../../context/AdminProviders'

export function Dashboard() {
  const { hasPermission } = useAdmin()
  const [stats, setStats] = useState({
    tours: 0,
    posts: 0,
    customers: 0,
    staff: 0,
    totalBookings: 0,
    totalRevenue: 0,
    affiliateRevenue: 0,
    affiliatePayments: 0,
    pendingAffiliatePayments: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [topAffiliates, setTopAffiliates] = useState<any[]>([])
  const [latestComments, setLatestComments] = useState<Array<{ id: string; source: 'review' | 'post'; content: string; title: string; targetId: string }>>([])

  useEffect(() => {
    loadStats()
    loadRecentBookings()
    loadTopAffiliates()
    loadLatestComments()
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

      // Count bookings and calculate revenue
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'))
      const totalBookings = bookingsSnapshot.size
      let totalRevenue = 0
      let affiliateRevenue = 0
      
      bookingsSnapshot.forEach(doc => {
        const booking = doc.data()
        if (booking.amount && booking.paid) {
          totalRevenue += booking.amount
          if (booking.affiliateId) {
            affiliateRevenue += booking.amount
          }
        }
      })

      // Calculate affiliate payments
      const affiliatesSnapshot = await getDocs(collection(db, 'affiliates'))
      let affiliatePayments = 0
      let pendingAffiliatePayments = 0
      
      affiliatesSnapshot.forEach(doc => {
        const affiliate = doc.data()
        if (affiliate.totalEarnings) {
          affiliatePayments += affiliate.paidAmount || 0
          pendingAffiliatePayments += (affiliate.totalEarnings - (affiliate.paidAmount || 0))
        }
      })
      
      setStats({
        tours: toursCount,
        posts: postsCount,
        customers: customersCount,
        staff: staffCount,
        totalBookings,
        totalRevenue,
        affiliateRevenue,
        affiliatePayments,
        pendingAffiliatePayments
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLatestComments = async () => {
    try {
      // Fetch reviews (tour comments)
      const rSnap = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt','desc'), limit(10)))
      const reviews = rSnap.docs.map(d => ({
        id: d.id,
        source: 'review' as const,
        content: (d.data() as any).comment || '',
        title: (d.data() as any).tourTitle || 'Tour',
        targetId: (d.data() as any).tourId || ''
      }))

      // Fetch post comments
      const pSnap = await getDocs(query(collection(db, 'post_comments'), orderBy('createdAt','desc'), limit(10)))
      const posts = pSnap.docs.map(d => ({
        id: d.id,
        source: 'post' as const,
        content: (d.data() as any).comment || '',
        title: (d.data() as any).postTitle || 'Bài viết',
        targetId: (d.data() as any).postId || ''
      }))

      const merged = [...reviews, ...posts]
        .sort((a,b)=> (a as any).createdAt > (b as any).createdAt ? -1 : 1)
        .slice(0,10)
      setLatestComments(merged)
    } catch (e) {
      console.warn('Failed to load latest comments', e)
    }
  }

  const handleDeleteComment = async (row: { id: string; source: 'review' | 'post' }) => {
    if (!hasPermission('delete', row.source === 'review' ? 'reviews' : 'post_comments')) return
    const coll = row.source === 'review' ? 'reviews' : 'post_comments'
    await deleteDoc(doc(db, coll, row.id))
    await loadLatestComments()
  }

  const loadRecentBookings = async () => {
    try {
      const bookingsQuery = query(
        collection(db, 'bookings'),
        orderBy('bookingDate', 'desc'),
        limit(5)
      )
      const snapshot = await getDocs(bookingsQuery)
      const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setRecentBookings(bookings)
    } catch (error) {
      console.error('Error loading recent bookings:', error)
    }
  }

  const loadTopAffiliates = async () => {
    try {
      const affiliatesQuery = query(
        collection(db, 'affiliates'),
        orderBy('totalEarnings', 'desc'),
        limit(5)
      )
      const snapshot = await getDocs(affiliatesQuery)
      const affiliates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTopAffiliates(affiliates)
    } catch (error) {
      console.error('Error loading top affiliates:', error)
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

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{loading ? '...' : stats.totalBookings}</h3>
            <p>Đặt tour</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{loading ? '...' : stats.totalRevenue.toLocaleString('vi-VN')}đ</h3>
            <p>Doanh thu</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🤝</div>
          <div className="stat-content">
            <h3>{loading ? '...' : stats.affiliateRevenue.toLocaleString('vi-VN')}đ</h3>
            <p>Doanh thu affiliate</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <h3>{loading ? '...' : stats.pendingAffiliatePayments.toLocaleString('vi-VN')}đ</h3>
            <p>Chưa thanh toán</p>
          </div>
        </div>
      </div>

      {/* Recent Activity & Reports */}
      <div className="reports-section">
        <div className="reports-grid">
          {/* Recent Bookings */}
          <div className="report-card">
            <h3>📅 Đặt Tour Gần Đây</h3>
            <div className="report-content">
              {recentBookings.length === 0 ? (
                <p className="no-data">Chưa có đặt tour nào</p>
              ) : (
                <div className="recent-list">
                  {recentBookings.map(booking => (
                    <div key={booking.id} className="recent-item">
                      <div className="item-main">
                        <strong>{booking.tourName || 'Tour không xác định'}</strong>
                        <span className="item-customer">{booking.customerName || 'Khách không xác định'}</span>
                      </div>
                      <div className="item-details">
                        <span className="amount">{booking.amount?.toLocaleString('vi-VN')}đ</span>
                        <span className={`status ${booking.status || 'pending'}`}>
                          {booking.status === 'confirmed' ? '✅ Xác nhận' : 
                           booking.status === 'cancelled' ? '❌ Hủy' : '⏳ Chờ xác nhận'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Affiliates */}
          <div className="report-card">
            <h3>🏆 Thành viên Affiliate Hàng Đầu</h3>
            <div className="report-content">
              {topAffiliates.length === 0 ? (
                <p className="no-data">Chưa có Thành viên affiliate nào</p>
              ) : (
                <div className="affiliates-list">
                  {topAffiliates.map(affiliate => (
                    <div key={affiliate.id} className="affiliate-item">
                      <div className="item-main">
                        <strong>{affiliate.name}</strong>
                        <span className="item-commission">{affiliate.commission}% hoa hồng</span>
                      </div>
                      <div className="item-details">
                        <span className="earnings">{affiliate.totalEarnings?.toLocaleString('vi-VN')}đ</span>
                        <span className={`status ${affiliate.status || 'active'}`}>
                          {affiliate.status === 'active' ? '✅ Hoạt động' : '❌ Không hoạt động'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Latest Comments */}
          <div className="report-card">
            <h3>💬 10 bình luận gần nhất</h3>
            <div className="report-content">
              {latestComments.length === 0 ? (
                <p className="no-data">Chưa có bình luận nào</p>
              ) : (
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%', borderCollapse:'collapse'}}>
                    <thead>
                      <tr>
                        <th style={{textAlign:'left', padding:'8px'}}>STT</th>
                        <th style={{textAlign:'left', padding:'8px'}}>Nội dung comment</th>
                        <th style={{textAlign:'left', padding:'8px'}}>Tên POST or TOUR</th>
                        <th style={{textAlign:'left', padding:'8px'}}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestComments.map((c, idx) => (
                        <tr key={`${c.source}-${c.id}`}>
                          <td style={{padding:'8px'}}>{idx + 1}</td>
                          <td style={{padding:'8px', maxWidth:400, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.content}</td>
                          <td style={{padding:'8px'}}>
                            {c.source === 'review' ? (
                              <a href={`#/tours/${c.targetId}`} style={{color:'#3b82f6'}}>Tour: {c.title || c.targetId}</a>
                            ) : (
                              <a href={`#/posts/${c.targetId}`} style={{color:'#3b82f6'}}>Post: {c.title || c.targetId}</a>
                            )}
                          </td>
                          <td style={{padding:'8px'}}>
                            {hasPermission('delete', c.source === 'review' ? 'reviews' : 'post_comments') && (
                              <button className="btn" onClick={() => handleDeleteComment(c)}>Xóa</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>



      <style>{`
        .dashboard {
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
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
        .stat-card:nth-child(5) { animation-delay: 0.5s; }
        .stat-card:nth-child(6) { animation-delay: 0.6s; }
        .stat-card:nth-child(7) { animation-delay: 0.7s; }
        .stat-card:nth-child(8) { animation-delay: 0.8s; }
        
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

        .customers-btn {
          background: #10b981;
          color: white;
        }

        .staff-btn {
          background: #3b82f6;
          color: white;
        }

        .affiliates-btn {
          background: #f97316;
          color: white;
        }

        .bookings-btn {
          background: #06b6d4;
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

        .reports-section {
          margin-bottom: 32px;
        }

        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 24px;
        }

        .report-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          animation: slideInUp 0.8s ease-out;
        }

        .report-card h3 {
          color: #1f2937;
          margin: 0 0 20px 0;
          font-size: 1.25rem;
        }

        .report-content {
          min-height: 200px;
        }

        .no-data {
          color: #6b7280;
          text-align: center;
          padding: 40px 20px;
        }

        .recent-list,
        .affiliates-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .recent-item,
        .affiliate-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .item-main {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-main strong {
          color: #1f2937;
          font-size: 0.9rem;
        }

        .item-customer,
        .item-commission {
          color: #6b7280;
          font-size: 0.8rem;
        }

        .item-details {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .amount,
        .earnings {
          color: #059669;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .status {
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .status.confirmed,
        .status.active {
          background: #dcfce7;
          color: #166534;
        }

        .status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status.cancelled {
          background: #fee2e2;
          color: #991b1b;
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
          
          .reports-grid {
            grid-template-columns: 1fr;
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
