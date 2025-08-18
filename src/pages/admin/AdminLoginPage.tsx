import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminProviders'

export function AdminLoginPage() {
  const { login } = useAdmin()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/admin')
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:420, margin:'40px auto'}}>
        <h2 style={{marginTop:0}}>Đăng nhập Admin</h2>
        <form onSubmit={onSubmit} style={{display:'grid', gap:12}}>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" placeholder="Mật khẩu" value={password} onChange={e=>setPassword(e.target.value)} required />
          {error && <div className="muted" style={{color:'#fca5a5'}}>{error}</div>}
          <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
        </form>
      </div>
    </div>
  )
}


