import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth, db } from '../../firebase'
import { addDoc, collection } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'

export function PartnerRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    companyName: '',
    companyAddress: '',
    taxCode: '',
    website: '',
    description: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) return 'Vui lòng nhập họ tên'
    if (!formData.email.trim()) return 'Vui lòng nhập email'
    if (!formData.phone.trim()) return 'Vui lòng nhập số điện thoại'
    if (!formData.password) return 'Vui lòng nhập mật khẩu'
    if (formData.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự'
    if (formData.password !== formData.confirmPassword) return 'Mật khẩu xác nhận không khớp'
    if (!formData.address.trim()) return 'Vui lòng nhập địa chỉ'
    return null
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      // Create user account
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      
      // Update profile
      await updateProfile(cred.user, { displayName: formData.name })

      // Create partner document
      const partnerData = {
        userId: cred.user.uid,
        fullName: formData.name,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        companyName: formData.companyName || null,
        companyAddress: formData.companyAddress || null,
        taxCode: formData.taxCode || null,
        website: formData.website || null,
        description: formData.description || null,
        status: 'pending', 
        role: 'partner',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await addDoc(collection(db, 'partners'), partnerData)

      alert('Đăng ký thành công! Tài khoản của bạn đang chờ admin duyệt.')
      navigate('/login')
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h2>Đăng ký đối tác</h2>
      <form className="card" style={{display:'grid', gap:16, maxWidth:600}} onSubmit={onSubmit}>
        
        {/* Thông tin cá nhân */}
        <div style={{borderBottom:'1px solid rgba(255,255,255,.16)', paddingBottom:16}}>
          <h3 style={{marginBottom:16, color:'#fbbf24'}}>📋 Thông tin cá nhân</h3>
          <div style={{display:'grid', gap:12}}>
            <input 
              name="name"
              placeholder="Họ tên *" 
              value={formData.name} 
              onChange={handleInputChange}
              required 
              style={{padding:12, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} 
            />
            <input 
              name="email"
              placeholder="Email *" 
              value={formData.email} 
              onChange={handleInputChange}
              type="email" 
              required 
              style={{padding:12, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} 
            />
            <input 
              name="phone"
              placeholder="Số điện thoại *" 
              value={formData.phone} 
              onChange={handleInputChange}
              required 
              style={{padding:12, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} 
            />
            <textarea 
              name="address"
              placeholder="Địa chỉ cụ thể *" 
              value={formData.address} 
              onChange={handleInputChange}
              required 
              rows={3}
              style={{padding:12, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white', resize:'vertical'}} 
            />
          </div>
        </div>

        {/* Thông tin công ty */}
        <div style={{borderBottom:'1px solid rgba(255,255,255,.16)', paddingBottom:16}}>
          <h3 style={{marginBottom:16, color:'#10b981'}}>🏢 Thông tin công ty (tùy chọn)</h3>
          <div style={{display:'grid', gap:12}}>
            <input 
              name="companyName"
              placeholder="Tên công ty" 
              value={formData.companyName} 
              onChange={handleInputChange}
              style={{padding:12, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} 
            />
            <textarea 
              name="companyAddress"
              placeholder="Địa chỉ công ty" 
              value={formData.companyAddress} 
              onChange={handleInputChange}
              rows={2}
              style={{padding:12, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white', resize:'vertical'}} 
            />
            <input 
              name="taxCode"
              placeholder="Mã số thuế" 
              value={formData.taxCode} 
              onChange={handleInputChange}
              style={{padding:12, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} 
            />
            <input 
              name="website"
              placeholder="Website công ty" 
              value={formData.website} 
              onChange={handleInputChange}
              style={{padding:12, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} 
            />
            <textarea 
              name="description"
              placeholder="Mô tả về công ty và dịch vụ du lịch" 
              value={formData.description} 
              onChange={handleInputChange}
              rows={3}
              style={{padding:12, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white', resize:'vertical'}} 
            />
          </div>
        </div>

        {/* Thông tin đăng nhập */}
        <div>
          <h3 style={{marginBottom:16, color:'#3b82f6'}}>🔐 Thông tin đăng nhập</h3>
          <div style={{display:'grid', gap:12}}>
            <input 
              name="password"
              placeholder="Mật khẩu *" 
              value={formData.password} 
              onChange={handleInputChange}
              type="password" 
              required 
              style={{padding:12, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} 
            />
            <input 
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu *" 
              value={formData.confirmPassword} 
              onChange={handleInputChange}
              type="password" 
              required 
              style={{padding:12, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} 
            />
          </div>
        </div>

        {error && <div className="muted" style={{color:'#fca5a5'}}>{error}</div>}
        
        <button 
          className="btn primary" 
          type="submit" 
          disabled={loading}
          style={{opacity: loading ? 0.7 : 1}}
        >
          {loading ? 'Đang đăng ký...' : 'Đăng ký đối tác'}
        </button>
        
        <div className="muted" style={{textAlign:'center'}}>
          Đã có tài khoản? <Link to='/login'>Đăng nhập</Link>
        </div>
        
        <div className="card" style={{background:'rgba(255,255,255,.04)', padding:12, fontSize:14}}>
          <div style={{fontWeight:600, marginBottom:8}}>ℹ️ Lưu ý:</div>
          <ul style={{margin:0, paddingLeft:20, lineHeight:1.5}}>
            <li>Tài khoản đối tác cần được admin duyệt trước khi có thể đăng tour</li>
            <li>Sau khi được duyệt, bạn có thể đăng tour và quản lý chúng</li>
            <li>Tour của bạn sẽ được admin kiểm duyệt trước khi hiển thị công khai</li>
            <li>Bạn sẽ nhận được thông báo khi có người đặt tour</li>
          </ul>
        </div>
      </form>
    </div>
  )
}
