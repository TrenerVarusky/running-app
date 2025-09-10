// src/pages/PanelAdmin.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { slugify } from '../utils/PanelAdmin/slug.ts'
import { TITLE_MAX, SUBTITLE_MAX, SLUG_MAX, ALLOWED_TYPES, MAX_BYTES } from '../utils/PanelAdmin/constants.ts'
import { useCreatePost } from '../hooks/useCreatePost.ts'

type SectionDraft = { heading?: string; text: string }
type ServerPost = { id: number; slug: string }

export default function PanelAdmin() {
	const nav = useNavigate()
	const { mutateAsync: createPost, isPending: isSaving, error: saveError } = useCreatePost()

	// animacja wejścia
	const [showContent, setShowContent] = useState(false)
	useEffect(() => {
		const t = setTimeout(() => setShowContent(true), 40)
		return () => clearTimeout(t)
	}, [])

	// form state
	const [title, setTitle] = useState('')
	const [subtitle, setSubtitle] = useState('')
	const [slug, setSlug] = useState('')
	const [sections, setSections] = useState<SectionDraft[]>([{ text: '' }])
	const [tagInput, setTagInput] = useState('')
	const [tags, setTags] = useState<string[]>([])
	const [published, setPublished] = useState(true)
	const [hero, setHero] = useState<File | null>(null)
	const [gallery, setGallery] = useState<File[]>([])
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<ServerPost | null>(null)

	useEffect(() => {
		setSlug(slugify(title))
	}, [title])

	// helpers
	function addSection() {
		setSections(s => [...s, { text: '' }])
	}
	function removeSection(i: number) {
		setSections(s => (s.length <= 1 ? s : s.filter((_, idx) => idx !== i)))
	}
	function moveSection(i: number, dir: -1 | 1) {
		setSections(s => {
			const j = i + dir
			if (j < 0 || j >= s.length) return s
			const copy = [...s]
			const tmp = copy[i]
			copy[i] = copy[j]
			copy[j] = tmp
			return copy
		})
	}
	function addTagFromInput() {
		const raw = tagInput.trim()
		if (!raw) return
		const parts = raw
			.replace(/;/g, ',')
			.split(',')
			.map(s => s.trim())
			.filter(Boolean)
		setTags(Array.from(new Set([...tags, ...parts])))
		setTagInput('')
	}
	function removeTag(i: number) {
		setTags(prev => prev.filter((_, idx) => idx !== i))
	}

	const imageError = useMemo(() => {
		if (!hero) return 'Wymagany plik obrazu.'
		if (!ALLOWED_TYPES.includes(hero.type as any)) return 'Niedozwolony typ (JPG/PNG/WebP).'
		if (hero.size > MAX_BYTES) return 'Plik jest zbyt duży (>5MB).'
		return null
	}, [hero])

	const sectionsValid = useMemo(
		() =>
			sections.length >= 1 && sections.every(s => s.text.trim().length > 0 && (!s.heading || s.heading.length <= 200)),
		[sections]
	)

	const valid = useMemo(
		() =>
			title.trim().length > 0 &&
			title.length <= TITLE_MAX &&
			subtitle.length <= SUBTITLE_MAX &&
			slug.trim().length > 0 &&
			slug.length <= SLUG_MAX &&
			tags.length >= 1 &&
			sectionsValid &&
			!imageError,
		[title, subtitle, slug, tags, sectionsValid, imageError]
	)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (isSaving) return

		setError(null)
		setSuccess(null)

		const finalSlug = slugify(title).slice(0, SLUG_MAX)
		if (!finalSlug) {
			setError('Podaj tytuł, aby utworzyć slug.')
			return
		}
		setSlug(finalSlug) // pokaż w UI co faktycznie poleci

		try {
			const saved = await createPost({
				title: title.trim(),
				subtitle: subtitle.trim() || undefined,
				slug: finalSlug,
				published,
				tags,
				sections: sections.map(s => ({ heading: s.heading?.trim() || undefined, text: s.text.trim() })),
				hero,
				gallery,
			})

			setSuccess(saved)

			// reset formularza
			setTitle('')
			setSubtitle('')
			setSlug('')
			setSections([{ text: '' }])
			setTags([])
			setHero(null)
			setGallery([])
			setPublished(true)
		} catch (err: any) {
			setError(err.message || 'Wystąpił błąd')
		}
	}

	return (
		<div className="flex flex-col min-h-screen bg-gray-900 text-white">
			<Navbar />

			<main className="flex-grow pt-24 py-12 px-4">
				<div className="max-w-5xl mx-auto grid gap-8">
					<div
						className={`bg-gray-800 p-8 rounded-xl shadow-lg transform transition-all duration-700 ease-out will-change-[transform,opacity]
            ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
						<div className="flex items-center justify-between mb-6">
							<h2
								className={`text-2xl font-bold transition-all duration-700 ease-out 
                ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
								style={{ transitionDelay: '80ms' }}>
								Nowy artykuł
							</h2>

							<Link to="/" className="text-sm text-white/70 hover:text-white">
								← Strona główna
							</Link>
						</div>

						<p className="text-white/70 text-sm mb-6">
							Wymagane: tytuł, slug, ≥1 tag, ≥1 sekcja, hero (JPG/PNG/WebP &lt; 5MB).
						</p>

						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Tytuł + lead */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block mb-1">
										Tytuł ({title.length}/{TITLE_MAX}) *
									</label>
									<input
										value={title}
										onChange={e => setTitle(e.target.value.slice(0, TITLE_MAX))}
										maxLength={TITLE_MAX}
										className="w-full p-2 rounded bg-gray-700 text-white ring-1 ring-transparent focus:ring-white/20"
										placeholder="Np. Jak zacząć biegać od zera"
										required
									/>
								</div>
								<div>
									<label className="block mb-1">
										Mały tytuł ({subtitle.length}/{SUBTITLE_MAX})
									</label>
									<input
										value={subtitle}
										onChange={e => setSubtitle(e.target.value.slice(0, SUBTITLE_MAX))}
										maxLength={SUBTITLE_MAX}
										className="w-full p-2 rounded bg-gray-700 text-white ring-1 ring-transparent focus:ring-white/20"
										placeholder="Wprowadzenie do wpisu…"
									/>
								</div>
							</div>

							{/* Slug + generator */}
							<div>
								<label className="block mb-1">
									Slug ({slug.length}/{SLUG_MAX}) *
								</label>
								<input
									value={slug}
									readOnly
									className="w-full p-2 rounded bg-gray-700 text-white ring-1 ring-transparent focus:ring-white/20 opacity-80 cursor-not-allowed"
									placeholder="będzie wygenerowany z tytułu"
								/>
							</div>

							{/* Sekcje */}
							<div className="rounded-xl bg-gray-700/40 p-4">
								<div className="flex items-center justify-between mb-2">
									<h3 className="font-semibold">Sekcje ({sections.length})</h3>
									<button
										type="button"
										onClick={addSection}
										className="rounded bg-white text-gray-900 px-3 py-1 text-sm font-medium">
										Dodaj sekcję
									</button>
								</div>

								<div className="space-y-6">
									{sections.map((s, i) => (
										<div key={i} className="rounded-lg bg-gray-800/70 p-3 ring-1 ring-white/10">
											<div className="flex items-center justify-between mb-2">
												<span className="text-xs text-white/60">Sekcja {i + 1}</span>
												<div className="flex gap-2">
													<button
														type="button"
														onClick={() => moveSection(i, -1)}
														className="px-2 py-1 rounded bg-white/10 text-sm disabled:opacity-40"
														disabled={i === 0}>
														↑
													</button>
													<button
														type="button"
														onClick={() => moveSection(i, 1)}
														className="px-2 py-1 rounded bg-white/10 text-sm disabled:opacity-40"
														disabled={i === sections.length - 1}>
														↓
													</button>
													<button
														type="button"
														onClick={() => removeSection(i)}
														className="px-2 py-1 rounded bg-red-500/20 text-sm disabled:opacity-40"
														disabled={sections.length <= 1}>
														Usuń
													</button>
												</div>
											</div>

											<input
												value={s.heading ?? ''}
												onChange={e =>
													setSections(prev =>
														prev.map((x, idx) => (idx === i ? { ...x, heading: e.target.value.slice(0, 200) } : x))
													)
												}
												maxLength={200}
												placeholder="Nagłówek sekcji (opcjonalny)"
												className="w-full p-2 rounded bg-gray-700 text-white mb-2"
											/>
											<textarea
												value={s.text}
												onChange={e =>
													setSections(prev => prev.map((x, idx) => (idx === i ? { ...x, text: e.target.value } : x)))
												}
												rows={5}
												placeholder="Treść sekcji…"
												className="w-full p-2 rounded bg-gray-700 text-white"
												required
											/>
											{s.text.trim().length === 0 && (
												<p className="text-xs text-red-300 mt-1">Sekcja musi zawierać tekst.</p>
											)}
										</div>
									))}
								</div>
							</div>

							{/* Tagi */}
							<div>
								<div className="flex items-baseline justify-between">
									<label className="block mb-1">Tagi *</label>
									<span className="text-xs text-white/60">Enter/przecinek dodaje tag</span>
								</div>
								<div className="rounded-xl bg-gray-700/40 p-2">
									<div className="flex flex-wrap gap-2">
										{tags.map((t, i) => (
											<span
												key={i}
												className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-white/10 ring-1 ring-white/20">
												{t}
												<button type="button" onClick={() => removeTag(i)} className="text-white/70 hover:text-white">
													×
												</button>
											</span>
										))}
									</div>
									<input
										value={tagInput}
										onChange={e => setTagInput(e.target.value)}
										onKeyDown={e => {
											if (e.key === 'Enter' || e.key === ',') {
												e.preventDefault()
												addTagFromInput()
											}
										}}
										className="mt-2 w-full p-2 rounded bg-gray-800 text-white"
										placeholder="np. Trening, Wiedza"
									/>
									{tags.length === 0 && <p className="text-xs text-red-300 mt-1">Dodaj co najmniej jeden tag.</p>}
								</div>
							</div>

							{/* Obrazki */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<div className="flex items-baseline justify-between">
										<label className="block mb-1">Hero image *</label>
										<span className="text-xs text-white/60">JPG/PNG/WebP, max 5MB</span>
									</div>
									<input
										type="file"
										accept="image/*"
										onChange={e => setHero(e.target.files?.[0] || null)}
										className="w-full p-2 rounded bg-gray-700 text-white"
									/>
									{hero && (
										<div className="mt-2 text-xs text-white/70">
											{hero.name} ({Math.round(hero.size / 1024)} KB)
										</div>
									)}
									{imageError && <div className="text-xs text-red-300 mt-1">{imageError}</div>}
								</div>
								<div>
									<label className="block mb-1">Galeria</label>
									<input
										type="file"
										accept="image/*"
										multiple
										onChange={e => setGallery(Array.from(e.target.files || []))}
										className="w-full p-2 rounded bg-gray-700 text-white"
									/>
									{gallery.length > 0 && (
										<div className="mt-2 text-xs text-white/70">Wybrano {gallery.length} plików.</div>
									)}
								</div>
							</div>

							{/* Publikacja + akcje */}
							<div className="flex items-center gap-3">
								<input
									id="published"
									type="checkbox"
									checked={published}
									onChange={e => setPublished(e.target.checked)}
								/>
								<label htmlFor="published" className="select-none">
									Opublikowany
								</label>
							</div>

							{(error || saveError) && (
								<div className="rounded bg-red-500/10 text-red-200 p-3 ring-1 ring-red-500/30">
									{error || (saveError as Error)?.message}
								</div>
							)}
							{success && (
								<div className="rounded bg-emerald-500/10 text-emerald-200 p-3 ring-1 ring-emerald-500/30">
									Dodano artykuł (ID: {success.id}).
									<button type="button" onClick={() => nav(`/post/${success.slug}`)} className="ml-3 underline">
										Zobacz
									</button>
								</div>
							)}

							<div className="flex items-center gap-3">
								<button
									type="submit"
									disabled={!valid || isSaving}
									className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
									{isSaving ? 'Zapisywanie…' : 'Zapisz artykuł'}
								</button>
							</div>
						</form>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	)
}
