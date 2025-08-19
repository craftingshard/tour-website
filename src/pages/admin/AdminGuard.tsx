import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdmin } from '../../context/AdminProviders'

export function AdminGuard() {
  const { loading, isAuthenticated, currentUser } = useAdmin()
  const location = useLocation()
  
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-card">
          <div className="loading-spinner">🔄</div>
          <div>Đang kiểm tra quyền truy cập...</div>
        </div>
        <style>{`
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
        `}</style>
      </div>
    )
  }
  
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/admin/login" replace state={{ redirectTo: location.pathname }} />
  }
  
  // Check if user is active
  if (!currentUser.active) {
    return (
      <div className="access-denied">
        <div className="denied-card">
          <div className="denied-icon">🚫</div>
          <h2>Tài khoản đã bị vô hiệu hóa</h2>
          <p>Vui lòng liên hệ quản trị viên để được hỗ trợ</p>
        </div>
        <style>{`
          .access-denied {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f8fafc;
          }
          .denied-card {
            background: white;
            padding: 3rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
          }
          .denied-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          .denied-card h2 {
            color: #dc2626;
            margin-bottom: 1rem;
          }
          .denied-card p {
            color: #6b7280;
          }
        `}</style>
      </div>
    )
  }
  
  return <Outlet />
}


