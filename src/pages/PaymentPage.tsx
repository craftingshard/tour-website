import { useLocation, useNavigate } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import { useApp } from '../context/AppProviders'
import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

type Ticket = { type: 'adult' | 'child' | 'senior'; label: string; price: number; count: number }

export function PaymentPage() {
  const location = useLocation() as Location & { state?: { tourId?: string; tickets?: Ticket[]; includeInsurance?: boolean; totalAmount?: number; travelDate?: string } }
  const navigate = useNavigate()
  const { tours, createBooking, user } = useApp()
  const tourId: string | undefined = location?.state?.tourId
  const tour = tours.find(t => t.id === tourId)
  const [method, setMethod] = useState<'card' | 'cash' | 'bank_transfer'>('bank_transfer')
  const [startDate, setStartDate] = useState<string>(location?.state?.travelDate ? String(location.state.travelDate).slice(0,10) : '')
  const [notes, setNotes] = useState('')
  const [endDate, setEndDate] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const tickets: Ticket[] = Array.isArray(location?.state?.tickets) ? location.state!.tickets! : []
  const includeInsurance = Boolean(location?.state?.includeInsurance)
  const computedAmount = useMemo(() => {
    if (typeof location?.state?.totalAmount === 'number') return location.state!.totalAmount!
    const base = tickets.reduce((sum, t) => sum + (Number(t.price)||0) * (Number(t.count)||0), 0)
    const insurance = includeInsurance ? 50000 : 0
    return base + insurance
  }, [location?.state?.totalAmount, tickets, includeInsurance])
  const totalPeople = tickets.reduce((sum, t) => sum + (Number(t.count)||0), 0) || 1

  const [banks, setBanks] = useState<Array<{ id: string; name: string; accountNumber: string; accountName: string; qrImageUrl?: string }>>([])

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'banks'))
        const list: Array<{ id: string; name: string; accountNumber: string; accountName: string; qrImageUrl?: string }> = []
        snap.forEach(d => list.push({ id: d.id, ...(d.data() as any) }))
        setBanks(list)
      } catch {}
    }
    load()
  }, [])

  if (!tour) {
    return (
      <div className="container">
        <h2>Thanh toán</h2>
        <div className="muted">Không có tour để thanh toán.</div>
      </div>
    )
  }

  const handlePay = async () => {
    setError(null)
    if (!user) { navigate('/login', { state: { redirectTo: '/payment', tourId } }); return }
    if (!startDate) { setError('Vui lòng chọn ngày khởi hành'); return }
    const startMs = new Date(startDate).getTime()
    const today = new Date(); today.setHours(0,0,0,0)
    if (startMs < today.getTime()) { setError('Ngày khởi hành không thể ở quá khứ'); return }
    let endMs: number | undefined = undefined
    if (endDate) {
      endMs = new Date(endDate).getTime()
      if (!endMs || endMs <= startMs) { setError('Ngày về phải sau ngày đi'); return }
    }
    try {
      await createBooking({
        tourId: tour.id,
        amount: computedAmount,
        method,
        people: totalPeople,
        startDate: startMs,
        endDate: endMs,
        notes: notes.trim() || undefined,
        paid: method === 'card',
      })
      alert('Đặt tour thành công!')
      navigate('/bookings')
    } catch (e: any) {
      setError(e?.message || 'Thanh toán thất bại')
    }
  }

  return (
    <div className="container">
      <h2>Thanh toán</h2>
      <div className="card" style={{display:'grid', gap:12}}>
        <div style={{fontWeight:700, marginBottom:8}}>{tour.title}</div>
        <div className="muted" style={{marginBottom:12}}>{tour.location} • ⭐ {tour.rating.toFixed(1)}</div>
        {tickets.length > 0 && (
          <div className="card" style={{background:'rgba(255,255,255,.04)'}}>
            <div style={{fontWeight:600, marginBottom:8}}>Chi tiết vé</div>
            <div style={{display:'grid', gap:6}}>
              {tickets.filter(t => t.count>0).map((t, idx) => (
                <div key={idx} style={{display:'flex', justifyContent:'space-between'}}>
                  <span>{t.label} × {t.count}</span>
                  <span>{(t.price * t.count).toLocaleString('vi-VN')} ₫</span>
                </div>
              ))}
              {includeInsurance && (
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <span>Bảo hiểm</span>
                  <span>{(50000).toLocaleString('vi-VN')} ₫</span>
                </div>
              )}
            </div>
          </div>
        )}
        <div style={{display:'grid', gap:10}}>
          <label style={{display:'grid', gap:6}}>
            <span>Ngày khởi hành</span>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} />
          </label>
          <label style={{display:'grid', gap:6}}>
            <span>Ngày về</span>
            <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} />
          </label>
          <label style={{display:'grid', gap:6}}>
            <span>Ghi chú</span>
            <textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} />
          </label>
          <label style={{display:'grid', gap:6}}>
            <span>Phương thức</span>
            <select value={method} onChange={e=>setMethod(e.target.value as any)}>
              <option value="card">Thẻ/Online</option>
              <option value="cash">Tiền mặt</option>
              <option value="bank_transfer">Chuyển khoản ngân hàng</option>
            </select>
          </label>
        </div>
        <div style={{fontSize:18, fontWeight:700}}>Tổng tiền: {computedAmount.toLocaleString('vi-VN')} ₫</div>
        {banks.length > 0 && (
          <div className="card" style={{background:'rgba(255,255,255,.04)'}}>
            <div style={{fontWeight:600, marginBottom:8}}>Tài khoản ngân hàng</div>
            <div className="grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:12}}>
              {banks.map(b => (
                <div key={b.id} className="card" style={{display:'grid', gap:8}}>
                  <div style={{fontWeight:700}}>{b.name}</div>
                  <div className="muted">{b.accountName}</div>
                  <div style={{fontFamily:'monospace', fontWeight:700}}>{b.accountNumber}</div>
                  {b.qrImageUrl && (
                    <img src={b.qrImageUrl} alt={`QR ${b.name}`} style={{width:'100%', height:200, objectFit:'contain', background:'#fff', borderRadius:8}} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {error && <div className="muted" style={{color:'#fca5a5'}}>{error}</div>}
        <button className="btn primary" onClick={handlePay}>{method==='card' ? 'Thanh toán' : 'Đặt tour'}</button>
      </div>
    </div>
  )
}


