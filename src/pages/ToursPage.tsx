import { useApp } from '../context/AppProviders'
import { useLocation } from 'react-router-dom'
import { TourCard } from '../components/TourCard'

export function ToursPage() {
  const { tours } = useApp()
  const location = useLocation() as any
  const filter = (location?.state?.filter || {}) as { location?: string; minPrice?: number; maxPrice?: number }
  const filtered = tours.filter(t => {
    const matchesLocation = filter.location ? String(t.location||'').toLowerCase().includes(filter.location.toLowerCase()) : true
    const price = Number(t.price)||0
    const matchesMin = filter.minPrice != null ? price >= filter.minPrice : true
    const matchesMax = filter.maxPrice != null ? price <= filter.maxPrice : true
    return matchesLocation && matchesMin && matchesMax
  })
  return (
    <div className="container">
      <h2>Danh sách Tours</h2>
      <div className="grid grid-3">
        {(filtered.length ? filtered : tours).map(t => (
          <TourCard key={t.id} id={t.id} />
        ))}
      </div>
    </div>
  )
}


