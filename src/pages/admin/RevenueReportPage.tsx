import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../firebase'

export function RevenueReportPage() {
  const [revenue, setRevenue] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [dateRange, setDateRange] = useState('month')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [bankSummary, setBankSummary] = useState<Array<{ bankId: string | null; bankName: string; totalAmount: number; count: number }>>([])

  useEffect(() => {
    loadData()
  }, [dateRange, selectedYear, selectedMonth])

  const loadData = async () => {
    try {
      // Load bookings (revenue)
      const bookingsQuery = query(
        collection(db, 'bookings'),
        orderBy('bookingDate', 'desc')
      )
      const bookingsSnapshot = await getDocs(bookingsQuery)
      const bookingsData = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Load refund payments
      const refundsQuery = query(
        collection(db, 'refundPayments'),
        orderBy('refundDate', 'desc')
      )
      const refundsSnapshot = await getDocs(refundsQuery)
      const refundsRawData = refundsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      // Load expenses (mock data for now - you can create an expenses collection)
      const mockExpenses = [
        {
          id: 'exp1',
          description: 'Lương nhân viên',
          amount: 50000000,
          category: 'Nhân sự',
          date: new Date(selectedYear, selectedMonth - 1, 15),
          type: 'expense'
        },
        {
          id: 'exp2',
          description: 'Marketing và quảng cáo',
          amount: 20000000,
          category: 'Marketing',
          date: new Date(selectedYear, selectedMonth - 1, 10),
          type: 'expense'
        },
        {
          id: 'exp3',
          description: 'Chi phí vận hành website',
          amount: 5000000,
          category: 'Công nghệ',
          date: new Date(selectedYear, selectedMonth - 1, 5),
          type: 'expense'
        },
        {
          id: 'exp4',
          description: 'Chi phí văn phòng',
          amount: 10000000,
          category: 'Văn phòng',
          date: new Date(selectedYear, selectedMonth - 1, 1),
          type: 'expense'
        }
      ]
      setExpenses(mockExpenses)

      // Calculate revenue from bookings
      const revenueData = bookingsData
        .filter((booking: any) => {
          if (!booking.amount || !booking.paid) return false
          
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
        .map((booking: any) => ({
          id: booking.id,
          description: `Đặt tour: ${booking.tourName || booking.tourId} • ${booking.method === 'bank_transfer' ? (booking.bankName || 'Chuyển khoản') : 'Tiền mặt'}`,
          amount: booking.amount,
          category: 'Doanh thu tour',
          date: new Date(booking.bookingDate?.toDate?.() || booking.bookingDate),
          type: 'revenue',
          customer: booking.customerName,
          affiliate: booking.affiliateName
        }))
      
      // Add refunds as negative revenue
      const refundsData = refundsRawData
        .filter((refund: any) => {
          const refundDate = new Date(refund.refundDate?.toDate?.() || refund.refundDate)
          if (dateRange === 'month') {
            return refundDate.getFullYear() === selectedYear && 
                   refundDate.getMonth() === selectedMonth - 1
          } else if (dateRange === 'quarter') {
            const quarter = Math.floor(selectedMonth / 3) + 1
            const refundQuarter = Math.floor(refundDate.getMonth() / 3) + 1
            return refundDate.getFullYear() === selectedYear && refundQuarter === quarter
          } else if (dateRange === 'year') {
            return refundDate.getFullYear() === selectedYear
          }
          return true
        })
        .map((refund: any) => ({
          id: refund.id,
          description: `Hoàn tiền: ${refund.customerName} • ${refund.reason === 'customer_request' ? 'Khách yêu cầu hủy' : 'Lý do khác'}`,
          amount: -refund.amount, // Negative amount for refunds
          category: 'Hoàn tiền',
          date: new Date(refund.refundDate?.toDate?.() || refund.refundDate),
          type: 'refund',
          customer: refund.customerName,
          reason: refund.reason
        }))

      // Combine revenue and refunds
      const combinedRevenue = [...revenueData, ...refundsData].sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime()
        const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime()
        return dateB - dateA
      })
      setRevenue(combinedRevenue)
      // Summary by bank for received payments (bank transfer only)
      const filteredPaid = bookingsData.filter((booking: any) => {
        if (!booking.amount || !booking.paid) return false
        if (booking.method !== 'bank_transfer') return false
        const bookingDate = new Date(booking.bookingDate?.toDate?.() || booking.bookingDate)
        if (dateRange === 'month') {
          return bookingDate.getFullYear() === selectedYear && bookingDate.getMonth() === selectedMonth - 1
        } else if (dateRange === 'quarter') {
          const quarter = Math.floor(selectedMonth / 3) + 1
          const bookingQuarter = Math.floor(bookingDate.getMonth() / 3) + 1
          return bookingDate.getFullYear() === selectedYear && bookingQuarter === quarter
        } else if (dateRange === 'year') {
          return bookingDate.getFullYear() === selectedYear
        }
        return true
      })

      const byBank: Record<string, { bankId: string | null; bankName: string; totalAmount: number; count: number }> = {}
      for (const b of filteredPaid as any[]) {
        const key: string = String(b.bankId || b.bankName || 'Khác')
        if (!byBank[key]) {
          byBank[key] = { bankId: b.bankId || null, bankName: b.bankName || 'Khác', totalAmount: 0, count: 0 }
        }
        byBank[key].totalAmount += Number(b.amount) || 0
        byBank[key].count += 1
      }
      const summary = Object.values(byBank).sort((a, b) => b.totalAmount - a.totalAmount)
      setBankSummary(summary)

    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const getFilteredExpenses = () => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date)
      if (dateRange === 'month') {
        return expenseDate.getFullYear() === selectedYear && 
               expenseDate.getMonth() === selectedMonth - 1
      } else if (dateRange === 'quarter') {
        const quarter = Math.floor(selectedMonth / 3) + 1
        const expenseQuarter = Math.floor(expenseDate.getMonth() / 3) + 1
        return expenseDate.getFullYear() === selectedYear && expenseQuarter === quarter
      } else if (dateRange === 'year') {
        return expenseDate.getFullYear() === selectedYear
      }
      return true
    })
  }

  const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0)
  const totalExpenses = getFilteredExpenses().reduce((sum, e) => sum + (e.amount || 0), 0)
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ'
  }

  const formatDate = (date: any) => {
    if (date?.toDate) {
      return date.toDate().toLocaleDateString('vi-VN')
    }
    return new Date(date).toLocaleDateString('vi-VN')
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

  return (
    <div className="revenue-report">
      <div className="page-header">
        <h1>📊 Báo Cáo Doanh Thu</h1>
        <p>Phân tích thu chi và lợi nhuận của doanh nghiệp</p>
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
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Doanh thu</p>
            <span className="period">{getDateRangeText()}</span>
          </div>
        </div>
        
        <div className="stat-card expense">
          <div className="stat-icon">💸</div>
          <div className="stat-content">
            <h3>{formatCurrency(totalExpenses)}</h3>
            <p>Chi phí</p>
            <span className="period">{getDateRangeText()}</span>
          </div>
        </div>
        
        <div className="stat-card profit">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{formatCurrency(netProfit)}</h3>
            <p>Lợi nhuận</p>
            <span className={`profit-margin ${netProfit >= 0 ? 'positive' : 'negative'}`}>
              {netProfit >= 0 ? '+' : ''}{profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="stat-card margin">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{profitMargin.toFixed(1)}%</h3>
            <p>Tỷ suất lợi nhuận</p>
            <span className="period">Doanh thu</span>
          </div>
        </div>
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className="chart-section">
        <h2>📊 Biểu Đồ Thu Chi</h2>
        <div className="chart-container">
          <div className="chart-bars">
            <div className="chart-bar revenue-bar">
              <div className="bar-label">Doanh thu</div>
              <div className="bar" style={{height: `${Math.min(100, (totalRevenue / Math.max(totalRevenue, totalExpenses)) * 100)}%`}}>
                <span className="bar-value">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>
            <div className="chart-bar expense-bar">
              <div className="bar-label">Chi phí</div>
              <div className="bar" style={{height: `${Math.min(100, (totalExpenses / Math.max(totalRevenue, totalExpenses)) * 100)}%`}}>
                <span className="bar-value">{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Bank */}
      <div className="revenue-section">
        <h2>🏦 Doanh Thu Theo Ngân Hàng</h2>
        {bankSummary.length === 0 ? (
          <div className="muted">Chưa có dữ liệu chuyển khoản trong giai đoạn đã chọn.</div>
        ) : (
          <div className="table-container">
            <table className="revenue-table">
              <thead>
                <tr>
                  <th>Ngân hàng</th>
                  <th>Số giao dịch</th>
                  <th>Tổng tiền</th>
                </tr>
              </thead>
              <tbody>
                {bankSummary.map((row, idx) => (
                  <tr key={row.bankId || row.bankName || idx} className="revenue-row">
                    <td className="description">{row.bankName}</td>
                    <td className="category">{row.count}</td>
                    <td className="amount">{(row.totalAmount || 0).toLocaleString('vi-VN')}đ</td>
                  </tr>
                ))}
                <tr>
                  <td style={{fontWeight:600}}>Tổng</td>
                  <td style={{fontWeight:600}}>{bankSummary.reduce((s, r) => s + r.count, 0)}</td>
                  <td className="amount" style={{fontWeight:700}}>{bankSummary.reduce((s, r) => s + (r.totalAmount || 0), 0).toLocaleString('vi-VN')}đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revenue Details */}
      <div className="revenue-section">
        <h2>💰 Chi Tiết Doanh Thu</h2>
        <div className="table-container">
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Mô tả</th>
                <th>Khách hàng</th>
                <th>Đối tác</th>
                <th>Danh mục</th>
                <th>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map(item => (
                <tr key={item.id} className="revenue-row">
                  <td className="date">{formatDate(item.date)}</td>
                  <td className="description">{item.description}</td>
                  <td className="customer">{item.customer || '-'}</td>
                  <td className="affiliate">{item.affiliate || 'Trực tiếp'}</td>
                  <td className="category">{item.category}</td>
                  <td className="amount">{formatCurrency(item.amount || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expenses Details */}
      <div className="expenses-section">
        <h2>💸 Chi Tiết Chi Phí</h2>
        <div className="table-container">
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Mô tả</th>
                <th>Danh mục</th>
                <th>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredExpenses().map(item => (
                <tr key={item.id} className="expense-row">
                  <td className="date">{formatDate(item.date)}</td>
                  <td className="description">{item.description}</td>
                  <td className="category">{item.category}</td>
                  <td className="amount">{formatCurrency(item.amount || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .revenue-report {
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
          transition: all 0.3s;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        
        .stat-card.revenue { border-left: 4px solid #059669; }
        .stat-card.expense { border-left: 4px solid #dc2626; }
        .stat-card.profit { border-left: 4px solid #7c3aed; }
        .stat-card.margin { border-left: 4px solid #f59e0b; }
        
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
        
        .profit-margin {
          font-size: 0.875rem;
          font-weight: 600;
          margin-top: 4px;
        }
        
        .profit-margin.positive {
          color: #059669;
        }
        
        .profit-margin.negative {
          color: #dc2626;
        }
        
        .chart-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 32px;
        }
        
        .chart-section h2 {
          color: #1f2937;
          margin: 0 0 24px 0;
        }
        
        .chart-container {
          height: 300px;
          display: flex;
          align-items: end;
          justify-content: center;
          gap: 60px;
          padding: 20px;
        }
        
        .chart-bars {
          display: flex;
          gap: 60px;
          align-items: end;
        }
        
        .chart-bar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        
        .bar-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }
        
        .bar {
          width: 80px;
          background: linear-gradient(to top, #e5e7eb, #d1d5db);
          border-radius: 8px 8px 0 0;
          position: relative;
          min-height: 20px;
          display: flex;
          align-items: end;
          justify-content: center;
        }
        
        .revenue-bar .bar {
          background: linear-gradient(to top, #059669, #10b981);
        }
        
        .expense-bar .bar {
          background: linear-gradient(to top, #dc2626, #ef4444);
        }
        
        .bar-value {
          color: white;
          font-weight: 600;
          font-size: 0.75rem;
          padding: 4px;
          text-align: center;
          line-height: 1.2;
        }
        
        .revenue-section,
        .expenses-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 32px;
        }
        
        .revenue-section h2,
        .expenses-section h2 {
          color: #1f2937;
          margin: 0 0 24px 0;
        }
        
        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .revenue-table,
        .expenses-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          min-width: 600px;
        }
        
        .revenue-table th,
        .expenses-table th {
          background: #f9fafb;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }
        
        .revenue-table td,
        .expenses-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }
        
        .revenue-row:hover,
        .expense-row:hover {
          background: #f9fafb;
        }
        
        .amount {
          font-weight: 600;
          color: #059669;
        }
        
        .expense-row .amount {
          color: #dc2626;
        }
        
        @media (max-width: 768px) {
          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-select {
            min-width: auto;
          }
          
          .chart-container {
            height: 200px;
            gap: 30px;
          }
          
          .chart-bars {
            gap: 30px;
          }
          
          .bar {
            width: 60px;
          }
        }
      `}</style>
    </div>
  )
}
