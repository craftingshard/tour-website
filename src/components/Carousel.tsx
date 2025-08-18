import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type CarouselProps = {
	items: React.ReactNode[]
	height?: number
	itemWidth?: number
	ariaLabel?: string
}

export function Carousel({ items, height = 500, itemWidth = 350, ariaLabel = 'Carousel' }: CarouselProps) {
	const trackRef = useRef<HTMLDivElement | null>(null)
	const [containerWidth, setContainerWidth] = useState<number>(0)
	const [current, setCurrent] = useState<number>(0)
	const [outerHeight, setOuterHeight] = useState<number>(height)

	useLayoutEffect(() => {
		const el = trackRef.current
		if (!el) return
		const outer = el.parentElement
		const measure = () => {
			const w = (outer?.getBoundingClientRect().width || el.getBoundingClientRect().width || 0)
			setContainerWidth(Math.max(0, Math.round(w)))
		}
		measure()
		const ro = new ResizeObserver(measure)
		ro.observe(el)
		if (outer) ro.observe(outer)
		window.addEventListener('resize', measure, { passive: true })
		return () => {
			ro.disconnect()
			window.removeEventListener('resize', measure)
		}
	}, [])

	useEffect(() => {
		const el = trackRef.current
		if (!el) return
		const computeHeight = () => {
			const slides = el.querySelectorAll<HTMLDivElement>('.stack-slide')
			const currentSlide = slides[current]
			if (!currentSlide) return
			const slideRect = currentSlide.getBoundingClientRect()
			const styles = getComputedStyle(el)
			const padTop = parseFloat(styles.paddingTop || '0') || 0
			const padBottom = parseFloat(styles.paddingBottom || '0') || 0
			setOuterHeight(Math.round(slideRect.height + padTop + padBottom))
		}
		computeHeight()
		const ro = new ResizeObserver(computeHeight)
		ro.observe(el)
		window.addEventListener('resize', computeHeight, { passive: true })
		return () => {
			ro.disconnect()
			window.removeEventListener('resize', computeHeight)
		}
	}, [current, items.length])

	const overlapPx = 48
	const trailingVisible = 2

	const computeXForIndex = (index: number): number => {
		const baseX = (containerWidth - itemWidth) / 2
		if (index === current) return baseX
		if (index < current) {
			const delta = current - index
			if (delta <= trailingVisible) {
				return baseX - delta * overlapPx
			}
			return baseX - (trailingVisible + 1) * overlapPx - itemWidth // keep consistent off-left relative to base
		}
		// index > current -> place to the right beyond view relative to base
		return baseX + itemWidth + (index - current) * 16 + 200
	}

	const scrollByAmount = (direction: -1 | 1) => {
		setCurrent(prev => {
			const next = Math.max(0, Math.min(items.length - 1, prev + direction))
			return next
		})
	}

	return (
		<div className="carousel-outer" aria-label={ariaLabel} style={{ height: outerHeight }}>
			<div className="carousel-track stack" ref={trackRef}>
				{items.map((node, idx) => {
					const x = computeXForIndex(idx)
					const isPast = idx < current - trailingVisible
					const z = idx === current ? 1000 : idx < current ? 900 - (current - idx) : 800 - (idx - current)
					return (
						<div
							key={idx}
							className="carousel-slide stack-slide"
							style={{ width: itemWidth, transform: `translateX(${x}px)`, zIndex: z, opacity: isPast ? 0 : 1 }}
						>
							{node}
						</div>
					)
				})}
			</div>
			<div className="carousel-controls" role="group" aria-label="Carousel controls">
				<button className="carousel-nav" aria-label="Previous" onClick={() => scrollByAmount(-1)}>
					‹
				</button>
				<button className="carousel-nav" aria-label="Next" onClick={() => scrollByAmount(1)}>
					›
				</button>
			</div>
			<div className="carousel-fade left" aria-hidden />
			<div className="carousel-fade right" aria-hidden />
		</div>
	)
}


