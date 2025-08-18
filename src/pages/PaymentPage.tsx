import { useLocation, useNavigate } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import { useApp } from '../context/AppProviders'
import { useMemo, useState } from 'react'

export function PaymentPage() {
  const location = useLocation() as Location & { state?: { tourId?: string } }
  const navigate = useNavigate()
  const { tours, createBooking, user } = useApp()
  const tourId: string | undefined = location?.state?.tourId
  const tour = tours.find(t => t.id === tourId)
  const [people, setPeople] = useState(1)
  const [method, setMethod] = useState<'card' | 'cash'>('card')
  const [startDate, setStartDate] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const amount = useMemo(() => (tour ? tour.price * Math.max(1, people) : 0), [tour, people])

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
    try {
      await createBooking({
        tourId: tour.id,
        amount,
        method,
        people: Math.max(1, people),
        startDate: new Date(startDate).getTime(),
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
      <div className="card" style={{maxWidth:520, display:'grid', gap:12}}>
        <div style={{fontWeight:700, marginBottom:8}}>{tour.title}</div>
        <div className="muted" style={{marginBottom:12}}>{tour.location} • ⭐ {tour.rating.toFixed(1)}</div>
        <div style={{display:'grid', gap:10}}>
          <label style={{display:'grid', gap:6}}>
            <span>Số người</span>
            <input type="number" min={1} value={people} onChange={e=>setPeople(Number(e.target.value)||1)} />
          </label>
          <label style={{display:'grid', gap:6}}>
            <span>Ngày khởi hành</span>
            <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} />
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
            </select>
          </label>
        </div>
        <div style={{fontSize:18, fontWeight:700}}>Tổng tiền: {amount.toLocaleString()} đ</div>
        {error && <div className="muted" style={{color:'#fca5a5'}}>{error}</div>}
        <button className="btn primary" onClick={handlePay}>{method==='card' ? 'Thanh toán' : 'Đặt tour'}</button>
      </div>
    </div>
  )
}


