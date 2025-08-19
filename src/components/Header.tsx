import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useApp } from '../context/AppProviders'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db } from '../firebase'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, bookedTourIds } = useApp()
  const [settings, setSettings] = useState<any | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'settings'), limit(1)))
        if (!snap.empty) setSettings({ id: snap.docs[0].id, ...snap.docs[0].data() })
      } catch {}
    }
    load()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
    setIsMobileMenuOpen(false)
  }

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
              <span className="muted">{user.displayName || user.email}</span>
              <button className="btn ghost" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Đăng nhập</NavLink>
              <NavLink to="/register">Đăng ký</NavLink>
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
              <div className="brand">VN Tour</div>
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
                <button className="btn ghost" onClick={handleLogout} style={{width:'100%', textAlign:'left'}}>Đăng xuất ({user.displayName || user.email})</button>
              ) : (
                <>
                  <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)}>Đăng nhập</NavLink>
                  <NavLink to="/register" onClick={() => setIsMobileMenuOpen(false)}>Đăng ký</NavLink>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}


