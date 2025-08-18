import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../../firebase'
import { useApp } from '../../context/AppProviders'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import type { Location } from 'react-router-dom'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation() as Location & { state?: { redirectTo?: string; tourId?: string } }
  const { saveCustomerProfile } = useApp()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (name) {
        await updateProfile(cred.user, { displayName: name })
      }
      await saveCustomerProfile({ name, phone })
      const redirectTo = location?.state?.redirectTo || '/'
      navigate(redirectTo, { state: location?.state })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Register failed'
      setError(message)
    }
  }

  return (
    <div className="container">
      <h2>Đăng ký</h2>
      <form className="card" style={{display:'grid', gap:12, maxWidth:420}} onSubmit={onSubmit}>
        <input placeholder="Họ tên" value={name} onChange={e=>setName(e.target.value)}
               required style={{padding:10, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
               type="email" required style={{padding:10, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} />
        <input placeholder="Số điện thoại" value={phone} onChange={e=>setPhone(e.target.value)}
               style={{padding:10, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} />
        <input placeholder="Mật khẩu" value={password} onChange={e=>setPassword(e.target.value)}
               type="password" required style={{padding:10, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} />
        {error && <div className="muted" style={{color:'#fca5a5'}}>{error}</div>}
        <button className="btn primary" type="submit">Tạo tài khoản</button>
        <div className="muted">Đã có tài khoản? <Link to='/login'>Đăng nhập</Link></div>
        {location?.state?.tourId && <div className="muted">Sau khi đăng ký sẽ chuyển sang thanh toán tour.</div>}
      </form>
    </div>
  )
}


