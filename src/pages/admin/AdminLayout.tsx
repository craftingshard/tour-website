import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminProviders'

export function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { currentUser, logout, hasPermission, canAccessDashboard } = useAdmin()
  const handleSignOut = async () => {
    try {
      await logout()
      navigate('/admin/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }
  
  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      // Đóng menu nếu click vào một NavLink
      const navLink = (event.target as HTMLElement).closest('.nav-item');
    if (navLink) {
      setIsMenuOpen(false);
    }
      
      // Đóng menu nếu click ra ngoài sidebar
      const sidebar = document.querySelector('.admin-sidebar');
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    if (
      isMenuOpen &&
      sidebar &&
      !sidebar.contains(event.target as Node) &&
      toggleButton &&
      !toggleButton.contains(event.target as Node)
    ) {
      setIsMenuOpen(false);
    }
  };

    document.addEventListener('click', closeMenu);

    // Hàm dọn dẹp (cleanup function) để tránh rò rỉ bộ nhớ
    return () => {
      document.removeEventListener('click', closeMenu);
    };
  }, [isMenuOpen]);

  if (!currentUser) {
    return (
      <div className="admin-loading">
        <div className="loading-card">
          <div className="loading-spinner">🔄</div>
          <div>Đang tải...</div>
        </div>
      </div>
    )
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên'
      case 'manager': return 'Quản lý'
      case 'staff': return 'Nhân viên'
      case 'partner': return 'Đối tác'
      default: return 'Người dùng'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#dc2626'
      case 'manager': return '#ea580c'
      case 'staff': return '#059669'
      case 'partner': return '#7c3aed'
      default: return '#6b7280'
    }
  }
  
  return (
    <div className="admin-layout">
        {/* Header */}
      {/* Removed top horizontal menu per request; keep a minimal header */}
      <header className="admin-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>🏔️ Tour Admin</h1>
        </div>
        
          <div className="user-section">
          <div className="user-info">
            <div className="user-details">
                <span className="user-name">
                  {currentUser.name}
                </span>
                <span className="user-email">
                  {currentUser.email}
                </span>
              </div>
              <div className="user-role" style={{ color: getRoleColor(currentUser.role) }}>
                {getRoleDisplayName(currentUser.role)}
              </div>
            </div>
            <button className="signout-btn" onClick={handleSignOut}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="admin-main">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${isMenuOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            {/* Dashboard - Admin and Manager only */}
            {canAccessDashboard() && (
              <NavLink to="/admin" end className="nav-item">
                📊 Dashboard
              </NavLink>
            )}
            
            {/* Staff Dashboard - Staff only */}
            {currentUser.role === 'staff' && (
              <NavLink to="/admin/staff-dashboard" className="nav-item">
                📋 Bảng điều khiển
              </NavLink>
            )}
            
            {/* Content Management - All roles */}
            {hasPermission('read', 'TOURS') && (
              <NavLink to="/admin/tours" className="nav-item">
                🏔️ Tours
              </NavLink>
            )}
            
            {hasPermission('read', 'POSTS') && (
              <NavLink to="/admin/posts" className="nav-item">
                📝 Bài viết
              </NavLink>
            )}
            
            {hasPermission('read', 'bookings') && (
              <NavLink to="/admin/bookings" className="nav-item">
                📅 Đặt tour
              </NavLink>
            )}
            
            {/* Management - Admin and Manager only */}
            {hasPermission('read', 'customers') && (
              <NavLink to="/admin/customers" className="nav-item">
                👥 Khách hàng
              </NavLink>
            )}
            
            {hasPermission('read', 'admins') && (
              <NavLink to="/admin/staff" className="nav-item">
                👨‍💼 Nhân viên
              </NavLink>
            )}
            
            {hasPermission('read', 'affiliates') && (
              <NavLink to="/admin/affiliates" className="nav-item">
                🤝 Affiliates
              </NavLink>
            )}
            
            {hasPermission('read', 'partners') && (
              <NavLink to="/admin/partners" className="nav-item">
                🤝 Thành viên
              </NavLink>
            )}
            
            {/* Reports - Admin and Manager only */}
            {hasPermission('read', 'reports') && (
              <>
                <NavLink to="/admin/affiliate-report" className="nav-item">
                  📈 Báo cáo Affiliate
                </NavLink>
                <NavLink to="/admin/affiliate-payment" className="nav-item">
                  💰 Thanh toán Affiliate
                </NavLink>
                <NavLink to="/admin/refund-payment" className="nav-item">
                  💸 Hoàn tiền
                </NavLink>
                <NavLink to="/admin/revenue-report" className="nav-item">
                  💵 Báo cáo Doanh thu
                </NavLink>
                <NavLink to="/admin/tour-performance" className="nav-item">
                  🎯 Hiệu suất Tour
                </NavLink>
              </>
            )}
            
            {/* Settings - Admin only */}
            {currentUser.role === 'admin' && (
              <>
                <NavLink to="/admin/themes" className="nav-item">
                  🎨 Themes
                </NavLink>
                <NavLink to="/admin/banks" className="nav-item">
                  🏦 Ngân hàng
                </NavLink>
                <NavLink to="/admin/settings" className="nav-item">
                  ⚙️ Cấu hình
                </NavLink>
                <NavLink to="/admin/about" className="nav-item">
                  ℹ️ Giới thiệu
                </NavLink>
              </>
            )}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? '✕' : '☰'}
      </button>
      {isMenuOpen && (
        <div 
          className="menu-overlay" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <style>{`
        .admin-layout {
          min-height: 100vh;
          background: #f8fafc;
        }
        .menu-overlay {
  display: none; 
}
        .admin-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem 2rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .logo-section h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }
        
        .user-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .user-details {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .user-name {
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .user-email {
          font-size: 0.8rem;
          opacity: 0.9;
        }
        
        .user-role {
          background: rgba(255,255,255,0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.3);
        }
        
        .admin-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #f8fafc;
        }
        
        .loading-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        
        .loading-spinner {
          font-size: 2rem;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .signout-btn {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }
        
        .signout-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-1px);
        }
        
        .admin-main {
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
          min-height: calc(100vh - 80px);
        }
        
        .admin-sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #e2e8f0;
          padding: 2rem 0;
          overflow-y: auto;
        }
        
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0 1.5rem;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: #64748b;
          border-radius: 8px;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .nav-item:hover {
          background: #f1f5f9;
          color: #475569;
        }
        
        .nav-item.active {
          background: #667eea;
          color: white;
        }
        
        .admin-content {
          flex: 1;
          padding: 2rem;
          overflow-x: auto;
        }
        
        .mobile-menu-toggle {
          display: none;
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 200;
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1.2rem;
        }
        
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: block;
          }
          .menu-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5); 
            z-index: 140;
          }
          .admin-sidebar {
            position: fixed;
            left: -280px;
            top: 80px;
            height: calc(100vh - 80px);
            z-index: 150;
            transition: left 0.3s ease;
          }
          
          .admin-sidebar.open {
            left: 0;
          }
          
          .admin-content {
            padding: 1rem;
          }
          
          .header-content {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .user-section {
            align-self: flex-end;
          }
            .content-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            z-index: 140; 
          }
        }
          /* Mobile for iPhone SE & iPhone 8*/
          @media (max-width: 415px) {
            .admin-header {
                padding: 0.5rem; 
            }
            .stat-content h3, h3 {font-size:1rem}
            .stat-content p {font-size:0.8rem}
            .header-content {
                align-items: center; 
            }

            .user-details {
                align-items: center; 
            }

            .user-email {
                display: none; 
            }
            
            .logo-section h1, h1 {
                font-size: 1.25rem; 
            }

            .admin-content {
                padding: 0.5rem; 
            }
            .stat-card {padding:0.1rem}
        }
      `}</style>
    </div>
  )
}


