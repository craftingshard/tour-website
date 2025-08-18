import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useApp } from '../context/AppProviders'

export function Header() {
  const navigate = useNavigate()
  const { user, bookedTourIds } = useApp()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">VN Tour</div>
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
              <span className="muted">{user.email}</span>
              <button className="btn ghost" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Đăng nhập</NavLink>
              <NavLink to="/register">Đăng ký</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}


