// src/components/ScrollToTop.tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
	const { pathname, hash } = useLocation()

	useEffect(() => {
		if (hash) {
			const id = hash.replace('#', '')
			const el = document.getElementById(id)
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'start' })
				return
			}
		}

		// default: na górę
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' }) // albo "smooth"
	}, [pathname, hash])

	return null
}
