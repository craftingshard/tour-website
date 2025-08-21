import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppProviders'
import { QuickBookingForm } from './QuickBookingForm'

export function TourCard({ id, tour: tourProp }: { id?: string; tour?: any }) {
  const navigate = useNavigate()
  const { tours } = useApp()
  const tour = tourProp || (id ? tours.find(t => t.id === id) : null)
  const [showQuickBooking, setShowQuickBooking] = useState(false)
  
  if (!tour) return null

  // const resolvedId = tour.id
  const priceNumber = Number(tour.price) || 0
  const ratingNumber = Number(tour.rating) || 0
  // const isSelected = selectedTourIds.includes(resolvedId)
  const displayedTitle = tour.title || tour.name || ''

  // const handleSelect = () => {
  //   markViewed(resolvedId)
  //   toggleSelect(resolvedId)
  // }

  const handleBook = () => {
    setShowQuickBooking(true)
  }

  return (
    <div className="card tour-card carousel-card">
      <div style={{position:'relative'}}>
        <img src={tour.imageUrl} alt={displayedTitle} />
        <div style={{position:'absolute', left:8, bottom:8, display:'flex', gap:6, alignItems:'flex-end'}}>
          <span style={{background:'#fde047', color:'#06101a', fontWeight:800, padding:'4px 8px', borderRadius:8}}>{priceNumber.toLocaleString('vi-VN')} ₫</span>
          <span style={{fontWeight:800, textShadow:'0 1px 0 rgba(0,0,0,.4)'}}>{displayedTitle}</span>
        </div>
        {tour.approved ? (
          <div style={{position:'absolute', top:8, left:8, background:'rgba(16,185,129,.95)', color:'white', padding:'2px 6px', borderRadius:6, fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:6}}>✔ Đã xác nhận</div>
        ) : (
          <div style={{position:'absolute', top:8, left:8, background:'rgba(234,179,8,.95)', color:'#0b1220', padding:'2px 6px', borderRadius:6, fontSize:12, fontWeight:700}}>⏳ Chờ duyệt</div>
        )}
      </div>
      <div className="tour-meta">
        <div style={{cursor:'pointer'}} onClick={() => navigate(`/tours/${tour.id}`)}>
          <div style={{fontWeight:700}}>{displayedTitle}</div>
          <div className="muted">{tour.location} • ⭐ {ratingNumber.toFixed(1)}</div>
        </div>
        {tour.hot && <span className="badge">HOT</span>}
      </div>
      <div className="tour-actions" style={{justifyContent:'center'}}>
        <button className="btn primary" onClick={handleBook}>Đặt tour</button>
      </div>

      {showQuickBooking && createPortal(
        <QuickBookingForm
          tour={tour}
          onClose={() => setShowQuickBooking(false)}
        />,
        document.body
      )}
    </div>
  )
}


