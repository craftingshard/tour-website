import { useState } from 'react'
import { useAdmin } from '../../context/AdminProviders'

export function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const { login } = useAdmin()
  
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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


