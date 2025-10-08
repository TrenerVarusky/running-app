// components/ArticlesAll.tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useInView } from '../hooks/useInView'
import { useArticlesAll } from '../hooks/useArticlesAll'
import biegaczImg from '../assets/biegacz.png'
import type { LatestPost } from '../api/getPosts'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function fmtDate(iso?: string) {
	if (!iso) return ''
	try {
		return new Date(iso).toLocaleDateString('pl-PL')
	} catch {
		return ''
	}
}

export default function ArticlesAll() {
	const nav = useNavigate()
	const [sp, setSp] = useSearchParams()
	const pageSize = 3

	// page z URL, domyślnie 1
	const page = Math.max(1, Number(sp.get('page') || 1))

	const { ref, isVisible } = useInView(0.3)
	const [animate, setAnimate] = useState(false)

	const { data, isLoading, error, refetch } = useArticlesAll(page, pageSize)

	const posts = useMemo(() => data ?? [], [data])
	const hasPrev = page > 1
	const hasNext = posts.length === pageSize // gdy mniej – to była ostatnia strona

	const handleOpen = (slug: string) => nav(`/post/${slug}`)

	function goTo(p: number) {
		setSp(prev => {
			const s = new URLSearchParams(prev)
			s.set('page', String(p))
			return s
		})
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	useEffect(() => {
		setAnimate(false)
	}, [page])

	// gdy dane się wczytają → jedna klatka później odpal animację
	useEffect(() => {
		if (isLoading) return
		const id = requestAnimationFrame(() => setAnimate(true))
		return () => cancelAnimationFrame(id)
	}, [isLoading, page])

	return (
		<div className="flex flex-col min-h-screen bg-gray-900 text-white" key={page} ref={ref}>
			<Navbar />
			<section className="bg-gray-800 py-20">
				<div className="w-[90vw] max-w-7xl mx-auto text-white">
					<h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Wszystkie artykuły:</h2>

					{isLoading && <div className="text-white/70 text-center">Ładowanie…</div>}
					{error && <div className="text-red-300 text-center">Błąd: {(error as Error).message}</div>}

					{!isLoading && !error && (
						<>
							<div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
								{posts.map((post: LatestPost, i) => {
									const text0 = post.sections?.[0]?.text || ''
									const excerpt = post.subtitle?.trim() || text0.slice(0, 160) + (text0.length > 160 ? '…' : '')
									return (
										<div
											key={`${page}-${post.id}`}
											className={`bg-gray-900 rounded-xl shadow-md overflow-hidden flex flex-col transition transform hover:scale-105 hover:duration-300 duration-1000 ${
												animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
											}`}
											style={{ transitionDelay: `${i * 100}ms` }}>
											<div className="aspect-[16/9] w-full overflow-hidden">
												<img
													src={post.hero_image_url || biegaczImg}
													alt={post.title}
													className="w-full h-full object-cover cursor-pointer"
													onClick={() => handleOpen(post.slug)}
													loading="lazy"
												/>
											</div>
											<div className="p-6 flex flex-col flex-grow">
												<div className="flex gap-2 mb-2 text-sm text-blue-400">
													{post.tags?.slice(0, 3).map((tag, i) => (
														<span key={i} className="bg-blue-950 px-2 py-0.5 rounded-full">
															{tag}
														</span>
													))}
												</div>
												<p className="text-xs text-gray-400 mb-2">{fmtDate(post.created_at)}</p>
												<h3 className="text-xl font-semibold mb-2 cursor-pointer" onClick={() => handleOpen(post.slug)}>
													{post.title}
												</h3>
												<p className="text-sm text-gray-300 flex-grow">{excerpt}</p>
											</div>
										</div>
									)
								})}
							</div>

							{/* Pagination */}
							<div className="mt-10 flex items-center justify-center gap-3">
								<button
									className="px-4 py-2 rounded bg-white/10 hover:bg-white/15 disabled:opacity-40 cursor-pointer"
									disabled={!hasPrev}
									onClick={() => goTo(page - 1)}>
									← Poprzednia
								</button>
								<span className="text-white/70">Strona {page}</span>
								<button
									className="px-4 py-2 rounded bg-white/10 hover:bg-white/15 disabled:opacity-40 cursor-pointer"
									disabled={!hasNext}
									onClick={() => goTo(page + 1)}>
									Następna →
								</button>
							</div>
						</>
					)}
				</div>
			</section>
			<Footer />
		</div>
	)
}
