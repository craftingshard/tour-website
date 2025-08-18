import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppProviders'
import { db } from '../firebase'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'

type Booking = {
  id: string
  tourId: string
  amount: number
  method: 'card' | 'cash'
  people: number
  startDate: number
  notes?: string
  paid: boolean
  status: string
  createdAt: number
}

export function ProfilePage(){
  const { user, currentCustomer, saveCustomerProfile, tours } = useApp()
  const [name, setName] = useState(currentCustomer?.name || '')
  const [phone, setPhone] = useState(currentCustomer?.phone || '')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])

  useEffect(() => { setName(currentCustomer?.name || ''); setPhone(currentCustomer?.phone || '') }, [currentCustomer])

  useEffect(() => {
    if (!user) { setBookings([]); return }
    const q = query(collection(db, 'bookings'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const list: Booking[] = []
      snap.forEach(d => list.push({ id: d.id, ...(d.data() as any) }))
      setBookings(list)
    })
    return () => unsub()
  }, [user])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setOk(null)
    try {
      await saveCustomerProfile({ name, phone })
      setOk('Đã lưu hồ sơ')
    } catch (err: any) {
      setError(err?.message || 'Lưu thất bại')
    }
  }

  const tourById = useMemo(() => Object.fromEntries(tours.map(t => [t.id, t])), [tours])

  return (
    <div className="container">
      <h2>Hồ sơ cá nhân</h2>
      <form className="card" style={{display:'grid', gap:12, maxWidth:560}} onSubmit={onSave}>
        <label style={{display:'grid', gap:6}}>
          <span>Họ tên</span>
          <input value={name} onChange={e=>setName(e.target.value)} required />
        </label>
        <label style={{display:'grid', gap:6}}>
          <span>Email</span>
          <input value={user?.email || ''} disabled />
        </label>
        <label style={{display:'grid', gap:6}}>
          <span>Số điện thoại</span>
          <input value={phone} onChange={e=>setPhone(e.target.value)} />
        </label>
        {error && <div className="muted" style={{color:'#fca5a5'}}>{error}</div>}
        {ok && <div className="muted" style={{color:'#86efac'}}>{ok}</div>}
        <div>
          <button className="btn primary" type="submit">Lưu</button>
        </div>
      </form>

      <h3 className="section-title">Đặt tour của tôi</h3>
      {bookings.length === 0 ? (
        <div className="muted">Chưa có đặt tour nào.</div>
      ) : (
        <div className="grid grid-3">
          {bookings.map(b => {
            const t = tourById[b.tourId]
            return (
              <div key={b.id} className="card">
                <div style={{fontWeight:700}}>{t?.title || b.tourId}</div>
                <div className="muted">{t?.location}</div>
                <div>Số người: {b.people}</div>
                <div>Ngày khởi hành: {new Date(b.startDate).toLocaleDateString()}</div>
                <div>Phương thức: {b.method === 'card' ? 'Thẻ/Online' : 'Tiền mặt'}</div>
                <div>Trạng thái: {b.status}{b.paid ? ' (Đã thanh toán)' : ''}</div>
                <div style={{fontWeight:700, marginTop:6}}>Tổng tiền: {b.amount.toLocaleString()} đ</div>
                {b.notes && <div className="muted" style={{marginTop:4}}>Ghi chú: {b.notes}</div>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
