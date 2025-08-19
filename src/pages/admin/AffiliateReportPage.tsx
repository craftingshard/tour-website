import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore'
import { db } from '../../firebase'

export function AffiliateReportPage() {
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>('all')
  const [dateRange, setDateRange] = useState('month')
  const [stats, setStats] = useState({
    totalAffiliates: 0,
    activeAffiliates: 0,
    totalEarnings: 0,
    totalPaid: 0,
    totalPending: 0,
    totalBookings: 0,
    totalCommission: 0
  })

  useEffect(() => {
    loadData()
  }, [dateRange])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load affiliates
      const affiliatesQuery = query(
        collection(db, 'affiliates'),
        orderBy('totalEarnings', 'desc')
      )
      const affiliatesSnapshot = await getDocs(affiliatesQuery)
      const affiliatesData = affiliatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAffiliates(affiliatesData)

      // Load bookings
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('affiliateId', '!=', null),
        orderBy('bookingDate', 'desc')
      )
      const bookingsSnapshot = await getDocs(bookingsQuery)
      const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setBookings(bookingsData)

      // Calculate stats
      const totalAffiliates = affiliatesData.length
      const activeAffiliates = affiliatesData.filter(a => a.status === 'active').length
      const totalEarnings = affiliatesData.reduce((sum, a) => sum + (a.totalEarnings || 0), 0)
      const totalPaid = affiliatesData.reduce((sum, a) => sum + (a.paidAmount || 0), 0)
      const totalPending = affiliatesData.reduce((sum, a) => sum + (a.pendingAmount || 0), 0)
      const totalBookings = bookingsData.length
      const totalCommission = bookingsData.reduce((sum, b) => sum + (b.commission || 0), 0)

      setStats({
        totalAffiliates,
        activeAffiliates,
        totalEarnings,
        totalPaid,
        totalPending,
        totalBookings,
        totalCommission
      })

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredBookings = () => {
    if (selectedAffiliate === 'all') {
      return bookings
    }
    return bookings.filter(b => b.affiliateId === selectedAffiliate)
  }

  const getAffiliateById = (id: string) => {
    return affiliates.find(a => a.id === id)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'inactive': return '#6b7280'
      case 'suspended': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động'
      case 'inactive': return 'Không hoạt động'
      case 'suspended': return 'Tạm ngưng'
      default: return 'Không xác định'
    }
  }

  const getPaymentStatusColor = (paid: boolean) => {
    return paid ? '#10b981' : '#f59e0b'
  }

  const getPaymentStatusText = (paid: boolean) => {
    return paid ? 'Đã thanh toán' : 'Chưa thanh toán'
  }

  return (
    <div className="affiliate-report">
      <div className="report-header">
        <h1>📊 Báo Cáo Affiliate</h1>
        <p>Quản lý và theo dõi hiệu suất của các đối tác affiliate</p>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🤝</div>
          <div className="stat-content">
            <h3>{loading ? '...' : stats.totalAffiliates}</h3>
            <p>Tổng đối tác</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{loading ? '...' : stats.activeAffiliates}</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{loading ? '...' : formatCurrency(stats.totalEarnings)}</h3>
            <p>Tổng thu nhập</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <h3>{loading ? '...' : formatCurrency(stats.totalPaid)}</h3>
            <p>Đã thanh toán</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{loading ? '...' : formatCurrency(stats.totalPending)}</h3>
            <p>Chờ thanh toán</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{loading ? '...' : stats.totalBookings}</h3>
            <p>Tổng đặt tour</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{loading ? '...' : formatCurrency(stats.totalCommission)}</h3>
            <p>Tổng hoa hồng</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{loading ? '...' : stats.totalAffiliates > 0 ? Math.round((stats.activeAffiliates / stats.totalAffiliates) * 100) : 0}%</h3>
            <p>Tỷ lệ hoạt động</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Lọc theo đối tác:</label>
          <select 
            value={selectedAffiliate} 
            onChange={(e) => setSelectedAffiliate(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả đối tác</option>
            {affiliates.map(affiliate => (
              <option key={affiliate.id} value={affiliate.id}>
                {affiliate.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Khoảng thời gian:</label>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="filter-select"
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
            <option value="all">Tất cả</option>
          </select>
        </div>
      </div>

      {/* Affiliates Performance */}
      <div className="performance-section">
        <h2>🏆 Hiệu Suất Đối Tác</h2>
        <div className="affiliates-table">
          {loading ? (
            <div className="loading">🔄 Đang tải dữ liệu...</div>
          ) : (
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Đối tác</th>
                  <th>Hoa hồng</th>
                  <th>Thu nhập</th>
                  <th>Đã thanh toán</th>
                  <th>Chờ thanh toán</th>
                  <th>Số đặt tour</th>
                  <th>Tỷ lệ chuyển đổi</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map(affiliate => (
                  <tr key={affiliate.id} className="affiliate-row">
                    <td className="affiliate-info">
                      <div className="affiliate-name">{affiliate.name}</div>
                      <div className="affiliate-contact">{affiliate.contactPerson} - {affiliate.contactPhone}</div>
                    </td>
                    <td className="commission">{affiliate.commission}%</td>
                    <td className="earnings">{formatCurrency(affiliate.totalEarnings || 0)}</td>
                    <td className="paid">{formatCurrency(affiliate.paidAmount || 0)}</td>
                    <td className="pending">{formatCurrency(affiliate.pendingAmount || 0)}</td>
                    <td className="bookings">{affiliate.totalBookings || 0}</td>
                    <td className="conversion">{affiliate.conversionRate || 0}%</td>
                    <td className="status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(affiliate.status) }}
                      >
                        {getStatusText(affiliate.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bookings-section">
        <h2>📅 Đặt Tour Gần Đây</h2>
        <div className="bookings-table">
          {loading ? (
            <div className="loading">🔄 Đang tải dữ liệu...</div>
          ) : (
            <table className="bookings-table-content">
              <thead>
                <tr>
                  <th>Tour</th>
                  <th>Khách hàng</th>
                  <th>Đối tác</th>
                  <th>Số tiền</th>
                  <th>Hoa hồng</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredBookings().slice(0, 20).map(booking => (
                  <tr key={booking.id} className="booking-row">
                    <td className="tour-info">
                      <div className="tour-name">{booking.tourName}</div>
                      <div className="tour-details">{booking.numberOfPeople} người</div>
                    </td>
                    <td className="customer-info">
                      <div className="customer-name">{booking.customerName}</div>
                      <div className="customer-email">{booking.customerEmail}</div>
                    </td>
                    <td className="affiliate-name">
                      {booking.affiliateName || 'Trực tiếp'}
                    </td>
                    <td className="amount">{formatCurrency(booking.amount || 0)}</td>
                    <td className="commission">{formatCurrency(booking.commission || 0)}</td>
                    <td className="booking-date">{formatDate(booking.bookingDate)}</td>
                    <td className="status">
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status === 'confirmed' ? '✅ Xác nhận' : 
                         booking.status === 'cancelled' ? '❌ Hủy' : '⏳ Chờ xác nhận'}
                      </span>
                    </td>
                    <td className="payment">
                      <span 
                        className="payment-badge"
                        style={{ backgroundColor: getPaymentStatusColor(booking.paid) }}
                      >
                        {getPaymentStatusText(booking.paid)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        .affiliate-report {
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
        
        .report-header {
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
        
        .report-header h1 {
          font-size: 2.5rem;
          color: #1f2937;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .report-header p {
          font-size: 1.1rem;
          color: #6b7280;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
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

        .filters-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 32px;
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          align-items: center;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .filter-group label {
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }

        .filter-select {
          padding: 8px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          background: white;
          min-width: 200px;
        }

        .filter-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .performance-section,
        .bookings-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 32px;
          animation: slideInUp 0.8s ease-out;
        }

        .performance-section h2,
        .bookings-section h2 {
          color: #1f2937;
          margin: 0 0 24px 0;
          font-size: 1.5rem;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #6b7280;
          font-size: 1.1rem;
        }

        .performance-table,
        .bookings-table-content {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        .performance-table th,
        .bookings-table-content th {
          background: #f9fafb;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }

        .performance-table td,
        .bookings-table-content td {
          padding: 16px 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }

        .affiliate-row:hover,
        .booking-row:hover {
          background: #f9fafb;
        }

        .affiliate-info,
        .tour-info,
        .customer-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .affiliate-name,
        .tour-name,
        .customer-name {
          font-weight: 600;
          color: #1f2937;
        }

        .affiliate-contact,
        .tour-details,
        .customer-email {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .commission,
        .earnings,
        .paid,
        .pending,
        .amount {
          font-weight: 600;
          color: #059669;
        }

        .bookings,
        .conversion {
          text-align: center;
          font-weight: 600;
          color: #1f2937;
        }

        .status-badge,
        .payment-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          color: white;
          text-align: center;
          display: inline-block;
          min-width: 80px;
        }

        .status-badge.confirmed {
          background: #10b981;
        }

        .status-badge.pending {
          background: #f59e0b;
        }

        .status-badge.cancelled {
          background: #ef4444;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-select {
            min-width: auto;
          }
          
          .performance-table,
          .bookings-table-content {
            font-size: 0.75rem;
          }
          
          .performance-table th,
          .performance-table td,
          .bookings-table-content th,
          .bookings-table-content td {
            padding: 8px 6px;
          }
        }
      `}</style>
    </div>
  )
}
