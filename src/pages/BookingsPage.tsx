import { useApp } from '../context/AppProviders'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'

export function BookingsPage() {
  const { user: currentUser } = useApp()
  const { tours } = useApp()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    if (currentUser?.uid) {
      loadUserBookings()
    }
  }, [currentUser?.uid])

  const loadUserBookings = async () => {
    try {
      setLoading(true)
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', currentUser?.uid)
      )
      const snapshot = await getDocs(bookingsQuery)
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]
      // Sort by createdAt in memory to avoid Firestore index requirement
      bookingsData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      setBookings(bookingsData)
    } catch (error) {
      console.error('Error loading bookings:', error)
      setError('Không thể tải danh sách đặt tour')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredBookings = () => {
    if (selectedStatus === 'all') {
      return bookings
    }
    return bookings.filter(booking => {
      if (selectedStatus === 'confirmed_payment') {
        return booking.paid && booking.status === 'confirmed'
      } else if (selectedStatus === 'pending_confirmation') {
        return !booking.paid || booking.status === 'pending'
      } else if (selectedStatus === 'cancelled') {
        return booking.status === 'cancelled' || booking.status === 'refunded'
      } else if (selectedStatus === 'completed') {
        return booking.status === 'completed'
      }
      return true
    })
  }

  const getStatusLabel = (booking: any) => {
    if (booking.status === 'cancelled' || booking.status === 'refunded') {
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

  const getTourById = (tourId: string) => {
    return tours.find(t => t.id === tourId)
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

  const filteredBookings = getFilteredBookings()

  // Count bookings by status
  const statusCounts = {
    all: bookings.length,
    confirmed_payment: bookings.filter(b => b.paid && b.status === 'confirmed').length,
    pending_confirmation: bookings.filter(b => !b.paid || b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled' || b.status === 'refunded').length,
    completed: bookings.filter(b => b.status === 'completed').length
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-section">
          <div className="loading-spinner">🔄</div>
          <p>Đang tải danh sách đặt tour...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h2>Tour đã đặt</h2>
      
      {error && <div className="muted" style={{color:'#fca5a5'}}>{error}</div>}
      
      {bookings.length === 0 ? (
        <div className="muted">Chưa có tour nào.</div>
      ) : (
        <>
          {/* Status Filter Tabs */}
          <div className="status-tabs">
            <button 
              className={`status-tab ${selectedStatus === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              Tất cả ({statusCounts.all})
            </button>
            <button 
              className={`status-tab ${selectedStatus === 'confirmed_payment' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('confirmed_payment')}
            >
              Đã xác nhận thanh toán ({statusCounts.confirmed_payment})
            </button>
            <button 
              className={`status-tab ${selectedStatus === 'pending_confirmation' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('pending_confirmation')}
            >
              Chờ xác nhận ({statusCounts.pending_confirmation})
            </button>
            <button 
              className={`status-tab ${selectedStatus === 'cancelled' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('cancelled')}
            >
              Đã hủy ({statusCounts.cancelled})
            </button>
            <button 
              className={`status-tab ${selectedStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('completed')}
            >
              Hoàn thành ({statusCounts.completed})
            </button>
          </div>

          {/* Bookings List */}
          <div className="bookings-section">
            {filteredBookings.length === 0 ? (
              <div className="no-bookings">
                <p>Không có tour nào trong danh mục này.</p>
              </div>
            ) : (
              <div className="bookings-grid">
                {filteredBookings.map(booking => {
                  const tour = getTourById(booking.tourId)
                  const status = getStatusLabel(booking)
                  
                  return (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-header">
                        <div className="tour-title">{tour?.title || booking.tourName || 'Tour không xác định'}</div>
                        <div 
                          className="status-badge"
                          style={{ 
                            color: status.color, 
                            backgroundColor: status.bg,
                            border: `1px solid ${status.color}`
                          }}
                        >
                          {status.label}
                        </div>
                      </div>
                      
                      <div className="booking-details">
                        <div className="detail-row">
                          <span className="detail-label">📍 Địa điểm:</span>
                          <span className="detail-value">{tour?.location || booking.location || 'Không xác định'}</span>
                        </div>
                        
                        <div className="detail-row">
                          <span className="detail-label">💰 Giá tour:</span>
                          <span className="detail-value">{formatCurrency(booking.amount || 0)}</span>
                        </div>
                        
                        <div className="detail-row">
                          <span className="detail-label">👥 Số người:</span>
                          <span className="detail-value">{booking.people || booking.numberOfPeople || 1} người</span>
                        </div>
                        
                        <div className="detail-row">
                          <span className="detail-label">📅 Ngày đặt:</span>
                          <span className="detail-value">{formatDate(booking.createdAt)}</span>
                        </div>
                        
                        {booking.startDate && (
                          <div className="detail-row">
                            <span className="detail-label">🚀 Ngày khởi hành:</span>
                            <span className="detail-value">{formatDate(booking.startDate)}</span>
                          </div>
                        )}
                        
                        {booking.paymentMethod && (
                          <div className="detail-row">
                            <span className="detail-label">💳 Phương thức:</span>
                            <span className="detail-value">
                              {booking.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 
                               booking.paymentMethod === 'cash' ? 'Tiền mặt' : 
                               booking.paymentMethod === 'pay_later' ? 'Thanh toán sau' : booking.paymentMethod}
                            </span>
                          </div>
                        )}
                        
                        {booking.notes && (
                          <div className="detail-row">
                            <span className="detail-label">📝 Ghi chú:</span>
                            <span className="detail-value">{booking.notes}</span>
                          </div>
                        )}
                      </div>
                      
                      {booking.status !== 'cancelled' && booking.status !== 'refunded' && booking.status !== 'completed' && (
                        <div className="booking-actions">
                          <button 
                            className="btn danger" 
                            onClick={async () => {
                              setError(null)
                              try {
                                // Here you would implement the cancel booking logic
                                // For now, just show a message
                                alert('Chức năng hủy tour sẽ được cập nhật sớm')
                              } catch(e: any) {
                                setError(e?.message || 'Hủy không thành công')
                              }
                            }}
                          >
                            ❌ Hủy tour
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        .loading-section {
          text-align: center;
          padding: 40px;
        }
        
        .loading-spinner {
          font-size: 2rem;
          margin-bottom: 16px;
        }
        
        .status-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 16px;
        }
        
        .status-tab {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .status-tab:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }
        
        .status-tab.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        
        .bookings-section {
          margin-top: 24px;
        }
        
        .no-bookings {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }
        
        .bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        
        .booking-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
        }
        
        .booking-card:hover {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          gap: 12px;
        }
        
        .tour-title {
          font-weight: 600;
          font-size: 1.1rem;
          color: #1f2937;
          flex: 1;
        }
        
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }
        
        .booking-details {
          margin-bottom: 16px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          font-weight: 500;
          color: #6b7280;
          font-size: 0.875rem;
        }
        
        .detail-value {
          color: #1f2937;
          font-size: 0.875rem;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }
        
        .booking-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn.danger {
          background: #ef4444;
          color: white;
        }
        
        .btn.danger:hover {
          background: #dc2626;
        }
        
        @media (max-width: 768px) {
          .status-tabs {
            flex-direction: column;
          }
          
          .status-tab {
            text-align: center;
          }
          
          .bookings-grid {
            grid-template-columns: 1fr;
          }
          
          .booking-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .detail-value {
            text-align: left;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  )
}


