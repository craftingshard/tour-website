import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import { useApp } from '../context/AppProviders'

export function PartnerDashboard() {
  const { user } = useApp()
  const navigate = useNavigate()
  const [partnerTours, setPartnerTours] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTourFilter, setSelectedTourFilter] = useState<string>('all')
  const [selectedBookingFilter, setSelectedBookingFilter] = useState<string>('all')

  useEffect(() => {
    if (user?.uid) {
      loadPartnerData()
    }
  }, [user?.uid])

  const loadPartnerData = async () => {
    try {
      setLoading(true)
      
      // Load partner's tours
      const toursQuery = query(
        collection(db, 'TOURS'),
        where('createdBy', '==', user?.uid),
        orderBy('createdAt', 'desc')
      )
      const toursSnapshot = await getDocs(toursQuery)
      const toursData = toursSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setPartnerTours(toursData)

      // Load bookings for partner's tours
      const tourIds = toursData.map(tour => tour.id)
      if (tourIds.length > 0) {
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('tourId', 'in', tourIds)
        )
        const bookingsSnapshot = await getDocs(bookingsQuery)
        const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setBookings(bookingsData)
      }
    } catch (error) {
      console.error('Error loading partner data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredTours = () => {
    if (selectedTourFilter === 'all') return partnerTours
    if (selectedTourFilter === 'approved') return partnerTours.filter(tour => tour.approved)
    if (selectedTourFilter === 'pending') return partnerTours.filter(tour => !tour.approved)
    return partnerTours
  }

  const getFilteredBookings = () => {
    let filtered = bookings
    if (selectedBookingFilter === 'confirmed') {
      filtered = filtered.filter(booking => booking.paid && booking.status === 'confirmed')
    } else if (selectedBookingFilter === 'pending') {
      filtered = filtered.filter(booking => !booking.paid || booking.status === 'pending')
    } else if (selectedBookingFilter === 'cancelled') {
      filtered = filtered.filter(booking => booking.status === 'cancelled')
    } else if (selectedBookingFilter === 'completed') {
      filtered = filtered.filter(booking => booking.status === 'completed')
    }
    return filtered
  }

  const getStatusLabel = (tour: any) => {
    if (tour.approved) {
      return { label: 'Đã duyệt', color: '#10b981', bg: '#f0fdf4' }
    } else {
      return { label: 'Chờ duyệt', color: '#f59e0b', bg: '#fffbeb' }
    }
  }

  const getBookingStatusLabel = (booking: any) => {
    if (booking.status === 'cancelled') {
      return { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2' }
    } else if (booking.paid && booking.status === 'confirmed') {
      return { label: 'Đã xác nhận thanh toán', color: '#10b981', bg: '#f0fdf4' }
    } else if (booking.status === 'completed') {
      return { label: 'Hoàn thành', color: '#3b82f6', bg: '#eff6ff' }
    } else if (!booking.paid || booking.status === 'pending') {
      return { label: 'Chờ xác nhận', color: '#f59e0b', bg: '#fffbeb' }
    }
    return { label: 'Không xác định', color: '#6b7280', bg: '#f9fafb' }
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

  const filteredTours = getFilteredTours()
  const filteredBookings = getFilteredBookings()

  // Statistics
  const stats = {
    totalTours: partnerTours.length,
    approvedTours: partnerTours.filter(t => t.approved).length,
    pendingTours: partnerTours.filter(t => !t.approved).length,
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.paid && b.status === 'confirmed').length,
    pendingBookings: bookings.filter(b => !b.paid || b.status === 'pending').length,
    totalRevenue: bookings
      .filter(b => b.paid && b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.amount || 0), 0)
  }

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
      <div className="dashboard-header">
        <h2>🤝 Bảng điều khiển đối tác</h2>
        <button 
          className="btn primary"
          onClick={() => navigate('/admin')}
        >
          ➕ Tạo tour mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalTours}</div>
            <div className="stat-label">Tổng số tour</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.approvedTours}</div>
            <div className="stat-label">Tour đã duyệt</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{stats.pendingTours}</div>
            <div className="stat-label">Tour chờ duyệt</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-label">Tổng doanh thu</div>
          </div>
        </div>
      </div>

      {/* Tours Section */}
      <div className="section">
        <div className="section-header">
          <h3>📋 Danh sách tour của bạn</h3>
          <select 
            value={selectedTourFilter} 
            onChange={(e) => setSelectedTourFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả tour</option>
            <option value="approved">Đã duyệt</option>
            <option value="pending">Chờ duyệt</option>
          </select>
        </div>
        
        {filteredTours.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có tour nào.</p>
            <button 
              className="btn primary"
              onClick={() => navigate('/admin')}
            >
              ➕ Tạo tour đầu tiên
            </button>
          </div>
        ) : (
          <div className="tours-grid">
            {filteredTours.map(tour => {
              const status = getStatusLabel(tour)
              return (
                <div key={tour.id} className="tour-card">
                  <div className="tour-header">
                    <h4>{tour.name || tour.title}</h4>
                    <span 
                      className="status-badge"
                      style={{ color: status.color, backgroundColor: status.bg }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="tour-details">
                    <p>📍 {tour.location}</p>
                    <p>💰 {formatCurrency(tour.price || 0)}</p>
                    <p>⭐ {tour.rating?.toFixed(1) || 'Chưa có đánh giá'}</p>
                  </div>
                  <div className="tour-actions">
                    <button 
                      className="btn small primary"
                      onClick={() => navigate(`/admin?edit=${tour.id}`)}
                    >
                      ✏️ Chỉnh sửa
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Bookings Section */}
      <div className="section">
        <div className="section-header">
          <h3>📋 Đơn đặt tour</h3>
          <select 
            value={selectedBookingFilter} 
            onChange={(e) => setSelectedBookingFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả đơn</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="cancelled">Đã hủy</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>
        
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có đơn đặt tour nào.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map(booking => {
              const tour = partnerTours.find(t => t.id === booking.tourId)
              const status = getBookingStatusLabel(booking)
              return (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <h4>{tour?.name || tour?.title || 'Tour không xác định'}</h4>
                    <span 
                      className="status-badge"
                      style={{ color: status.color, backgroundColor: status.bg }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="booking-details">
                    <p>👤 Khách: {booking.customerName || 'Không xác định'}</p>
                    <p>📞 SĐT: {booking.customerPhone || 'Không có'}</p>
                    <p>📧 Email: {booking.customerEmail || 'Không có'}</p>
                    <p>👥 Số người: {booking.people || booking.numberOfPeople || 1}</p>
                    <p>💰 Số tiền: {formatCurrency(booking.amount || 0)}</p>
                    <p>📅 Ngày đi: {formatDate(booking.startDate || booking.travelDate)}</p>
                    <p>📅 Ngày đặt: {formatDate(booking.bookingDate || booking.createdAt)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <style>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          font-size: 32px;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
        }

        .section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h3 {
          margin: 0;
          color: #1f2937;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
        }

        .tours-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .tour-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }

        .tour-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .tour-header h4 {
          margin: 0;
          font-size: 16px;
          color: #1f2937;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        .tour-details p {
          margin: 4px 0;
          font-size: 14px;
          color: #6b7280;
        }

        .tour-actions {
          margin-top: 12px;
        }

        .bookings-list {
          display: grid;
          gap: 16px;
        }

        .booking-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .booking-header h4 {
          margin: 0;
          font-size: 16px;
          color: #1f2937;
        }

        .booking-details p {
          margin: 4px 0;
          font-size: 14px;
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }

        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn.primary {
          background: #3b82f6;
          color: white;
        }

        .btn.primary:hover {
          background: #2563eb;
        }

        .btn.small {
          padding: 4px 8px;
          font-size: 12px;
        }

        .loading-section {
          text-align: center;
          padding: 40px;
        }

        .loading-spinner {
          font-size: 32px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
