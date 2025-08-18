import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdmin } from '../../context/AdminProviders'

export function AdminGuard() {
  const { loading, isAdmin } = useAdmin()
  const location = useLocation()
  if (loading) return <div className="container"><div className="card">Đang kiểm tra quyền truy cập...</div></div>
  if (!isAdmin) return <Navigate to="/admin/login" replace state={{ redirectTo: location.pathname }} />
  return <Outlet />
}


