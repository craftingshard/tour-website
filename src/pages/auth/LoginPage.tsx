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
  e.preventDefault();
  setError(null);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    const redirectTo = location?.state?.redirectTo || '/';
    navigate(redirectTo, { state: location?.state });
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err) {
      switch (err.code) {
        case 'auth/invalid-credential':
          setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
          break;
        case 'auth/user-disabled':
          setError('Tài khoản của bạn đã bị vô hiệu hóa.');
          break;
        case 'auth/invalid-email':
          setError('Email không hợp lệ.');
          break;
        default:
          setError('Đăng nhập thất bại. Vui lòng thử lại sau.');
          break;
      }
    } else {
      setError('Đăng nhập thất bại. Vui lòng thử lại sau.');
    }
  }
};

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


