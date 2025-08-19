import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'

export function TourPerformancePage() {
  const [tours, setTours] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [dateRange, setDateRange] = useState('month')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [sortBy, setSortBy] = useState<'bookings' | 'revenue' | 'rating'>('bookings')

  useEffect(() => {
    loadData()
  }, [dateRange, selectedYear, selectedMonth])

  const loadData = async () => {
    try {
      // Load tours
      const toursQuery = query(
        collection(db, 'TOURS'),
        orderBy('name')
      )
      const toursSnapshot = await getDocs(toursQuery)
      const toursData = toursSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTours(toursData)

      // Load bookings
      const bookingsQuery = query(
        collection(db, 'bookings'),
        orderBy('bookingDate', 'desc')
      )
      const bookingsSnapshot = await getDocs(bookingsQuery)
      const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setBookings(bookingsData)

    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const getFilteredBookings = () => {
    return bookings.filter(booking => {
      if (!booking.bookingDate) return false
      
      const bookingDate = new Date(booking.bookingDate?.toDate?.() || booking.bookingDate)
      if (dateRange === 'month') {
        return bookingDate.getFullYear() === selectedYear && 
               bookingDate.getMonth() === selectedMonth - 1
      } else if (dateRange === 'quarter') {
        const quarter = Math.floor(selectedMonth / 3) + 1
        const bookingQuarter = Math.floor(bookingDate.getMonth() / 3) + 1
        return bookingDate.getFullYear() === selectedYear && bookingQuarter === quarter
      } else if (dateRange === 'year') {
        return bookingDate.getFullYear() === selectedYear
      }
      return true
    })
  }

  const getTourPerformance = () => {
    const filteredBookings = getFilteredBookings()
    
    return tours.map(tour => {
      const tourBookings = filteredBookings.filter(booking => 
        booking.tourId === tour.id || booking.tourName === tour.name
      )
      
      const totalBookings = tourBookings.length
      const totalRevenue = tourBookings.reduce((sum, b) => sum + (b.amount || 0), 0)
      const totalPeople = tourBookings.reduce((sum, b) => sum + (b.numberOfPeople || 1), 0)
      const avgRating = tour.rating || 0
      const conversionRate = totalBookings > 0 ? (totalBookings / Math.max(1, tours.length)) * 100 : 0
      
      return {
        ...tour,
        totalBookings,
        totalRevenue,
        totalPeople,
        avgRating,
        conversionRate,
        avgRevenuePerBooking: totalBookings > 0 ? totalRevenue / totalBookings : 0
      }
    }).sort((a, b) => {
      if (sortBy === 'bookings') return b.totalBookings - a.totalBookings
      if (sortBy === 'revenue') return b.totalRevenue - a.totalRevenue
      if (sortBy === 'rating') return b.avgRating - a.avgRating
      return 0
    })
  }

  const tourPerformance = getTourPerformance()
  const totalBookings = tourPerformance.reduce((sum, t) => sum + t.totalBookings, 0)
  const totalRevenue = tourPerformance.reduce((sum, t) => sum + t.totalRevenue, 0)
  const totalPeople = tourPerformance.reduce((sum, t) => sum + t.totalPeople, 0)
  const avgRating = tourPerformance.reduce((sum, t) => sum + t.avgRating, 0) / Math.max(1, tourPerformance.length)

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ'
  }

  const getMonthName = (month: number) => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ]
    return months[month - 1]
  }

  const getQuarterName = (month: number) => {
    const quarter = Math.floor(month / 3) + 1
    return `Quý ${quarter}`
  }

  const getDateRangeText = () => {
    if (dateRange === 'month') {
      return `${getMonthName(selectedMonth)} ${selectedYear}`
    } else if (dateRange === 'quarter') {
      return `${getQuarterName(selectedMonth)} ${selectedYear}`
    } else if (dateRange === 'year') {
      return `Năm ${selectedYear}`
    }
    return 'Tất cả thời gian'
  }

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    return (
      <div className="rating-stars">
        {Array.from({length: fullStars}, (_, i) => (
          <span key={`full-${i}`} className="star full">⭐</span>
        ))}
        {hasHalfStar && <span className="star half">⭐</span>}
        {Array.from({length: emptyStars}, (_, i) => (
          <span key={`empty-${i}`} className="star empty">☆</span>
        ))}
        <span className="rating-number">({rating.toFixed(1)})</span>
      </div>
    )
  }

  return (
    <div className="tour-performance">
      <div className="page-header">
        <h1>📊 Báo Cáo Hiệu Suất Tour</h1>
        <p>Phân tích hiệu suất và thống kê đặt tour theo từng tour</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Khoảng thời gian:</label>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="filter-select"
          >
            <option value="month">Tháng</option>
            <option value="quarter">Quý</option>
            <option value="year">Năm</option>
            <option value="all">Tất cả</option>
          </select>
        </div>

        {dateRange === 'month' && (
          <>
            <div className="filter-group">
              <label>Tháng:</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="filter-select"
              >
                {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{getMonthName(month)}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Năm:</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="filter-select"
              >
                {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {dateRange === 'quarter' && (
          <>
            <div className="filter-group">
              <label>Quý:</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="filter-select"
              >
                <option value={1}>Quý 1 (Tháng 1-3)</option>
                <option value={4}>Quý 2 (Tháng 4-6)</option>
                <option value={7}>Quý 3 (Tháng 7-9)</option>
                <option value={10}>Quý 4 (Tháng 10-12)</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Năm:</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="filter-select"
              >
                {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {dateRange === 'year' && (
          <div className="filter-group">
            <label>Năm:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="filter-select"
            >
              {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-group">
          <label>Sắp xếp theo:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="filter-select"
          >
            <option value="bookings">Số đặt tour</option>
            <option value="revenue">Doanh thu</option>
            <option value="rating">Đánh giá</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏖️</div>
          <div className="stat-content">
            <h3>{tours.length}</h3>
            <p>Tổng số tour</p>
            <span className="period">Hiện có</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{totalBookings}</h3>
            <p>Tổng đặt tour</p>
            <span className="period">{getDateRangeText()}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Tổng doanh thu</p>
            <span className="period">{getDateRangeText()}</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{totalPeople}</h3>
            <p>Tổng khách</p>
            <span className="period">{getDateRangeText()}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{avgRating.toFixed(1)}</h3>
            <p>Đánh giá TB</p>
            <span className="period">Tất cả tour</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{totalBookings > 0 ? (totalBookings / tours.length).toFixed(1) : 0}</h3>
            <p>TB đặt tour/tour</p>
            <span className="period">{getDateRangeText()}</span>
          </div>
        </div>
      </div>

      {/* Top Performing Tours */}
      <div className="top-tours-section">
        <h2>🏆 Top Tour Hiệu Suất Cao</h2>
        <div className="top-tours-grid">
          {tourPerformance.slice(0, 6).map((tour, index) => (
            <div key={tour.id} className="tour-card">
              <div className="tour-rank">#{index + 1}</div>
              <div className="tour-image">
                <img src={tour.imageUrl || 'https://picsum.photos/300/200'} alt={tour.name} />
              </div>
              <div className="tour-info">
                <h3 className="tour-name">{tour.name}</h3>
                <p className="tour-location">{tour.location}</p>
                <div className="tour-rating">
                  {getRatingStars(tour.avgRating)}
                </div>
                <div className="tour-stats">
                  <div className="stat">
                    <span className="stat-label">Đặt tour:</span>
                    <span className="stat-value">{tour.totalBookings}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Doanh thu:</span>
                    <span className="stat-value">{formatCurrency(tour.totalRevenue)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Khách:</span>
                    <span className="stat-value">{tour.totalPeople}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Performance Table */}
      <div className="performance-table-section">
        <h2>📋 Bảng Chi Tiết Hiệu Suất</h2>
        <div className="table-container">
          <table className="performance-table">
            <thead>
              <tr>
                <th>Thứ hạng</th>
                <th>Tour</th>
                <th>Địa điểm</th>
                <th>Đánh giá</th>
                <th>Số đặt tour</th>
                <th>Doanh thu</th>
                <th>Số khách</th>
                <th>TB doanh thu/đặt</th>
                <th>Tỷ lệ chuyển đổi</th>
              </tr>
            </thead>
            <tbody>
              {tourPerformance.map((tour, index) => (
                <tr key={tour.id} className="performance-row">
                  <td className="rank">
                    <span className={`rank-badge rank-${index + 1}`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td className="tour-info">
                    <div className="tour-name">{tour.name}</div>
                    <div className="tour-category">{tour.category}</div>
                  </td>
                  <td className="location">{tour.location}</td>
                  <td className="rating">
                    {getRatingStars(tour.avgRating)}
                  </td>
                  <td className="bookings">{tour.totalBookings}</td>
                  <td className="revenue">{formatCurrency(tour.totalRevenue)}</td>
                  <td className="people">{tour.totalPeople}</td>
                  <td className="avg-revenue">{formatCurrency(tour.avgRevenuePerBooking)}</td>
                  <td className="conversion">{tour.conversionRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .tour-performance {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .page-header h1 {
          font-size: 2.5rem;
          color: #1f2937;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .page-header p {
          font-size: 1.1rem;
          color: #6b7280;
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
          min-width: 150px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
          transition: all 0.3s;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .stat-icon {
          font-size: 2.5rem;
        }
        
        .stat-content h3 {
          font-size: 1.8rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }
        
        .stat-content p {
          color: #6b7280;
          margin: 0;
          font-size: 1rem;
        }
        
        .period {
          font-size: 0.875rem;
          color: #9ca3af;
          margin-top: 4px;
        }
        
        .top-tours-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 32px;
        }
        
        .top-tours-section h2 {
          color: #1f2937;
          margin: 0 0 24px 0;
        }
        
        .top-tours-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
        }
        
        .tour-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          transition: all 0.3s;
        }
        
        .tour-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .tour-rank {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #7c3aed;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.875rem;
          z-index: 1;
        }
        
        .tour-image {
          height: 200px;
          overflow: hidden;
        }
        
        .tour-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .tour-info {
          padding: 20px;
        }
        
        .tour-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }
        
        .tour-location {
          color: #6b7280;
          margin: 0 0 12px 0;
        }
        
        .tour-rating {
          margin-bottom: 16px;
        }
        
        .rating-stars {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        
        .star {
          font-size: 1rem;
        }
        
        .star.full {
          color: #fbbf24;
        }
        
        .star.half {
          color: #fbbf24;
          opacity: 0.7;
        }
        
        .star.empty {
          color: #d1d5db;
        }
        
        .rating-number {
          margin-left: 8px;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        .tour-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        
        .stat {
          text-align: center;
        }
        
        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 4px;
        }
        
        .stat-value {
          display: block;
          font-weight: 600;
          color: #1f2937;
        }
        
        .performance-table-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .performance-table-section h2 {
          color: #1f2937;
          margin: 0 0 24px 0;
        }
        
        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .performance-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          min-width: 1000px;
        }
        
        .performance-table th {
          background: #f9fafb;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }
        
        .performance-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }
        
        .performance-row:hover {
          background: #f9fafb;
        }
        
        .rank-badge {
          display: inline-block;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          color: white;
          font-weight: bold;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .rank-1 { background: #fbbf24; }
        .rank-2 { background: #9ca3af; }
        .rank-3 { background: #f97316; }
        .rank-4, .rank-5, .rank-6 { background: #6b7280; }
        
        .tour-info .tour-category {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 4px;
        }
        
        .revenue {
          font-weight: 600;
          color: #059669;
        }
        
        .bookings {
          font-weight: 600;
          color: #7c3aed;
        }
        
        .people {
          font-weight: 600;
          color: #3b82f6;
        }
        
        .avg-revenue {
          font-weight: 600;
          color: #f59e0b;
        }
        
        .conversion {
          font-weight: 600;
          color: #10b981;
        }
        
        @media (max-width: 768px) {
          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-select {
            min-width: auto;
          }
          
          .top-tours-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
