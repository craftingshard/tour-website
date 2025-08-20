import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from '../firebase'
import { useApp } from '../context/AppProviders'

interface QuickBookingFormProps {
  tour: any
  onClose: () => void
}

interface TicketType {
  type: 'adult' | 'child' | 'senior'
  label: string
  price: number
  count: number
}

export function QuickBookingForm({ tour, onClose }: QuickBookingFormProps) {
  const navigate = useNavigate()
  const { user, bookTour, currentCustomer } = useApp()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Customer info
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  
  // Booking info
  const [travelDate, setTravelDate] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card')
  const [includeInsurance, setIncludeInsurance] = useState(false)
  
  // Ticket types
  const [tickets, setTickets] = useState<TicketType[]>([
    { type: 'adult', label: 'Người lớn', price: tour?.price || 0, count: 1 },
    { type: 'child', label: 'Trẻ em (5-12 tuổi)', price: Math.round((tour?.price || 0) * 0.7), count: 0 },
    { type: 'senior', label: 'Người cao tuổi (65+)', price: Math.round((tour?.price || 0) * 0.8), count: 0 }
  ])
  
  // Check if customer exists
  const [existingCustomer, setExistingCustomer] = useState<any>(null)

  useEffect(() => {
    // Set default travel date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setTravelDate(tomorrow.toISOString().split('T')[0])
  }, [])

  // Prefill customer info for logged-in users
  useEffect(() => {
    if (user) {
      setCustomerName(prev => prev || currentCustomer?.name || user.displayName || '')
      setCustomerEmail(prev => prev || user.email || '')
      setCustomerPhone(prev => prev || currentCustomer?.phone || '')
      setCustomerAddress(prev => prev || (currentCustomer as any)?.address || '')
    }
  }, [user, currentCustomer])

  const checkExistingCustomer = async () => {
    if (!customerEmail && !customerPhone) return
    // Only allow checking existing customers when authenticated to satisfy security rules
    if (!auth.currentUser) return
    
    try {
      let q = null
      if (customerEmail) {
        q = query(collection(db, 'customers'), where('email', '==', customerEmail))
      } else if (customerPhone) {
        q = query(collection(db, 'customers'), where('phone', '==', customerPhone))
      }
      
      if (q) {
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          const customerData = snapshot.docs[0].data()
          setExistingCustomer({
            id: snapshot.docs[0].id,
            ...customerData
          })
          // Auto-fill customer info
          setCustomerName(customerData.name || '')
          setCustomerAddress(customerData.address || '')
          setCustomerPhone(customerData.phone || customerPhone)
          setCustomerEmail(customerData.email || customerEmail)
        } else {
          setExistingCustomer(null)
        }
      }
    } catch (error) {
      console.error('Error checking customer:', error)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if ((customerEmail || customerPhone)) {
        checkExistingCustomer()
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [customerEmail, customerPhone])

  const updateTicketCount = (type: 'adult' | 'child' | 'senior', newCount: number) => {
    setTickets(prev => prev.map(ticket => 
      ticket.type === type ? { ...ticket, count: Math.max(0, newCount) } : ticket
    ))
  }

  const getTotalAmount = () => {
    const ticketsTotal = tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.count), 0)
    const insuranceCost = includeInsurance ? 50000 : 0 // 50k VND for insurance
    return ticketsTotal + insuranceCost
  }

  const getTotalPeople = () => {
    return tickets.reduce((sum, ticket) => sum + ticket.count, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const validation = validateForm()
    if (validation) {
      setError(validation)
      setIsLoading(false)
      return
    }

    try {
      let customerId = user?.uid
      let customerData = null

      // If user is not logged in, create account or use existing customer
      if (!user) {
        if (existingCustomer) {
          // Use existing customer
          customerId = existingCustomer.id
          customerData = existingCustomer
        } else {
          // Create new customer account
          const password = customerPhone || '123456' // Default password is phone number
          const userCredential = await createUserWithEmailAndPassword(auth, customerEmail, password)
          customerId = userCredential.user.uid
          
          // Save customer data
          customerData = {
            uid: customerId,
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          await setDoc(doc(db, 'customers', customerId), customerData)
        }
      }

      // Create booking
      // const bookingData = {
      //   tourId: tour.id,
      //   tourName: tour.title,
      //   customerId: customerId,
      //   customerName: customerName,
      //   customerEmail: customerEmail,
      //   customerPhone: customerPhone,
      //   tickets: tickets,
      //   totalPeople: getTotalPeople(),
      //   travelDate: new Date(travelDate),
      //   specialRequests: specialRequests,
      //   paymentMethod: paymentMethod,
      //   includeInsurance: includeInsurance,
      //   amount: getTotalAmount(),
      //   status: 'pending',
      //   paid: false,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // }

      // Validate date is not in the past
      const startMs = new Date(travelDate).setHours(0,0,0,0)
      const today = new Date(); today.setHours(0,0,0,0)
      if (startMs < today.getTime()) {
        throw new Error('Ngày khởi hành không thể ở quá khứ')
      }

      // Redirect to payment page; creation will be done in PaymentPage with duplicate checks
      //const bookingRef = { id: 'temp' } as any
      
      // If user is logged in, update their booking list
      if (user) {
        bookTour(tour.id)
      }

      setSuccess(true)
      
      // Redirect to payment page after 2 seconds with ticket breakdown so PaymentPage can compute totals
      setTimeout(() => {
        navigate('/payment', { 
          state: { 
            tourId: tour.id,
            tickets,
            includeInsurance,
            totalAmount: getTotalAmount(),
            travelDate: new Date(travelDate).toISOString()
          }
        })
      }, 2000)

    } catch (error: any) {
      console.error('Booking error:', error)
      setError(error.message || 'Có lỗi xảy ra khi đặt tour')
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    // For logged-in users, only require date and at least 1 ticket
    if (user) {
      if (!travelDate) return 'Vui lòng chọn ngày đi'
      if (getTotalPeople() === 0) return 'Vui lòng chọn ít nhất 1 vé'
      return null
    }
    // Guests must provide contact info
    if (!customerName.trim()) return 'Vui lòng nhập tên khách hàng'
    if (!customerEmail.trim()) return 'Vui lòng nhập email'
    if (!customerPhone.trim()) return 'Vui lòng nhập số điện thoại'
    if (!travelDate) return 'Vui lòng chọn ngày đi'
    if (getTotalPeople() === 0) return 'Vui lòng chọn ít nhất 1 vé'
    return null
  }

  if (success) {
    return (
      <div className="quick-booking-overlay">
        <div className="quick-booking-modal success">
          <div className="success-icon">✅</div>
          <h3>Đặt tour thành công!</h3>
          <p>Chúng tôi sẽ chuyển hướng bạn đến trang thanh toán...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="quick-booking-overlay" onClick={onClose}>
      <div className="quick-booking-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" aria-hidden="true" />
        <div className="modal-header">
          <h3>Đặt tour nhanh</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="tour-summary">
          <img src={tour.imageUrl} alt={tour.title} />
          <div>
            <h4>{tour.title}</h4>
            <p>{tour.location}</p>
            <div className="price">{tour.price.toLocaleString()} đ/người lớn</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          {!user ? (
            <div className="customer-section">
              <h4>Thông tin khách hàng</h4>
              
              {existingCustomer && (
                <div className="existing-customer-notice">
                  ✅ Tìm thấy khách hàng với thông tin này
                </div>
              )}
              
              <div className="form-row">
                <div className="form-group">
                  <label>Họ tên *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    required
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    required
                    placeholder="Nhập email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    required
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </div>

              {!existingCustomer && (
                <div className="account-notice">
                  <p>💡 Tài khoản sẽ được tạo tự động với mật khẩu là số điện thoại của bạn</p>
                </div>
              )}
            </div>
          ) : null}

          <div className="booking-section">
            <h4>Thông tin đặt tour</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label>Ngày đi *</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={e => setTravelDate(e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>Phương thức thanh toán</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as 'card' | 'cash')}
                >
                  <option value="card">Thẻ tín dụng</option>
                  <option value="cash">Tiền mặt</option>
                </select>
              </div>
            </div>

            <div className="tickets-section">
              <h5>Chọn vé</h5>
              {tickets.map(ticket => (
                <div key={ticket.type} className="ticket-row">
                  <div className="ticket-info">
                    <div className="ticket-label">{ticket.label}</div>
                    <div className="ticket-price">{ticket.price.toLocaleString()} đ</div>
                  </div>
                  <div className="ticket-controls">
                    <button
                      type="button"
                      className="ticket-btn"
                      onClick={() => updateTicketCount(ticket.type, ticket.count - 1)}
                      disabled={ticket.count === 0}
                    >
                      -
                    </button>
                    <span className="ticket-count">{ticket.count}</span>
                    <button
                      type="button"
                      className="ticket-btn"
                      onClick={() => updateTicketCount(ticket.type, ticket.count + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="insurance-section">
              <div className="insurance-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={includeInsurance}
                    onChange={e => setIncludeInsurance(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  <div className="insurance-info">
                    <div className="insurance-title">Bảo hiểm du lịch</div>
                    <div className="insurance-desc">Bảo hiểm toàn diện cho chuyến đi (+50.000 đ)</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Yêu cầu đặc biệt</label>
              <textarea
                value={specialRequests}
                onChange={e => setSpecialRequests(e.target.value)}
                placeholder="Nhập yêu cầu đặc biệt (nếu có)"
                rows={3}
              />
            </div>
          </div>

          <div className="booking-summary">
            <div className="summary-row">
              <span>Tổng số người:</span>
              <span>{getTotalPeople()} người</span>
            </div>
            {tickets.map(ticket => (
              ticket.count > 0 && (
                <div key={ticket.type} className="summary-row">
                  <span>{ticket.label}:</span>
                  <span>{ticket.count} × {ticket.price.toLocaleString()} đ</span>
                </div>
              )
            ))}
            {includeInsurance && (
              <div className="summary-row">
                <span>Bảo hiểm:</span>
                <span>50.000 đ</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{getTotalAmount().toLocaleString()} đ</span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đặt tour ngay'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .quick-booking-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .quick-booking-modal {
          background: var(--card);
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .modal-handle {
          display: none;
          width: 44px;
          height: 5px;
          background: rgba(255,255,255,0.2);
          border-radius: 999px;
          margin: 8px auto 0 auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .modal-header h3 {
          margin: 0;
          color: var(--text);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--muted);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: rgba(255,255,255,0.1);
          transform: scale(1.1);
        }

        .tour-summary {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .tour-summary img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
        }

        .tour-summary h4 {
          margin: 0 0 0.5rem 0;
          color: var(--text);
        }

        .tour-summary p {
          margin: 0 0 0.5rem 0;
          color: var(--muted);
          font-size: 0.9rem;
        }

        .price {
          font-weight: 600;
          color: var(--primary);
          font-size: 1.1rem;
        }

        .booking-form {
          padding: 1.5rem;
        }

        .customer-section,
        .booking-section {
          margin-bottom: 2rem;
        }

        .customer-section h4,
        .booking-section h4 {
          margin: 0 0 1rem 0;
          color: var(--text);
          font-size: 1.1rem;
        }

        .existing-customer-notice {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .account-notice {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          padding: 0.75rem;
          border-radius: 8px;
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: var(--text);
          font-size: 0.9rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid rgba(255,255,255,0.28);
          border-radius: 8px;
          background: rgba(255,255,255,0.1);
          color: #f8fafc;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.35);
          transform: translateY(-1px);
          background: rgba(15,23,42,0.6);
        }

        .tickets-section {
          margin: 1.5rem 0;
        }

        .tickets-section h5 {
          margin: 0 0 1rem 0;
          color: var(--text);
          font-size: 1rem;
        }

        .ticket-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }

        .ticket-info {
          flex: 1;
        }

        .ticket-label {
          font-weight: 500;
          color: var(--text);
          margin-bottom: 0.25rem;
        }

        .ticket-price {
          color: var(--primary);
          font-size: 0.9rem;
        }

        .ticket-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ticket-btn {
          width: 32px;
          height: 32px;
          border: 1px solid var(--primary);
          background: transparent;
          color: var(--primary);
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          transition: all 0.2s ease;
        }

        .ticket-btn:hover:not(:disabled) {
          background: var(--primary);
          color: #06101a;
          transform: scale(1.1);
        }

        .ticket-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ticket-count {
          min-width: 30px;
          text-align: center;
          font-weight: 600;
          color: var(--text);
        }

        .insurance-section {
          margin: 1.5rem 0;
        }

        .insurance-option {
          padding: 1rem;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          display: none;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid var(--primary);
          border-radius: 4px;
          position: relative;
          flex-shrink: 0;
          margin-top: 2px;
          transition: all 0.2s ease;
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark {
          background: var(--primary);
        }

        .checkbox-label input[type="checkbox"]:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #06101a;
          font-weight: bold;
          font-size: 12px;
        }

        .insurance-info {
          flex: 1;
        }

        .insurance-title {
          font-weight: 500;
          color: var(--text);
          margin-bottom: 0.25rem;
        }

        .insurance-desc {
          font-size: 0.85rem;
          color: var(--muted);
        }

        .booking-summary {
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 1rem;
          margin: 1.5rem 0;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .summary-row.total {
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 0.5rem;
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--primary);
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 0.75rem;
          border-radius: 8px;
          margin: 1rem 0;
          font-size: 0.9rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          font-size: 0.9rem;
        }

        .btn.ghost {
          background: transparent;
          color: var(--text);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .btn.ghost:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          transform: translateY(-1px);
        }

        .btn.primary {
          background: var(--primary);
          color: #06101a;
          border: 1px solid var(--primary);
        }

        .btn.primary:hover:not(:disabled) {
          background: var(--primary-600);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .success {
          text-align: center;
          padding: 3rem 2rem;
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .success h3 {
          margin: 0 0 1rem 0;
          color: var(--text);
        }

        .success p {
          color: var(--muted);
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          /* Bottom sheet style on mobile */
          .quick-booking-overlay {
            align-items: flex-end;
            padding: 0;
            background: rgba(0,0,0,0.6);
          }

          .quick-booking-modal {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
            border-top-left-radius: 16px;
            border-top-right-radius: 16px;
            max-width: 100%;
            width: 100%;
            max-height: 100vh;
            height: 100vh;
            overflow-y: auto;
            animation: slideUpSheet 220ms ease-out;
          }

          .modal-handle {
            display: block;
          }

          .ticket-row {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .ticket-controls {
            justify-content: center;
          }

          @keyframes slideUpSheet {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        }
      `}</style>
    </div>
  )
}
