import React, { useEffect, useMemo, useState } from 'react'

// In-memory types (no backend yet)
type Activity = {
	id: string
	type: 'Easy' | 'Intervals' | 'Tempo' | 'Long' | 'Race' | 'Other'
	distanceKm?: number // optional, some workouts are by time
	durationMin?: number
	notes?: string
}

type ActivitiesByDay = Record<string, Activity[]> // key: YYYY-MM-DD

// Date helpers (no external lib)
function pad(n: number) {
	return n.toString().padStart(2, '0')
}
function toKey(d: Date) {
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function startOfMonth(d: Date) {
	return new Date(d.getFullYear(), d.getMonth(), 1)
}
function endOfMonth(d: Date) {
	return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}
function addDays(d: Date, days: number) {
	const nd = new Date(d)
	nd.setDate(nd.getDate() + days)
	return nd
}
function addMonths(d: Date, months: number) {
	return new Date(d.getFullYear(), d.getMonth() + months, 1)
}
function startOfWeek(d: Date) {
	// Monday as first day
	const day = (d.getDay() + 6) % 7 // 0..6 where 0 = Monday
	return addDays(new Date(d.getFullYear(), d.getMonth(), d.getDate()), -day)
}
function endOfWeek(d: Date) {
	return addDays(startOfWeek(d), 6)
}
function isSameDay(a: Date, b: Date) {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
const MONTH_NAMES = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
]
const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function RunCalendar() {
	const today = new Date()
	const [showContent, setShowContent] = useState(false)
	const [cursor, setCursor] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1))
	const [selected, setSelected] = useState<Date | null>(today)
	const [showForm, setShowForm] = useState<boolean>(false)
	const [activities, setActivities] = useState<ActivitiesByDay>({})

	const monthLabel = `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`

	useEffect(() => {
		const t = setTimeout(() => setShowContent(true), 120)
		return () => clearTimeout(t)
	}, [])

	// Build calendar grid (6 weeks to cover all cases)
	const days = useMemo(() => {
		const start = startOfWeek(startOfMonth(cursor))
		const end = endOfWeek(endOfMonth(cursor))
		const tmp: Date[] = []
		let d = start
		while (d <= end) {
			tmp.push(d)
			d = addDays(d, 1)
		}
		return tmp
	}, [cursor])

	function onSelectDay(d: Date) {
		setSelected(d)
		// setShowForm(true)
	}

	function addActivityFor(date: Date, a: Activity) {
		const key = toKey(date)
		setActivities(prev => ({
			...prev,
			[key]: [...(prev[key] ?? []), a],
		}))
	}

	function removeActivity(dateKey: string, id: string) {
		setActivities(prev => ({
			...prev,
			[dateKey]: (prev[dateKey] ?? []).filter(a => a.id !== id),
		}))
	}

	const selectedKey = selected ? toKey(selected) : undefined
	const selectedActivities = selectedKey ? activities[selectedKey] ?? [] : []

	return (
		<section className="p-6">
			<div className="max-w-5xl mx-auto grid gap-8">
				<div
					className={`bg-gray-800 p-8 rounded-xl shadow-lg transform transition-all duration-700 ease-out will-change-[transform,opacity] ${
						showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
					}`}>
					<h2
						className={`text-2xl font-bold mb-6 transition-all duration-700 ease-out  ${
							showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
						}`}
						style={{ transitionDelay: '80ms' }}>
						Kalendarz aktywności
					</h2>

					{/* Calendar card */}
					<div className="lg:col-span-3 bg-slate-950/40 rounded-2xl shadow-xl ring-1 ring-white/10 backdrop-blur p-4">
						<header className="flex items-center justify-between px-2 py-1">
							<button
								onClick={() => setCursor(addMonths(cursor, -1))}
								className="rounded-xl px-3 py-2 hover:bg-white/10 transition cursor-pointer"
								aria-label="Poprzedni miesiąc">
								←
							</button>
							<h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{monthLabel}</h1>
							<button
								onClick={() => setCursor(addMonths(cursor, 1))}
								className="rounded-xl px-3 py-2 hover:bg-white/10 transition cursor-pointer"
								aria-label="Następny miesiąc">
								→
							</button>
						</header>

						<div className="mt-4 grid grid-cols-7 text-center text-sm text-slate-300">
							{WEEKDAY_NAMES.map(d => (
								<div key={d} className="py-2">
									{d}
								</div>
							))}
						</div>

						<ol className="grid grid-cols-7 gap-1">
							{days.map(d => {
								const inMonth = d.getMonth() === cursor.getMonth()
								const isToday = isSameDay(d, today)
								const key = toKey(d)
								const count = activities[key]?.length ?? 0

								return (
									<li key={key}>
										<button
											onClick={() => onSelectDay(d)}
											onDoubleClick={() => {
												setSelected(d) // ustawia dzień, jeśli jeszcze nie jest wybrany
												setShowForm(true) // otwiera popup
											}}
											className={[
												'w-full aspect-square rounded-xl p-2 text-left transition border cursor-pointer',
												inMonth ? 'bg-slate-900/60 border-white/10' : 'bg-slate-900/20 border-white/5 text-slate-500',
												isToday ? 'ring-2 ring-emerald-400/70' : '',
												selected && isSameDay(d, selected) ? 'outline outline-2 outline-emerald-500/60' : '',
											].join(' ')}>
											<div className="flex items-center justify-between">
												<span className="text-sm font-medium">{d.getDate()}</span>
												{count > 0 && (
													<span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
														{count}
													</span>
												)}
											</div>
											{/* Preview chips */}
											<div className="mt-2 space-y-1">
												{(activities[key] ?? []).slice(0, 2).map(a => (
													<div
														key={a.id}
														className="truncate text-[11px] px-2 py-1 rounded bg-white/5 border border-white/10">
														{a.type}
														{a.distanceKm ? ` · ${a.distanceKm} km` : a.durationMin ? ` · ${a.durationMin} min` : ''}
													</div>
												))}
												{count > 2 && <div className="text-[10px] text-slate-400">+{count - 2} więcej…</div>}
											</div>
										</button>
                                        
									</li>
								)
							})}
						</ol>

						<div className="mt-4 flex gap-2">
							<button
								onClick={() => {
									setSelected(today)
									setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
								}}
								className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 cursor-pointer">
								Dziś
							</button>
							<button
								onClick={() => setShowForm(true)}
								className="px-3 py-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 font-semibold cursor-pointer"
								disabled={!selected}>
								Dodaj aktywność
							</button>
						</div>
					</div>

					{/* Sidebar: selected day + form */}
					<div className="lg:col-span-2 mt-6  bg-slate-950/40 rounded-2xl shadow-xl ring-1 ring-white/10 backdrop-blur p-4">
						<h2 className="text-lg font-semibold">{selected ? `Dzień: ${toKey(selected)}` : 'Wybierz dzień'}</h2>

						{/* Existing activities list */}
						{selected && (
							<div className="mt-3 space-y-2">
								{selectedActivities.length === 0 ? (
									<p className="text-sm text-slate-400">Brak aktywności tego dnia.</p>
								) : (
									selectedActivities.map(a => (
										<div key={a.id} className="border border-white/10 rounded-xl p-3 bg-white/5">
											<div className="flex items-center justify-between">
												<div className="font-medium">{a.type}</div>
												<button
													onClick={() => removeActivity(toKey(selected), a.id)}
													className="text-xs px-2 py-1 rounded bg-red-500/80 hover:bg-red-400 text-slate-900 cursor-pointer">
													Usuń
												</button>
											</div>
											<div className="text-sm text-slate-300 mt-1">
												{a.distanceKm != null && <span>{a.distanceKm} km</span>}
												{a.durationMin != null && (
													<span>
														{a.distanceKm != null ? ' · ' : ''}
														{a.durationMin} min
													</span>
												)}
												{a.notes && (
													<span>
														{a.distanceKm != null || a.durationMin != null ? ' · ' : ''}
														{a.notes}
													</span>
												)}
											</div>
										</div>
									))
								)}
							</div>
						)}
					</div>
				</div>
			</div>
			{/* Add form */}
			{selected && (
				<AddActivityForm
					open={showForm}
					onClose={() => setShowForm(false)}
					onSubmit={a => {
						addActivityFor(selected, a)
						setShowForm(false)
					}}
				/>
			)}
		</section>
	)
}

function AddActivityForm({
	open,
	onClose,
	onSubmit,
}: {
	open: boolean
	onClose: () => void
	onSubmit: (a: Activity) => void
}) {
	const [type, setType] = useState<Activity['type']>('Easy')
	const [distance, setDistance] = useState<string>('')
	const [duration, setDuration] = useState<string>('')
	const [notes, setNotes] = useState<string>('')

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		const a: Activity = {
			id: crypto.randomUUID(),
			type,
			distanceKm: distance ? Number(distance) : undefined,
			durationMin: duration ? Number(duration) : undefined,
			notes: notes || undefined,
		}
		onSubmit(a)
		setType('Easy')
		setDistance('')
		setDuration('')
		setNotes('')
	}

	if (!open) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
			{/* 🔥 Przyciemnione tło z rozmyciem */}
			<div
				className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer transition-opacity duration-300"
				onClick={onClose}
			/>

			{/* 🔹 Modal wyśrodkowany względem ekranu */}
			<form
				onSubmit={handleSubmit}
				onClick={e => e.stopPropagation()} // blokuje zamykanie przy kliknięciu wewnątrz
				className="relative z-10 w-[92vw] max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl animate-fade-in">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold">Dodaj aktywność</h3>
					<button type="button" onClick={onClose} className="px-2 py-1 rounded hover:bg-white/10" aria-label="Zamknij">
						✕
					</button>
				</div>

				<div className="grid gap-3">
					<label className="grid gap-1 text-sm">
						<span>Typ</span>
						<select
							value={type}
							onChange={e => setType(e.target.value as Activity['type'])}
							className="rounded-xl bg-slate-800 border border-white/10 px-3 py-2">
							{(['Easy', 'Intervals', 'Tempo', 'Long', 'Race', 'Other'] as const).map(t => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</select>
					</label>

					<label className="grid gap-1 text-sm">
						<span>Dystans (km) — opcjonalnie</span>
						<input
							type="number"
							step="0.01"
							min="0"
							value={distance}
							onChange={e => setDistance(e.target.value)}
							placeholder="np. 10"
							className="rounded-xl bg-slate-800 border border-white/10 px-3 py-2"
						/>
					</label>

					<label className="grid gap-1 text-sm">
						<span>Czas (min) — opcjonalnie</span>
						<input
							type="number"
							step="1"
							min="0"
							value={duration}
							onChange={e => setDuration(e.target.value)}
							placeholder="np. 55"
							className="rounded-xl bg-slate-800 border border-white/10 px-3 py-2"
						/>
					</label>

					<label className="grid gap-1 text-sm">
						<span>Notatki</span>
						<textarea
							value={notes}
							onChange={e => setNotes(e.target.value)}
							placeholder="Interwały 6×800m / T: 4:40/km"
							className="rounded-xl bg-slate-800 border border-white/10 px-3 py-2 min-h-[80px]"
						/>
					</label>
				</div>

				<div className="mt-5 flex justify-end gap-2">
					<button
						type="button"
						onClick={onClose}
						className="px-3 py-2 rounded-xl border border-white/15 hover:bg-white/10">
						Anuluj
					</button>
					<button
						type="submit"
						className="px-3 py-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 font-semibold">
						Zapisz
					</button>
				</div>
			</form>
		</div>
	)
}
