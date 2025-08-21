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

  const createTemplateData = async () => {
    if (creatingTemplate) return
    
    if (!confirm('Bạn có chắc chắn muốn tạo dữ liệu mẫu cho đối tác? Điều này sẽ thêm 5 đối tác mẫu vào hệ thống.')) {
      return
    }

    setCreatingTemplate(true)
    
    const templatePartners = [
      {
        name: 'Nguyễn Văn An',
        email: 'nguyen.van.an@email.com',
        phone: '0901234567',
        address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
        companyName: 'Công ty Du lịch Việt Nam',
        companyAddress: '456 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
        taxCode: '0123456789',
        website: 'https://dutlichvietnam.com',
        description: 'Chuyên tổ chức tour du lịch trong nước và quốc tế',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Trần Thị Bình',
        email: 'tran.thi.binh@email.com', 
        phone: '0987654321',
        address: '789 Đường Hai Bà Trưng, Quận 3, TP. Hồ Chí Minh',
        companyName: 'Saigon Travel Co.',
        companyAddress: '321 Đường Lý Tự Trọng, Quận 1, TP. Hồ Chí Minh',
        taxCode: '9876543210',
        website: 'https://saigontravel.vn',
        description: 'Tour du lịch cao cấp và dịch vụ khách sạn',
        status: 'approved',
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date()
      },
      {
        name: 'Lê Minh Tuấn',
        email: 'le.minh.tuan@email.com',
        phone: '0912345678',
        address: '456 Đường Nguyễn Trãi, Quận 5, TP. Hồ Chí Minh',
        companyName: '',
        companyAddress: '',
        taxCode: '',
        website: '',
        description: 'Hướng dẫn viên du lịch freelance',
        status: 'pending',
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        updatedAt: new Date()
      },
      {
        name: 'Phạm Thị Lan',
        email: 'pham.thi.lan@email.com',
        phone: '0945678901',
        address: '789 Đường Võ Văn Kiệt, Quận 6, TP. Hồ Chí Minh',
        companyName: 'Green Travel Agency',
        companyAddress: '654 Đường Pasteur, Quận 3, TP. Hồ Chí Minh',
        taxCode: '5555666677',
        website: 'https://greentravel.vn',
        description: 'Chuyên tour sinh thái và du lịch xanh',
        status: 'approved',
        createdAt: new Date(Date.now() - 259200000), // 3 days ago
        updatedAt: new Date()
      },
      {
        name: 'Hoàng Văn Đức',
        email: 'hoang.van.duc@email.com',
        phone: '0978123456',
        address: '321 Đường Cách Mạng Tháng 8, Quận 10, TP. Hồ Chí Minh',
        companyName: 'Adventure Tours Vietnam',
        companyAddress: '987 Đường Điện Biên Phủ, Quận Bình Thạnh, TP. Hồ Chí Minh',
        taxCode: '1111222233',
        website: 'https://adventurevn.com',
        description: 'Tour mạo hiểm và thể thao ngoài trời',
        status: 'rejected',
        createdAt: new Date(Date.now() - 345600000), // 4 days ago
        updatedAt: new Date()
      }
    ]

    try {
      for (const partner of templatePartners) {
        await addDoc(collection(db, 'partners'), partner)
      }
      
      alert('✅ Đã tạo thành công 5 đối tác mẫu!')
      loadPartners() // Reload data to show new partners
    } catch (error) {
      console.error('Error creating template data:', error)
      alert('❌ Có lỗi xảy ra khi tạo dữ liệu mẫu: ' + error)
    } finally {
      setCreatingTemplate(false)
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
        <h1>🤝 Quản Lý Đối Tác</h1>
        <p>Duyệt và quản lý tài khoản đối tác đăng ký</p>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{totalCount}</h3>
            <p>Tổng đối tác</p>
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
          <h2>📋 Danh Sách Đối Tác</h2>
          <button 
            className="btn btn-template"
            onClick={createTemplateData}
            disabled={creatingTemplate}
            style={{
              background: creatingTemplate ? '#9ca3af' : '#8b5cf6',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: creatingTemplate ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {creatingTemplate ? '🔄 Đang tạo...' : '📋 Tạo dữ liệu mẫu'}
          </button>
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
