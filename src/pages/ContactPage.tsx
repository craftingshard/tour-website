import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../firebase'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setOk(null)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!name.trim()) { setError('Vui lòng nhập họ tên'); return }
    if (!email.trim() || !emailRegex.test(email)) { setError('Email không hợp lệ'); return }
    if (!message.trim() || message.trim().length < 10) { setError('Nội dung tối thiểu 10 ký tự'); return }
    try {
      await addDoc(collection(db, 'contacts'), {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        createdAt: Date.now(),
        status: 'new'
      })
      setOk('Đã gửi liên hệ. Chúng tôi sẽ phản hồi sớm!')
      setName(''); setEmail(''); setMessage('')
    } catch (err: any) {
      setError(err?.message || 'Gửi liên hệ thất bại')
    }
  }

  return (
    <div className="container">
      <h2>Liên hệ</h2>
      <p className="muted">Điền thông tin hoặc email tới support@vntour.example</p>
      <form className="card fancy-contact" style={{display:'grid', gap:12, maxWidth:520}} onSubmit={onSubmit}>
        <div className="field">
          <label>Họ tên</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nhập họ tên" />
        </div>
        <div className="field">
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="field">
          <label>Nội dung</label>
          <textarea rows={5} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Tôi muốn hỏi về..." />
        </div>
        {error && <div className="error-box">{error}</div>}
        {ok && <div className="ok-box">{ok}</div>}
        <button className="btn primary" type="submit">Gửi</button>
      </form>

      <style>{`
        .fancy-contact { 
          background: radial-gradient(1200px 600px at 0% 0%, rgba(102,126,234,.15), transparent 60%),
                      radial-gradient(1200px 600px at 100% 100%, rgba(118,75,162,.15), transparent 60%);
          border: 1px solid rgba(255,255,255,.12);
        }
        .field { display: grid; gap: 6px; }
        .field input, .field textarea { 
          padding: 12px; border-radius: 10px; border: 2px solid rgba(255,255,255,.16); 
          background: rgba(255,255,255,.03); color: white;
        }
        .field input:focus, .field textarea:focus { outline: none; border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,.25) }
        .error-box { background:#fee2e2; color:#991b1b; padding:10px; border-radius:8px; border:1px solid #fecaca }
        .ok-box { background:#dcfce7; color:#166534; padding:10px; border-radius:8px; border:1px solid #bbf7d0 }
      `}</style>
    </div>
  )
}


