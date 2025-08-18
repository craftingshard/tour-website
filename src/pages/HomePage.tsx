import { useMemo } from 'react'
import { useApp } from '../context/AppProviders'
import { TourCard } from '../components/TourCard'
import { Carousel } from '../components/Carousel'

export function HomePage() {
  const { tours } = useApp()
  const hotTours = useMemo(() => tours.filter(t => t.hot), [tours])
  const topTours = useMemo(() => [...tours].sort((a,b) => b.rating - a.rating).slice(0,10), [tours])

  return (
    <div className="container">
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap'}}>
        <h2 style={{margin:'8px 0'}}>Khám phá Việt Nam</h2>
        <div className="muted">Menu ngang linh hoạt theo kích thước màn hình</div>
      </div>

      <h3 className="section-title">Tour HOT</h3>
      <Carousel
        height={650}
        itemWidth={400}
        items={hotTours.map(t => (
          <TourCard key={t.id} id={t.id} />
        ))}
        ariaLabel="Hot Tours"
      />

      <h3 className="section-title">Tour nổi bật</h3>
      <div className="grid grid-3">
        {topTours.map(t => (
          <TourCard key={t.id} id={t.id} />
        ))}
      </div>
    </div>
  )
}


