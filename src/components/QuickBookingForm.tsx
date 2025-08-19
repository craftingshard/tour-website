import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs, addDoc, doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from '../firebase'
import { useApp } from '../context/AppProviders'

interface QuickBookingFormProps {
  tour: any
  onClose: () => void
}

export function QuickBookingForm({ tour, onClose }: QuickBookingFormProps) {
  const navigate = useNavigate()
  const { user, bookTour } = useApp()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Customer info
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  
  // Booking info
  const [numberOfPeople, setNumberOfPeople] = useState(1)
  const [travelDate, setTravelDate] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card')
  
  // Check if customer exists
  const [existingCustomer, setExistingCustomer] = useState<any>(null)

  useEffect(() => {
    // Set default travel date to tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setTravelDate(tomorrow.toISOString().split('T')[0])
  }, [])

  const checkExistingCustomer = async () => {
    if (!customerEmail && !customerPhone) return
    
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
      if (customerEmail || customerPhone) {
        checkExistingCustomer()
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [customerEmail, customerPhone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

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
      const bookingData = {
        tourId: tour.id,
        tourName: tour.title,
        customerId: customerId,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        numberOfPeople: numberOfPeople,
        travelDate: new Date(travelDate),
        specialRequests: specialRequests,
        paymentMethod: paymentMethod,
        amount: tour.price * numberOfPeople,
        status: 'pending',
        paid: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData)
      
      // If user is logged in, update their booking list
      if (user) {
        bookTour(tour.id)
      }

      setSuccess(true)
      
      // Redirect to payment page after 2 seconds
      setTimeout(() => {
        navigate('/payment', { 
          state: { 
            tourId: tour.id,
            bookingId: bookingRef.id,
            amount: bookingData.amount
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
    if (!customerName.trim()) return 'Vui lòng nhập tên khách hàng'
    if (!customerEmail.trim()) return 'Vui lòng nhập email'
    if (!customerPhone.trim()) return 'Vui lòng nhập số điện thoại'
    if (!travelDate) return 'Vui lòng chọn ngày đi'
    if (numberOfPeople < 1) return 'Số người phải lớn hơn 0'
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
        <div className="modal-header">
          <h3>Đặt tour nhanh</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="tour-summary">
          <img src={tour.imageUrl} alt={tour.title} />
          <div>
            <h4>{tour.title}</h4>
            <p>{tour.location}</p>
            <div className="price">{tour.price.toLocaleString()} đ/người</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          {!user && (
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
          )}

          <div className="booking-section">
            <h4>Thông tin đặt tour</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label>Số người *</label>
                <input
                  type="number"
                  min="1"
                  value={numberOfPeople}
                  onChange={e => setNumberOfPeople(Number(e.target.value))}
                  required
                />
              </div>
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
              <span>Giá tour:</span>
              <span>{tour.price.toLocaleString()} đ × {numberOfPeople}</span>
            </div>
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{(tour.price * numberOfPeople).toLocaleString()} đ</span>
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
              disabled={isLoading || !!validateForm()}
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
        }

        .close-btn:hover {
          background: rgba(255,255,255,0.1);
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
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          color: var(--text);
          font-size: 0.9rem;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
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

          .quick-booking-modal {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
          }
        }
      `}</style>
    </div>
  )
}
