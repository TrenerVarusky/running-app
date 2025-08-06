import { useEffect, useRef, useState } from 'react'

export const useInView = (threshold = 0.2) => {
	const ref = useRef<HTMLDivElement | null>(null)
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		if (!ref.current) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true)
				}
			},
			{ threshold }
		)

		observer.observe(ref.current)

		return () => {
			if (ref.current) observer.unobserve(ref.current)
		}
	}, [threshold])

	return { ref, isVisible }
}
