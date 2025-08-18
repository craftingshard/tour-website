import { PropsWithChildren, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAdmin } from '../../context/AdminProviders'

export function AdminLayout({ children }: PropsWithChildren) {
  const { logout } = useAdmin()
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div style={{display:'grid', gridTemplateColumns: collapsed ? '64px 1fr' : '240px 1fr', minHeight:'calc(100vh - 120px)'}}> 
      <aside style={{borderRight:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'space-between', padding:12}}>
          {!collapsed && <div style={{fontWeight:800}}>Admin</div>}
          <button className="btn ghost" onClick={()=>setCollapsed(s=>!s)}>{collapsed ? '»' : '«'}</button>
        </div>
        <nav style={{display:'grid', gap:4, padding:8}}>
          <NavLink to="/admin/customers" className="nav-link">Khách hàng</NavLink>
          <NavLink to="/admin/staff" className="nav-link">Nhân viên</NavLink>
          <NavLink to="/admin/tours" className="nav-link">Tour</NavLink>
          <NavLink to="/admin/posts" className="nav-link">Bài viết</NavLink>
          <NavLink to="/admin/theme" className="nav-link">Theme</NavLink>
          <NavLink to="/admin/about" className="nav-link">Giới thiệu</NavLink>
          <NavLink to="/admin/bookings" className="nav-link">Đặt tour</NavLink>
        </nav>
        <div style={{padding:8}}>
          <button className="btn" onClick={logout}>Đăng xuất</button>
        </div>
      </aside>
      <section style={{padding:16}}>
        {children}
      </section>
    </div>
  )
}


