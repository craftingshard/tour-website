import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'

export function AffiliatePaymentPage() {
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAffiliate, setSelectedAffiliate] = useState<string>('all')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    affiliateId: '',
    amount: '',
    paymentDate: '',
    paymentMethod: 'bank_transfer',
    reference: '',
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load affiliates
      const affiliatesQuery = query(
        collection(db, 'affiliates'),
        orderBy('name')
      )
      const affiliatesSnapshot = await getDocs(affiliatesQuery)
      const affiliatesData = affiliatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAffiliates(affiliatesData)

      // Load payments
      const paymentsQuery = query(
        collection(db, 'affiliatePayments'),
        orderBy('paymentDate', 'desc')
      )
      const paymentsSnapshot = await getDocs(paymentsQuery)
      const paymentsData = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setPayments(paymentsData)

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const paymentData = {
        ...paymentForm,
        amount: Number(paymentForm.amount),
        paymentDate: new Date(paymentForm.paymentDate),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await addDoc(collection(db, 'affiliatePayments'), paymentData)

      // Update affiliate's paid amount
      const affiliate = affiliates.find(a => a.id === paymentForm.affiliateId)
      if (affiliate) {
        const newPaidAmount = (affiliate.paidAmount || 0) + Number(paymentForm.amount)
        const newPendingAmount = Math.max(0, (affiliate.totalEarnings || 0) - newPaidAmount)
        
        // Update affiliate document
        const { updateDoc, doc } = await import('firebase/firestore')
        await updateDoc(doc(db, 'affiliates', paymentForm.affiliateId), {
          paidAmount: newPaidAmount,
          pendingAmount: newPendingAmount,
          updatedAt: new Date()
        })
      }

      // Reset form and reload data
      setPaymentForm({
        affiliateId: '',
        amount: '',
        paymentDate: '',
        paymentMethod: 'bank_transfer',
        reference: '',
        notes: ''
      })
      setShowPaymentForm(false)
      loadData()
    } catch (error) {
      console.error('Error recording payment:', error)
    }
  }

  const getFilteredPayments = () => {
    if (selectedAffiliate === 'all') {
      return payments
    }
    return payments.filter(p => p.affiliateId === selectedAffiliate)
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

  const totalPaidAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalPendingAmount = affiliates.reduce((sum, a) => sum + (a.pendingAmount || 0), 0)

  return (
    <div className="affiliate-payment">
      <div className="page-header">
        <h1>💰 Quản Lý Thanh Toán Affiliate</h1>
        <p>Ghi nhận và theo dõi các khoản thanh toán cho đối tác affiliate</p>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <h3>{formatCurrency(totalPaidAmount)}</h3>
            <p>Tổng đã thanh toán</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{formatCurrency(totalPendingAmount)}</h3>
            <p>Tổng chờ thanh toán</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🤝</div>
          <div className="stat-content">
            <h3>{affiliates.length}</h3>
            <p>Tổng đối tác</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{payments.length}</h3>
            <p>Tổng giao dịch</p>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="payment-form-section">
        <div className="section-header">
          <h2>➕ Ghi Nhận Thanh Toán Mới</h2>
          <button 
            className="btn primary"
            onClick={() => setShowPaymentForm(!showPaymentForm)}
          >
            {showPaymentForm ? '📋 Ẩn form' : '💰 Ghi nhận thanh toán'}
          </button>
        </div>
        
        {showPaymentForm && (
          <form onSubmit={handlePaymentSubmit} className="payment-form">
            <div className="form-grid">
              <div className="form-field">
                <label>Đối tác affiliate *</label>
                <select 
                  value={paymentForm.affiliateId} 
                  onChange={(e) => setPaymentForm({...paymentForm, affiliateId: e.target.value})}
                  required
                >
                  <option value="">Chọn đối tác</option>
                  {affiliates.map(affiliate => (
                    <option key={affiliate.id} value={affiliate.id}>
                      {affiliate.name} - Chờ thanh toán: {formatCurrency(affiliate.pendingAmount || 0)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-field">
                <label>Số tiền (VNĐ) *</label>
                <input 
                  type="number" 
                  value={paymentForm.amount} 
                  onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                  placeholder="Nhập số tiền"
                  required
                />
              </div>
              
              <div className="form-field">
                <label>Ngày thanh toán *</label>
                <input 
                  type="date" 
                  value={paymentForm.paymentDate} 
                  onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-field">
                <label>Phương thức thanh toán</label>
                <select 
                  value={paymentForm.paymentMethod} 
                  onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                >
                  <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                  <option value="cash">Tiền mặt</option>
                  <option value="check">Séc</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              
              <div className="form-field">
                <label>Mã tham chiếu</label>
                <input 
                  type="text" 
                  value={paymentForm.reference} 
                  onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                  placeholder="Mã giao dịch, số séc..."
                />
              </div>
              
              <div className="form-field full-width">
                <label>Ghi chú</label>
                <textarea 
                  value={paymentForm.notes} 
                  onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                  placeholder="Ghi chú về khoản thanh toán..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn primary">
                💾 Ghi nhận thanh toán
              </button>
              <button 
                type="button" 
                className="btn secondary"
                onClick={() => setShowPaymentForm(false)}
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
      </div>

      {/* Payments History */}
      <div className="payments-section">
        <h2>📋 Lịch Sử Thanh Toán</h2>
        <div className="payments-table">
          {loading ? (
            <div className="loading">🔄 Đang tải dữ liệu...</div>
          ) : (
            <div className="table-container">
              <table className="payments-table-content">
                <thead>
                  <tr>
                    <th>Ngày thanh toán</th>
                    <th>Đối tác</th>
                    <th>Số tiền</th>
                    <th>Phương thức</th>
                    <th>Mã tham chiếu</th>
                    <th>Ghi chú</th>
                    <th>Người ghi nhận</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredPayments().map(payment => {
                    const affiliate = getAffiliateById(payment.affiliateId)
                    return (
                      <tr key={payment.id} className="payment-row">
                        <td className="payment-date">{formatDate(payment.paymentDate)}</td>
                        <td className="affiliate-name">
                          {affiliate?.name || 'Không xác định'}
                        </td>
                        <td className="amount">{formatCurrency(payment.amount || 0)}</td>
                        <td className="payment-method">
                          {payment.paymentMethod === 'bank_transfer' ? '🏦 Chuyển khoản' :
                           payment.paymentMethod === 'cash' ? '💵 Tiền mặt' :
                           payment.paymentMethod === 'check' ? '📄 Séc' : '📝 Khác'}
                        </td>
                        <td className="reference">{payment.reference || '-'}</td>
                        <td className="notes">{payment.notes || '-'}</td>
                        <td className="created-by">Admin</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .affiliate-payment {
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
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
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
        
        .payment-form-section {
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
        
        .payment-form {
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
          border-color: #059669;
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
        
        .payments-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .payments-section h2 {
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
        
        .payments-table-content {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          min-width: 800px;
        }
        
        .payments-table-content th {
          background: #f9fafb;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }
        
        .payments-table-content td {
          padding: 16px 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }
        
        .payment-row:hover {
          background: #f9fafb;
        }
        
        .amount {
          font-weight: 600;
          color: #059669;
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
          background: #059669;
          color: white;
        }
        
        .btn.primary:hover {
          background: #047857;
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
        }
      `}</style>
    </div>
  )
}
