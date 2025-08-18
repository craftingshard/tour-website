import { useApp } from '../context/AppProviders'
import { TourCard } from '../components/TourCard'

export function ToursPage() {
  const { tours } = useApp()
  return (
    <div className="container">
      <h2>Danh sách Tours</h2>
      <div className="grid grid-3">
        {tours.map(t => (
          <TourCard key={t.id} id={t.id} />
        ))}
      </div>
    </div>
  )
}


