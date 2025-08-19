import type { PropsWithChildren } from 'react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAdmin } from '../../context/AdminProviders'
import { auth } from '../../firebase'
import './AdminLayout.css'

export function AdminLayout({ children }: PropsWithChildren) {
  const { logout } = useAdmin()
  const [collapsed, setCollapsed] = useState(false)
  
  const currentUser = auth.currentUser
  
  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          {!collapsed && <div className="admin-title">Admin Panel</div>}
          <button 
            className="collapse-btn" 
            onClick={() => setCollapsed(s => !s)}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>
        
        {/* User Info */}
        {!collapsed && currentUser && (
          <div className="user-info">
            <div className="user-avatar">
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'A'}
                </div>
              )}
            </div>
            <div className="user-details">
              <div className="user-name">
                {currentUser.displayName || 'Admin User'}
              </div>
              <div className="user-email">
                {currentUser.email}
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="sidebar-nav">
          <NavLink to="/admin" className="nav-link" end>
            <span className="nav-icon">📊</span>
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
          
          <NavLink to="/admin/customers" className="nav-link">
            <span className="nav-icon">👥</span>
            {!collapsed && <span>Khách hàng</span>}
          </NavLink>
          
          <NavLink to="/admin/staff" className="nav-link">
            <span className="nav-icon">👨‍💼</span>
            {!collapsed && <span>Nhân viên</span>}
          </NavLink>
          
          <NavLink to="/admin/tours" className="nav-link">
            <span className="nav-icon">🏖️</span>
            {!collapsed && <span>Tour</span>}
          </NavLink>
          
          <NavLink to="/admin/posts" className="nav-link">
            <span className="nav-icon">📝</span>
            {!collapsed && <span>Bài viết</span>}
          </NavLink>
          
          <NavLink to="/admin/theme" className="nav-link">
            <span className="nav-icon">🎨</span>
            {!collapsed && <span>Theme</span>}
          </NavLink>
          
          <NavLink to="/admin/about" className="nav-link">
            <span className="nav-icon">ℹ️</span>
            {!collapsed && <span>Giới thiệu</span>}
          </NavLink>
          
          <NavLink to="/admin/bookings" className="nav-link">
            <span className="nav-icon">📅</span>
            {!collapsed && <span>Đặt tour</span>}
          </NavLink>
          
          <NavLink to="/admin/affiliate" className="nav-link">
            <span className="nav-icon">🤝</span>
            {!collapsed && <span>Affiliate</span>}
          </NavLink>
          
          <NavLink to="/admin/affiliate-report" className="nav-link">
            <span className="nav-icon">📊</span>
            {!collapsed && <span>Báo cáo Affiliate</span>}
          </NavLink>
        </nav>
        
        {/* Logout Button */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <span className="nav-icon">🚪</span>
            {!collapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}


