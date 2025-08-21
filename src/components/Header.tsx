import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useApp } from '../context/AppProviders'
import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import { db } from '../firebase'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, bookedTourIds } = useApp()
  const [settings, setSettings] = useState<any | null>(null)
  const [isPartner, setIsPartner] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'settings'), limit(1)))
        if (!snap.empty) setSettings({ id: snap.docs[0].id, ...snap.docs[0].data() })
      } catch {}
    }
    load()
  }, [])
  
// useEffect để cập nhật favicon khi settings thay đổi
  useEffect(() => {
    if (settings?.logoUrl) {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = settings.logoUrl;
      } else {
        // Tạo thẻ link mới nếu chưa tồn tại
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.type = 'image/svg+xml';
        newLink.href = settings.logoUrl;
        document.head.appendChild(newLink);
      }
    }
  }, [settings?.logoUrl]); // Phụ thuộc vào settings.logoUrl để chạy lại khi có thay đổi

  useEffect(() => {
    const checkPartnerStatus = async () => {
      if (!user?.uid) {
        setIsPartner(false)
        return
      }
      try {
        const partnerQuery = query(
          collection(db, 'partners'),
          where('userId', '==', user.uid),
          where('status', '==', 'approved')
        )
        const partnerSnap = await getDocs(partnerQuery)
        setIsPartner(!partnerSnap.empty)
      } catch {
        setIsPartner(false)
      }
    }
    checkPartnerStatus()
  }, [user?.uid])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  // Hide header on admin routes
  if (location.pathname.startsWith('/admin')) return null

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand" style={{display:'flex', alignItems:'center', gap:8}}>
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt={settings?.siteName || 'VN Tour'} style={{height:28, width:28, objectFit:'contain', borderRadius:6}} />
          ) : null}
          <span>{settings?.siteName || 'VN Tour'}</span>
        </div>
        <nav className="nav" aria-label="Main Navigation">
          <NavLink to="/" end>Trang chủ</NavLink>
          <NavLink to="/about">Giới thiệu</NavLink>
          <NavLink to="/tours">Tours</NavLink>
          <NavLink to="/guide">Cẩm nang</NavLink>
          <NavLink to="/contact">Liên hệ</NavLink>
        </nav>
        <div className="spacer" />
        <nav className="nav" aria-label="User Navigation">
          <NavLink to="/bookings">Đã đặt ({bookedTourIds.length})</NavLink>
          <NavLink to="/viewed">Đã xem</NavLink>
          {user ? (
            <>
              {isPartner && (
                <NavLink to="/partner-dashboard" style={{background:'rgba(255,255,255,.1)', padding:'4px 8px', borderRadius:6}}>🤝 Bảng điều khiển</NavLink>
              )}
              <span className="muted" style={{padding:'4px 8px', border:'1px solid rgba(255,255,255,.2)', borderRadius:6, display: 'inline-block', 
    maxWidth: '150px',       
    whiteSpace: 'nowrap',   
    overflow: 'hidden',     
    textOverflow: 'ellipsis',
    verticalAlign: 'middle'}}>{user.displayName || user.email}</span>
              <button className="btn ghost" onClick={handleLogout}>Đăng xuất</button>
            </>
                      ) : (
              <>
                <NavLink to="/login">Đăng nhập</NavLink>
                <NavLink to="/register">Đăng ký</NavLink>
                <NavLink to="/partner-register" style={{background:'rgba(255,255,255,.1)', padding:'4px 8px', borderRadius:6}}>🤝 Đối tác</NavLink>
              </>
            )}
        </nav>
        <button
          className="mobile-menu-btn"
          aria-label="Mở menu"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          ☰
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <nav className="mobile-nav" onClick={e => e.stopPropagation()} aria-label="Mobile Navigation">
            <div className="mobile-nav-header">
              <div className="brand">{settings?.siteName || 'VN Tour'}</div>
              <button className="mobile-close-btn" aria-label="Đóng menu" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
            </div>
            <div className="mobile-nav-section">
              <NavLink to="/" end onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</NavLink>
              <NavLink to="/about" onClick={() => setIsMobileMenuOpen(false)}>Giới thiệu</NavLink>
              <NavLink to="/tours" onClick={() => setIsMobileMenuOpen(false)}>Tours</NavLink>
              <NavLink to="/guide" onClick={() => setIsMobileMenuOpen(false)}>Cẩm nang</NavLink>
              <NavLink to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Liên hệ</NavLink>
            </div>
            <div className="mobile-nav-section">
              <NavLink to="/bookings" onClick={() => setIsMobileMenuOpen(false)}>Đã đặt ({bookedTourIds.length})</NavLink>
              <NavLink to="/viewed" onClick={() => setIsMobileMenuOpen(false)}>Đã xem</NavLink>
              {user ? (
                <>
                  {isPartner && (
                    <NavLink to="/partner-dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{background:'rgba(255,255,255,.1)', padding:'4px 8px', borderRadius:6}}>🤝 Bảng điều khiển</NavLink>
                  )}
                  <button className="btn ghost" onClick={handleLogout} style={{width:'100%', textAlign:'left'}}>Đăng xuất ({user.displayName || user.email})</button>
                </>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)}>Đăng nhập</NavLink>
                  <NavLink to="/register" onClick={() => setIsMobileMenuOpen(false)}>Đăng ký</NavLink>
                  <NavLink to="/partner-register" onClick={() => setIsMobileMenuOpen(false)} style={{background:'rgba(255,255,255,.1)', padding:'4px 8px', borderRadius:6}}>🤝 Đối tác</NavLink>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}


