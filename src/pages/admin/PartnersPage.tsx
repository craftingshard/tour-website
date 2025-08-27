import { useState, useEffect } from 'react'
import { collection, getDocs, updateDoc, doc, query, orderBy, addDoc } from 'firebase/firestore'
import { db } from '../../firebase'

export function PartnersPage() {
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [creatingTemplate, setCreatingTemplate] = useState(false)

  useEffect(() => {
    loadPartners()
  }, [])

  const loadPartners = async () => {
    try {
      setLoading(true)
      const partnersQuery = query(
        collection(db, 'partners'),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(partnersQuery)
      const partnersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setPartners(partnersData)
    } catch (error) {
      console.error('Error loading partners:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePartnerStatus = async (partnerId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'partners', partnerId), {
        status,
        updatedAt: new Date()
      })
      loadPartners() // Reload data
    } catch (error) {
      console.error('Error updating partner status:', error)
    }
  }

  const getFilteredPartners = () => {
    if (selectedStatus === 'all') {
      return partners
    }
    return partners.filter(p => p.status === selectedStatus)
  }

  const formatDate = (date: any) => {
    if (date?.toDate) {
      return date.toDate().toLocaleDateString('vi-VN')
    }
    return new Date(date).toLocaleDateString('vi-VN')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span style={{background:'#10b981', color:'white', padding:'4px 8px', borderRadius:4, fontSize:12}}>Đã duyệt</span>
      case 'pending':
        return <span style={{background:'#f59e0b', color:'white', padding:'4px 8px', borderRadius:4, fontSize:12}}>Chờ duyệt</span>
      case 'rejected':
        return <span style={{background:'#ef4444', color:'white', padding:'4px 8px', borderRadius:4, fontSize:12}}>Từ chối</span>
      case 'suspended':
        return <span style={{background:'#6b7280', color:'white', padding:'4px 8px', borderRadius:4, fontSize:12}}>Tạm khóa</span>
      default:
        return <span style={{background:'#6b7280', color:'white', padding:'4px 8px', borderRadius:4, fontSize:12}}>Không xác định</span>
    }
  }

  const pendingCount = partners.filter(p => p.status === 'pending').length
  const approvedCount = partners.filter(p => p.status === 'approved').length
  const totalCount = partners.length

  return (
    <div className="partners-page">
      <div className="page-header">
        <h1>🤝 Quản Lý Thành viên</h1>
        <p>Duyệt và quản lý tài khoản Thành viên đăng ký</p>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{totalCount}</h3>
            <p>Tổng Thành viên</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{pendingCount}</h3>
            <p>Chờ duyệt</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{approvedCount}</h3>
            <p>Đã duyệt</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Lọc theo trạng thái:</label>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
            <option value="suspended">Tạm khóa</option>
          </select>
        </div>
      </div>

      {/* Partners Table */}
      <div className="partners-section">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
          <h2>📋 Danh Sách Thành viên</h2>
                  </div>
        <div className="partners-table">
          {loading ? (
            <div className="loading">🔄 Đang tải dữ liệu...</div>
          ) : (
            <div className="table-container">
              <table className="partners-table-content">
                <thead>
                  <tr>
                    <th>Thông tin cơ bản</th>
                    <th>Thông tin công ty</th>
                    <th>Trạng thái</th>
                    <th>Ngày đăng ký</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredPartners().map(partner => (
                    <tr key={partner.id} className="partner-row">
                      <td className="basic-info">
                        <div style={{fontWeight:600, marginBottom:4}}>{partner.name}</div>
                        <div style={{fontSize:14, color:'#6b7280', marginBottom:2}}>📧 {partner.email}</div>
                        <div style={{fontSize:14, color:'#6b7280', marginBottom:2}}>📞 {partner.phone}</div>
                        <div style={{fontSize:14, color:'#6b7280'}}>📍 {partner.address}</div>
                      </td>
                      <td className="company-info">
                        {partner.companyName ? (
                          <>
                            <div style={{fontWeight:600, marginBottom:4}}>{partner.companyName}</div>
                            {partner.companyAddress && (
                              <div style={{fontSize:14, color:'#6b7280', marginBottom:2}}>📍 {partner.companyAddress}</div>
                            )}
                            {partner.taxCode && (
                              <div style={{fontSize:14, color:'#6b7280', marginBottom:2}}>🏢 MST: {partner.taxCode}</div>
                            )}
                            {partner.website && (
                              <div style={{fontSize:14, color:'#6b7280'}}>🌐 {partner.website}</div>
                            )}
                          </>
                        ) : (
                          <div style={{color:'#6b7280', fontStyle:'italic'}}>Không có thông tin công ty</div>
                        )}
                      </td>
                      <td className="status">
                        {getStatusBadge(partner.status)}
                      </td>
                      <td className="created-date">
                        {formatDate(partner.createdAt)}
                      </td>
                      <td className="actions">
                        {partner.status === 'pending' && (
                          <div style={{display:'flex', gap:8, flexDirection:'column'}}>
                            <button 
                              className="btn btn-success"
                              onClick={() => updatePartnerStatus(partner.id, 'approved')}
                            >
                              ✅ Duyệt
                            </button>
                            <button 
                              className="btn btn-danger"
                              onClick={() => updatePartnerStatus(partner.id, 'rejected')}
                            >
                              ❌ Từ chối
                            </button>
                          </div>
                        )}
                        {partner.status === 'approved' && (
                          <button 
                            className="btn btn-warning"
                            onClick={() => updatePartnerStatus(partner.id, 'suspended')}
                          >
                            ⏸️ Tạm khóa
                          </button>
                        )}
                        {partner.status === 'suspended' && (
                          <button 
                            className="btn btn-success"
                            onClick={() => updatePartnerStatus(partner.id, 'approved')}
                          >
                            ▶️ Mở khóa
                          </button>
                        )}
                        {partner.status === 'rejected' && (
                          <button 
                            className="btn btn-success"
                            onClick={() => updatePartnerStatus(partner.id, 'approved')}
                          >
                            ✅ Duyệt lại
                          </button>
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

      <style>{`
        .partners-page {
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
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
          font-size: 2rem;
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
        
        .partners-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .partners-section h2 {
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
        
        .partners-table-content {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          min-width: 1000px;
        }
        
        .partners-table-content th {
          background: #f9fafb;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          white-space: nowrap;
        }
        
        .partners-table-content td {
          padding: 16px 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
          vertical-align: top;
        }
        
        .partner-row:hover {
          background: #f9fafb;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        
        .btn-success {
          background: #10b981;
          color: white;
        }
        
        .btn-success:hover {
          background: #059669;
        }
        
        .btn-danger {
          background: #ef4444;
          color: white;
        }
        
        .btn-danger:hover {
          background: #dc2626;
        }
        
        .btn-warning {
          background: #f59e0b;
          color: white;
        }
        
        .btn-warning:hover {
          background: #d97706;
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .partners-table-content {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  )
}
