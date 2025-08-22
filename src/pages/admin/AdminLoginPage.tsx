import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminProviders'

export function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login, isAuthenticated, currentUser, loading: authLoading } = useAdmin()
  
  useEffect(() => {
    if (isAuthenticated && currentUser && !authLoading) {
      if (currentUser.role === 'staff') {
        navigate('/admin/staff-dashboard', { replace: true })
      } else {
        navigate('/admin', { replace: true })
      }
    }
  }, [isAuthenticated, currentUser, authLoading, navigate])
  
  const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    await login(email, password);
  } catch (err: any) {
    let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại sau.';
    if (err.code) {
      switch (err.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email không hợp lệ.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Không tìm thấy tài khoản. Vui lòng kiểm tra lại email.';
          break;
        case 'permission-denied': 
        case 'unauthorized':
          errorMessage = 'Bạn không có quyền truy cập vào trang quản trị.';
          break;
        default:
          errorMessage = err.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
          break;
      }
    } else if (err.message && err.message.includes('auth/invalid-credential')) {
      errorMessage = 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
    }

    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};
  if (authLoading) {
    return (
      <div className="container">
        <div className="card" style={{maxWidth:420, margin:'40px auto', textAlign: 'center'}}>
          <div>🔄 Đang kiểm tra trạng thái đăng nhập...</div>
        </div>
      </div>
    )
  }
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:420, margin:'40px auto'}}>
        <h2 style={{marginTop:0}}>Đăng nhập Admin</h2>
        {/* Login Form */}
        <form onSubmit={onSubmit} style={{display:'grid', gap:16}}>
          <label style={{display:'grid', gap:8}}>
            <span>Email</span>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </label>
          
          <label style={{display:'grid', gap:8}}>
            <span>Mật khẩu</span>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </label>
          
          {error && (
            <div style={{
              padding: '12px',
              background: '#fef2f2',
              color: '#dc2626',
              borderRadius: '6px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  )
}


