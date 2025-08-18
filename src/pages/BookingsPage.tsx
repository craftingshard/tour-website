import { useApp } from '../context/AppProviders'

export function BookingsPage() {
  const { bookedTourIds, tours } = useApp()
  const bookedTours = tours.filter(t => bookedTourIds.includes(t.id))
  return (
    <div className="container">
      <h2>Tour đã đặt</h2>
      {bookedTours.length === 0 ? (
        <div className="muted">Chưa có tour nào.</div>
      ) : (
        <div className="grid grid-3">
          {bookedTours.map(t => (
            <div key={t.id} className="card">
              <div style={{fontWeight:700}}>{t.title}</div>
              <div className="muted">{t.location} • {t.price.toLocaleString()} đ</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


