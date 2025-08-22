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
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation() as Location & { state?: { redirectTo?: string; tourId?: string } }
  const { saveCustomerProfile } = useApp()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      const { user } = cred;
      if (name) {
          await updateProfile(user, { displayName: name });
        }
      await saveCustomerProfile({ name, phone, email, address, role: 'customer' }, user.uid);
      const redirectTo = location?.state?.redirectTo || '/'
      navigate(redirectTo, { state: location?.state })
    } catch (err: unknown) {
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      
      if (err instanceof Error && 'code' in err) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Email này đã được sử dụng. Vui lòng sử dụng email khác.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Email không hợp lệ. Vui lòng kiểm tra lại định dạng email.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.';
            break;
          default:
            errorMessage = err.message;
            break;
        }
      } else {
        errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
      }
      setError(errorMessage)
    } 
  }

  return (
    <div className="container">
      <h2>Đăng ký</h2>
      <form className="card" style={{display:'grid', gap:12, maxWidth:420}} onSubmit={onSubmit}>
        <input placeholder="Họ tên" value={address} onChange={e=>setName(e.target.value)}
               required style={{padding:10, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} />
        <input placeholder="Địa chỉ" value={name} onChange={e=>setAddress(e.target.value)}
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


