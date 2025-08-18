export function Footer() {
  return (
    <footer style={{borderTop: '1px solid rgba(255,255,255,.08)', padding: '16px'}}>
      <div className="container" style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8}}>
        <div>© {new Date().getFullYear()} VN Tour</div>
        <div className="muted">Liên hệ: support@vntour.example</div>
      </div>
    </footer>
  )
}


