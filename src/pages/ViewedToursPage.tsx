import { useApp } from '../context/AppProviders'
import { TourCard } from '../components/TourCard'

export function ViewedToursPage() {
  const { viewedTourIds } = useApp()
  return (
    <div className="container">
      <h2>Danh sách tour đã xem</h2>
      {viewedTourIds.length === 0 ? (
        <div className="muted">Bạn chưa xem tour nào.</div>
      ) : (
        <div className="grid grid-3">
          {viewedTourIds.map(id => <TourCard key={id} id={id} />)}
        </div>
      )}
    </div>
  )
}


