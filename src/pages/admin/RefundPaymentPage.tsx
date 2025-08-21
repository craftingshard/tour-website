import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, query, orderBy, where } from 'firebase/firestore'
import { db } from '../../firebase'

export function RefundPaymentPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [refunds, setRefunds] = useState<any[]>([])
  const [tours, setTours] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<string>('all')
  const [showRefundForm, setShowRefundForm] = useState(false)
  const [refundForm, setRefundForm] = useState({
    bookingId: '',
    tourId: '',
    tourName: '',
    customerId: '',
    customerName: '',
    customerEmail: '',
    amount: '',
    refundDate: '',
    refundMethod: 'bank_transfer',
    reference: '',
    notes: '',
    reason: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load tours for reference
      const toursQuery = query(collection(db, 'TOURS'), orderBy('name'))
      const toursSnapshot = await getDocs(toursQuery)
      const toursData = toursSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTours(toursData)
      
      // Load paid bookings that can be refunded
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('paid', '==', true),
        where('status', 'in', ['paid', 'confirmed', 'completed']),
        orderBy('createdAt', 'desc')
      )
      const bookingsSnapshot = await getDocs(bookingsQuery)
      const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setBookings(bookingsData)

      // Load refunds
      const refundsQuery = query(
        collection(db, 'refundPayments'),
        orderBy('refundDate', 'desc')
      )
      const refundsSnapshot = await getDocs(refundsQuery)
      const refundsData = refundsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setRefunds(refundsData)

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const refundData = {
        ...refundForm,
        amount: Number(refundForm.amount),
        refundDate: new Date(refundForm.refundDate),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await addDoc(collection(db, 'refundPayments'), refundData)

      // Update booking status if needed
      if (refundForm.bookingId) {
        const { updateDoc, doc } = await import('firebase/firestore')
        await updateDoc(doc(db, 'bookings', refundForm.bookingId), {
          status: 'cancelled',
          refundAmount: Number(refundForm.amount),
          refundDate: new Date(refundForm.refundDate),
          updatedAt: new Date()
        })
      }

      // Reset form and reload data
      setRefundForm({
        bookingId: '',
        tourId: '',
        tourName: '',
        customerId: '',
        customerName: '',
        customerEmail: '',
        amount: '',
        refundDate: '',
        refundMethod: 'bank_transfer',
        reference: '',
        notes: '',
        reason: ''
      })
      setShowRefundForm(false)
      loadData()
    } catch (error) {
      console.error('Error recording refund:', error)
    }
  }

  const getFilteredRefunds = () => {
    if (selectedBooking === 'all') {
      return refunds
    }
    return refunds.filter(r => r.bookingId === selectedBooking)
  }

  const getBookingById = (id: string) => {
    return bookings.find(b => b.id === id)
  }

  const getTourById = (id: string) => {
    return tours.find(t => t.id === id)
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

  const totalRefundAmount = refunds.reduce((sum, r) => sum + (r.amount || 0), 0)
  
  // Cancellation statistics
  const cancellationStats = refunds.reduce((stats: Record<string, { count: number; totalAmount: number }>, refund) => {
    const reason = refund.reason || 'other'
    if (!stats[reason]) {
      stats[reason] = { count: 0, totalAmount: 0 }
    }
    stats[reason].count++
    stats[reason].totalAmount += refund.amount || 0
    return stats
  }, {})

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'customer_request': return 'Khách hàng yêu cầu hủy'
      case 'service_issue': return 'Vấn đề dịch vụ'
      case 'overpayment': return 'Thanh toán thừa'
      case 'cancellation': return 'Tour bị hủy'
      case 'other': return 'Lý do khác'
      default: return 'Không xác định'
    }
  }

  return (
    <div className="refund-payment">
      <div className="page-header">
        <h1>💸 Quản Lý Hoàn Tiền</h1>
        <p>Ghi nhận và theo dõi các khoản hoàn tiền cho khách hàng</p>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <h3>{formatCurrency(totalRefundAmount)}</h3>
            <p>Tổng đã hoàn tiền</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{refunds.length}</h3>
            <p>Tổng giao dịch hoàn tiền</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{bookings.length}</h3>
            <p>Đơn hàng có thể hoàn tiền</p>
          </div>
        </div>
      </div>

      {/* Cancellation Statistics */}
      <div className="cancellation-stats-section">
        <h2>📊 Thống Kê Lý Do Hủy Tour</h2>
        <div className="stats-cards">
          {Object.entries(cancellationStats).map(([reason, stats]) => (
            <div key={reason} className="stat-card-small">
              <div className="stat-icon-small">📈</div>
              <div className="stat-content-small">
                <h4>{getReasonLabel(reason)}</h4>
                <p className="stat-number">{stats.count} lần</p>
                <p className="stat-amount">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refund Form */}
      <div className="refund-form-section">
        <div className="section-header">
          <h2>➕ Ghi Nhận Hoàn Tiền Mới</h2>
          <button 
            className="btn primary"
            onClick={() => setShowRefundForm(!showRefundForm)}
          >
            {showRefundForm ? '📋 Ẩn form' : '💸 Ghi nhận hoàn tiền'}
          </button>
        </div>
        
        {showRefundForm && (
          <form onSubmit={handleRefundSubmit} className="refund-form">
            <div className="form-grid">
              <div className="form-field">
                <label>Đơn hàng (tùy chọn)</label>
                <select 
                  value={refundForm.bookingId} 
                  onChange={(e) => {
                    const bookingId = e.target.value
                    const booking = getBookingById(bookingId)
                    if (booking) {
                      const tour = getTourById(booking.tourId)
                      setRefundForm({
                        ...refundForm, 
                        bookingId,
                        tourId: booking.tourId || '',
                        tourName: tour?.name || booking.tourName || '',
                        customerId: booking.userId || '',
                        customerName: booking.customerName || '',
                        customerEmail: booking.customerEmail || '',
                        amount: booking.amount ? String(booking.amount) : refundForm.amount
                      })
                    } else {
                      setRefundForm({
                        ...refundForm,
                        bookingId: '',
                        tourId: '',
                        tourName: '',
                        customerId: '',
                        customerName: '',
                        customerEmail: '',
                        amount: refundForm.amount
                      })
                    }
                  }}
                >
                  <option value="">Chọn đơn hàng (tùy chọn)</option>
                  {bookings.map(booking => {
                    const tour = getTourById(booking.tourId)
                    return (
                      <option key={booking.id} value={booking.id}>
                        {tour?.name || booking.tourName || booking.tourId} - {booking.customerName || booking.userId} - {formatCurrency(booking.amount || 0)}
                      </option>
                    )
                  })}
                </select>
              </div>
              
              <div className="form-field">
                <label>Tour *</label>
                <input 
                  type="text" 
                  value={refundForm.tourName} 
                  onChange={(e) => setRefundForm({...refundForm, tourName: e.target.value})}
                  placeholder="Tên tour"
                  required
                />
              </div>
              
              <div className="form-field">
                <label>Khách hàng *</label>
                <input 
                  type="text" 
                  value={refundForm.customerName} 
                  onChange={(e) => setRefundForm({...refundForm, customerName: e.target.value})}
                  placeholder="Tên khách hàng"
                  required
                />
              </div>
              
              <div className="form-field">
                <label>Email khách hàng</label>
                <input 
                  type="email" 
                  value={refundForm.customerEmail} 
                  onChange={(e) => setRefundForm({...refundForm, customerEmail: e.target.value})}
                  placeholder="Email khách hàng"
                />
              </div>
              
              <div className="form-field">
                <label>Số tiền hoàn *</label>
                <input 
                  type="number" 
                  value={refundForm.amount} 
                  onChange={(e) => setRefundForm({...refundForm, amount: e.target.value})}
                  placeholder="Nhập số tiền hoàn"
                  required
                />
              </div>
              
              <div className="form-field">
                <label>Ngày hoàn tiền *</label>
                <input 
                  type="date" 
                  value={refundForm.refundDate} 
                  onChange={(e) => setRefundForm({...refundForm, refundDate: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-field">
                <label>Phương thức hoàn tiền</label>
                <select 
                  value={refundForm.refundMethod} 
                  onChange={(e) => setRefundForm({...refundForm, refundMethod: e.target.value})}
                >
                  <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                  <option value="cash">Tiền mặt</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              
              <div className="form-field">
                <label>Lý do hoàn tiền *</label>
                <select 
                  value={refundForm.reason} 
                  onChange={(e) => setRefundForm({...refundForm, reason: e.target.value})}
                  required
                >
                  <option value="">Chọn lý do</option>
                  <option value="customer_request">Khách hàng yêu cầu hủy</option>
                  <option value="service_issue">Vấn đề dịch vụ</option>
                  <option value="overpayment">Khách hàng thanh toán thừa</option>
                  <option value="cancellation">Tour bị hủy</option>
                  <option value="other">Lý do khác</option>
                </select>
              </div>
              
              <div className="form-field">
                <label>Mã tham chiếu</label>
                <input 
                  type="text" 
                  value={refundForm.reference} 
                  onChange={(e) => setRefundForm({...refundForm, reference: e.target.value})}
                  placeholder="Mã giao dịch, số séc..."
                />
              </div>
              
              <div className="form-field full-width">
                <label>Ghi chú</label>
                <textarea 
                  value={refundForm.notes} 
                  onChange={(e) => setRefundForm({...refundForm, notes: e.target.value})}
                  placeholder="Ghi chú về khoản hoàn tiền..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn primary">
                💾 Ghi nhận hoàn tiền
              </button>
              <button 
                type="button" 
                className="btn secondary"
                onClick={() => setShowRefundForm(false)}
              >
                ❌ Hủy
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Lọc theo đơn hàng:</label>
          <select 
            value={selectedBooking} 
            onChange={(e) => setSelectedBooking(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả hoàn tiền</option>
            {bookings.map(booking => {
              const tour = getTourById(booking.tourId)
              return (
                <option key={booking.id} value={booking.id}>
                  {tour?.name || booking.tourName || booking.tourId} - {booking.customerName || booking.userId}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Refunds History */}
      <div className="refunds-section">
        <h2>📋 Lịch Sử Hoàn Tiền</h2>
        <div className="refunds-table">
          {loading ? (
            <div className="loading">🔄 Đang tải dữ liệu...</div>
          ) : (
            <div className="table-container">
              <table className="refunds-table-content">
                <thead>
                  <tr>
                    <th>Ngày hoàn tiền</th>
                    <th>Tour</th>
                    <th>Khách hàng</th>
                    <th>Số tiền</th>
                    <th>Lý do</th>
                    <th>Phương thức</th>
                    <th>Mã tham chiếu</th>
                    <th>Ghi chú</th>
                    <th>Người ghi nhận</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredRefunds().map(refund => (
                    <tr key={refund.id} className="refund-row">
                      <td className="refund-date">{formatDate(refund.refundDate)}</td>
                      <td className="tour-name">
                        {refund.tourName || 'Không xác định'}
                      </td>
                      <td className="customer-name">
                        {refund.customerName || 'Không xác định'}
                      </td>
                      <td className="amount">{formatCurrency(refund.amount || 0)}</td>
                      <td className="reason">
                        {getReasonLabel(refund.reason)}
                      </td>
                      <td className="refund-method">
                        {refund.refundMethod === 'bank_transfer' ? '🏦 Chuyển khoản' :
                         refund.refundMethod === 'cash' ? '💵 Tiền mặt' :
                         refund.refundMethod === 'check' ? '📄 Séc' : '📝 Khác'}
                      </td>
                      <td className="reference">{refund.reference || '-'}</td>
                      <td className="notes">{refund.notes || '-'}</td>
                      <td className="created-by">Admin</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .refund-payment {
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
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .page-header p {
          font-size: 1.1rem;
          color: #6b7280;
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
        }

        .cancellation-stats-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 32px;
        }

        .cancellation-stats-section h2 {
          color: #1f2937;
          margin: 0 0 24px 0;
        }

        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .stat-card-small {
          background: #f9fafb;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e5e7eb;
        }

        .stat-icon-small {
          font-size: 1.5rem;
        }

        .stat-content-small h4 {
          margin: 0 0 4px 0;
          font-size: 0.875rem;
          color: #374151;
          font-weight: 600;
        }

        .stat-number {
          margin: 0 0 2px 0;
          font-size: 1.25rem;
          font-weight: bold;
          color: #1f2937;
        }

        .stat-amount {
          margin: 0;
          font-size: 0.875rem;
          color: #dc2626;
          font-weight: 600;
        }
        
        .refund-form-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 32px;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .section-header h2 {
          margin: 0;
          color: #1f2937;
        }
        
        .refund-form {
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .form-field.full-width {
          grid-column: 1 / -1;
        }
        
        .form-field label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }
        
        .form-field input,
        .form-field select,
        .form-field textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        
        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #dc2626;
        }
        
        .form-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .filters-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 32px;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .filter-group label {
          font-weight: 500;
          color: #374151;
        }
        
        .filter-select {
          padding: 8px 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.875rem;
          min-width: 200px;
        }
        
        .refunds-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .refunds-section h2 {
          color: #1f2937;
          margin: 0 0 24px 0;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }
        
        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .refunds-table-content {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          min-width: 1000px;
        }
        
        .refunds-table-content th {
          background: #f9fafb;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }
        
        .refunds-table-content td {
          padding: 16px 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }
        
        .refund-row:hover {
          background: #f9fafb;
        }
        
        .amount {
          font-weight: 600;
          color: #dc2626;
        }

        .tour-name {
          font-weight: 500;
          color: #1f2937;
        }
        
        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn.primary {
          background: #dc2626;
          color: white;
        }
        
        .btn.primary:hover {
          background: #b91c1c;
        }
        
        .btn.secondary {
          background: #6b7280;
          color: white;
        }
        
        .btn.secondary:hover {
          background: #4b5563;
        }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
          }

          .stats-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
