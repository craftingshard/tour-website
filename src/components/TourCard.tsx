import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppProviders'

export function TourCard({ id }: { id: string }) {
  const navigate = useNavigate()
  const { tours, selectedTourIds, toggleSelect, bookTour, user, markViewed } = useApp()
  const tour = tours.find(t => t.id === id)
  if (!tour) return null

  const isSelected = selectedTourIds.includes(id)

  const handleSelect = () => {
    markViewed(id)
    toggleSelect(id)
  }

  const handleBook = () => {
    if (user) {
      bookTour(id)
      navigate('/payment', { state: { tourId: id } })
    } else {
      navigate('/register', { state: { redirectTo: '/payment', tourId: id } })
    }
  }

  return (
    <div className="card tour-card carousel-card">
      <div style={{position:'relative', cursor:'pointer'}} onClick={() => navigate(`/tours/${tour.id}`)}>
        <img src={tour.imageUrl} alt={tour.title} />
        <div style={{position:'absolute', left:8, bottom:8, display:'flex', gap:6, alignItems:'flex-end'}}>
          <span style={{background:'#fde047', color:'#06101a', fontWeight:800, padding:'4px 8px', borderRadius:8}}>{tour.price.toLocaleString()} đ</span>
          <span style={{fontWeight:800, textShadow:'0 1px 0 rgba(0,0,0,.4)'}}>{tour.title}</span>
        </div>
      </div>
      <div className="tour-meta">
        <div style={{cursor:'pointer'}} onClick={() => navigate(`/tours/${tour.id}`)}>
          <div style={{fontWeight:700}}>{tour.title}</div>
          <div className="muted">{tour.location} • ⭐ {tour.rating.toFixed(1)}</div>
        </div>
        {tour.hot && <span className="badge">HOT</span>}
      </div>
      <div className="tour-actions" style={{justifyContent:'center'}}>
        <button className="btn" onClick={handleSelect}>{isSelected ? 'Bỏ chọn' : 'Chọn'}</button>
        {isSelected && (
          <button className="btn primary" onClick={handleBook}>Đặt tour</button>
        )}
      </div>
    </div>
  )
}


