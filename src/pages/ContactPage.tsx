export function ContactPage() {
  return (
    <div className="container">
      <h2>Liên hệ</h2>
      <p className="muted">Điền thông tin hoặc email tới support@vntour.example</p>
      <form className="card" style={{display:'grid', gap:12, maxWidth:520}} onSubmit={(e) => e.preventDefault()}>
        <input placeholder="Họ tên" style={{padding:10, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} />
        <input placeholder="Email" style={{padding:10, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} />
        <textarea placeholder="Nội dung" rows={5} style={{padding:10, borderRadius:8, border:'1px solid rgba(255,255,255,.16)', background:'transparent', color:'white'}} />
        <button className="btn primary" type="submit">Gửi</button>
      </form>
    </div>
  )
}


