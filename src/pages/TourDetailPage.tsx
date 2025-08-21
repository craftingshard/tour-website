import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppProviders'
import { QuickBookingForm } from '../components/QuickBookingForm'

export function TourDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tours, user, addReview, reviewsByTourId } = useApp()
  const tour = useMemo(() => tours.find(t => t.id === id), [tours, id])
  const related = useMemo(() => tours.filter(t => t.id !== id && (t.location === tour?.location || t.hot)).slice(0,6), [tours, id, tour])
  const reviews = reviewsByTourId[id || ''] || []

  const [rating, setRating] = useState(8)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showQuickBooking, setShowQuickBooking] = useState(false)

  if (!tour) {
    return <div className="container"><div className="card">Tour không tồn tại.</div></div>
  }

  const handleBook = () => {
    setShowQuickBooking(true)
  }

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!user) {
      navigate('/login', { state: { redirectTo: `/tours/${tour.id}` } })
      return
    }
    if (!comment.trim()) {
      setError('Vui lòng nhập nhận xét')
      return
    }
    addReview(tour.id, rating, comment)
    setComment('')
    setRating(5)
  }

  const StarRating = ({ value, outOf = 10, size = 18 }: { value: number; outOf?: number; size?: number }) => {
    const safe = Math.max(0, Math.min(outOf, value))
    const percent = (safe / outOf) * 100
    const stars = '★'.repeat(outOf)
    const commonStyle = { fontSize: size, lineHeight: 1, letterSpacing: '2px', whiteSpace: 'nowrap' as const }
    return (
      <div style={{ position: 'relative', display: 'inline-block' }} aria-label={`Rating ${safe} out of ${outOf}`}>
        <div style={{ ...commonStyle, color: '#334155' }}>{stars}</div>
        <div style={{ ...commonStyle, color: '#fde047', position: 'absolute', inset: 0, width: `${percent}%`, overflow: 'hidden' }}>{stars}</div>
      </div>
    )
  }

  // average rating: prefer reviews; fallback convert tour.rating (likely out of 5) to 10-scale
  const avgFromReviews = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : null
  const fallbackBase = tour.rating <= 5.5 ? tour.rating * 2 : tour.rating
  const avg10 = Number(((avgFromReviews ?? fallbackBase)).toFixed(1))

  return (
    <div className="container">
      <div className="grid" style={{gridTemplateColumns:'1fr', gap:16}}>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <div style={{position:'relative'}}>
            <img src={tour.imageUrl} alt={tour.title} style={{width:'100%', height:420, objectFit:'cover'}} />
            <div style={{position:'absolute', left:12, bottom:12, display:'flex', gap:8, alignItems:'flex-end'}}>
              <div style={{background:'#fde047', color:'#06101a', fontWeight:800, padding:'6px 10px', borderRadius:8, fontSize:18}}>{tour.price.toLocaleString('vi-VN')} ₫</div>
              <div style={{fontWeight:800, fontSize:22, textShadow:'0 1px 0 rgba(0,0,0,.4)'}}>{tour.title}</div>
            </div>
          </div>
          {Array.isArray((tour as any).images) && (tour as any).images.length > 0 && (
            <div style={{padding:12, display:'flex', gap:8, flexWrap:'wrap'}}>
              {(tour as any).images.map((url: string, idx: number) => (
                <img key={idx} src={url} alt={`gallery-${idx}`} style={{width:120, height:90, objectFit:'cover', borderRadius:8, border:'1px solid rgba(0,0,0,.08)'}} />
              ))}
            </div>
          )}
          <div style={{padding:16}}>
            <div className="muted" style={{display:'flex', alignItems:'center', gap:8}}>
              <span>{tour.location}</span>
              <span>•</span>
              <StarRating value={avg10} />
              <span style={{fontWeight:600}}>{avg10.toFixed(1)}/10</span>
            </div>
            <p style={{marginTop:12}}>
              {tour.approved ? (
                `Trải nghiệm hành trình ${tour.title} tại ${tour.location}. Lịch trình hấp dẫn, dịch vụ chu đáo.`
              ) : (
                <>
                  {`Trải nghiệm hành trình ${tour.title} tại ${tour.location}. Lịch trình hấp dẫn, dịch vụ chu đáo.`}
                  <div style={{marginTop:8, padding:8, background:'rgba(234,179,8,.1)', borderRadius:6, fontSize:14, color:'#92400e'}}>
                    ⏳ Tour đang chờ admin duyệt. Mô tả đầy đủ sẽ được hiển thị sau khi duyệt.
                  </div>
                </>
              )}
            </p>
            <div style={{display:'flex', justifyContent:'center', marginTop:16}}>
              <button className="btn primary" onClick={handleBook}>Đặt tour nhanh</button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{marginTop:0}}>Đánh giá</h3>
          {tour.approved ? (
            <>
              <form onSubmit={submitReview} style={{display:'grid', gap:12}}>
                <label style={{display:'grid', gap:6}}>
                  <span>Đánh giá: <b>{rating.toFixed(1)}/10</b></span>
                  <div style={{display:'flex', alignItems:'center', gap:12}}>
                    <input type="range" min={1} max={10} step={0.5} value={rating} onChange={e => setRating(Number(e.target.value))} style={{flex:1}} />
                    <StarRating value={rating} />
                  </div>
                </label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Chia sẻ cảm nhận của bạn..." rows={4} />
                {error && <div className="muted" style={{color:'#fca5a5'}}>{error}</div>}
                <div style={{display:'flex', justifyContent:'center'}}>
                  <button className="btn" type="submit">Gửi đánh giá</button>
                </div>
              </form>
            </>
          ) : (
            <div style={{padding:16, background:'rgba(234,179,8,.1)', borderRadius:8, textAlign:'center', color:'#92400e'}}>
              ⏳ Chức năng đánh giá và bình luận sẽ được mở sau khi tour được admin duyệt.
            </div>
          )}
          <div style={{marginTop:16, display:'grid', gap:8}}>
            {reviews.length === 0 && <div className="muted">Chưa có đánh giá nào.</div>}
            {reviews.map(rv => (
              <div key={rv.id} className="card" style={{padding:12}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                  <div style={{fontWeight:700}}>{rv.userName || 'Người dùng'}</div>
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                    <StarRating value={rv.rating} />
                    <span style={{fontWeight:600}}>{rv.rating.toFixed(1)}/10</span>
                  </div>
                </div>
                <div className="muted" style={{fontSize:12}}>{new Date(rv.createdAt).toLocaleString()}</div>
                <div style={{marginTop:6}}>{rv.comment}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="section-title">Tour liên quan</h3>
          <div className="grid grid-3">
            {related.map(t => (
              <div key={t.id} className="card" onClick={() => navigate(`/tours/${t.id}`)} style={{cursor:'pointer'}}>
                <img src={t.imageUrl} alt={t.title} style={{width:'100%', height:160, objectFit:'cover', borderRadius:8}} />
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8}}>
                  <div>
                    <div style={{fontWeight:700}}>{t.title}</div>
                    <div className="muted">{t.location} • ⭐ {t.rating.toFixed(1)}</div>
                  </div>
                  <div style={{fontWeight:700}}>{t.price.toLocaleString()} đ</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showQuickBooking && (
        <QuickBookingForm 
          tour={tour} 
          onClose={() => setShowQuickBooking(false)} 
        />
      )}
    </div>
  )
}


