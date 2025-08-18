import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import type { Location } from 'react-router-dom'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation() as Location & { state?: { redirectTo?: string; tourId?: string } }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      const redirectTo = location?.state?.redirectTo || '/'
      navigate(redirectTo, { state: location?.state })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
    }
  }

  return (
    <div className="container">
      <h2>Đăng nhập</h2>
      <form className="card" style={{display:'grid', gap:12, maxWidth:420}} onSubmit={onSubmit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
               type="email" required style={{padding:10, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} />
        <input placeholder="Mật khẩu" value={password} onChange={e=>setPassword(e.target.value)}
               type="password" required style={{padding:10, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} />
        {error && <div className="muted" style={{color:'#fca5a5'}}>{error}</div>}
        <button className="btn primary" type="submit">Đăng nhập</button>
        <div className="muted">Chưa có tài khoản? <Link to='/register'>Đăng ký</Link></div>
      </form>
    </div>
  )
}


