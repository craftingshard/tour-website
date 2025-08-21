import { useLocation, useNavigate } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import { useApp } from '../context/AppProviders'
import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

type Ticket = { type: 'adult' | 'child' | 'senior'; label: string; price: number; count: number }

export function PaymentPage() {
  const location = useLocation() as Location & { state?: { tourId?: string; tickets?: Ticket[]; includeInsurance?: boolean; totalAmount?: number; travelDate?: string; } }
  const navigate = useNavigate()
  const { tours, createBooking, user } = useApp()
  const tourId: string | undefined = location?.state?.tourId
  const tour = tours.find(t => t.id === tourId)
  const customerPhone = location?.state?.customerPhone ||  ''
  const [method, setMethod] = useState<'cash' | 'bank_transfer' | 'pay_later'>('bank_transfer')
  const [selectedBankId, setSelectedBankId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>(location?.state?.travelDate ? String(location.state.travelDate).slice(0,10) : '')
  const [notes, setNotes] = useState('')
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
    try {
      if (method === 'bank_transfer') {
        if (!selectedBankId) { setError('Vui lòng chọn ngân hàng để chuyển khoản'); return }
      }
      await createBooking({
        tourId: tour.id,
        customerPhone: customerPhone,
        amount: computedAmount,
        method: method === 'pay_later' ? 'cash' : method,
        people: totalPeople,
        startDate: startMs,
        notes: notes.trim() || undefined,
        paid: method !== 'pay_later',
        bankId: method === 'bank_transfer' ? selectedBankId : undefined,
        bankName: method === 'bank_transfer' ? (banks.find(b=>b.id===selectedBankId)?.name || undefined) : undefined,
        payLater: method === 'pay_later',
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
            <span>Số người tham gia</span>
            <input type="number" value={totalPeople} readOnly />
          </label>
          <label style={{display:'grid', gap:6}}>
            <span>Số điện thoại liên hệ</span>
            <input type="tel" value={customerPhone} readOnly />
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
            <span>Phương thức thanh toán</span>
            <select value={method} onChange={e=>setMethod(e.target.value as any)}>
              <option value="cash">Tiền mặt</option>
              <option value="bank_transfer">Chuyển khoản ngân hàng</option>
              <option value="pay_later">Thanh toán sau</option>
            </select>
          </label>
          {method === 'bank_transfer' && banks.length > 0 && (
            <label style={{display:'grid', gap:6}}>
              <span>Chọn ngân hàng để chuyển khoản *</span>
              <select value={selectedBankId} onChange={e=>setSelectedBankId(e.target.value)} required>
                <option value="">-- Chọn ngân hàng --</option>
                {banks.map(b => (
                  <option key={b.id} value={b.id}>{b.name} • {b.accountNumber}</option>
                ))}
              </select>
            </label>
          )}
          {method === 'pay_later' && (
            <div className="card" style={{background:'rgba(255,255,255,.04)', padding:12}}>
              <div style={{fontWeight:600, color:'#fbbf24', marginBottom:8}}>⚠️ Lưu ý</div>
              <div style={{fontSize:14, lineHeight:1.4}}>
                Với phương thức thanh toán sau, bạn có thể hủy tour bất cứ lúc nào trước khi thanh toán. 
                Sau khi thanh toán, tour sẽ không thể hủy trừ khi có yêu cầu đặc biệt và được admin chấp thuận.
              </div>
            </div>
          )}
        </div>
        <div style={{fontSize:18, fontWeight:700}}>Tổng tiền: {computedAmount.toLocaleString('vi-VN')} ₫</div>
        {method === 'bank_transfer' && selectedBankId && banks.length > 0 && (
          <div className="card" style={{background:'rgba(255,255,255,.04)'}}>
            <div style={{fontWeight:600, marginBottom:8}}>Thông tin chuyển khoản</div>
            {(() => {
              const selectedBank = banks.find(b => b.id === selectedBankId)
              if (!selectedBank) return null
              return (
                <div className="card" style={{display:'grid', gap:8}}>
                  <div style={{fontWeight:700}}>{selectedBank.name}</div>
                  <div className="muted">Chủ tài khoản: {selectedBank.accountName}</div>
                  <div style={{fontFamily:'monospace', fontWeight:700}}>Số tài khoản: {selectedBank.accountNumber}</div>
                  {selectedBank.qrImageUrl && (
                    <img src={selectedBank.qrImageUrl} alt={`QR ${selectedBank.name}`} style={{width:'100%', height:200, objectFit:'contain', background:'#fff', borderRadius:8}} />
                  )}
                </div>
              )
            })()}
          </div>
        )}
        {error && <div className="muted" style={{color:'#fca5a5'}}>{error}</div>}
        <button className="btn primary" onClick={handlePay}>
          {method === 'pay_later' ? 'Đặt tour (thanh toán sau)' : 'Đặt tour'}
        </button>
      </div>
    </div>
  )
}


