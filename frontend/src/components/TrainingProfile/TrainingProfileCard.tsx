import { useEffect, useState } from 'react'
import { useTrainingProfile } from '../../hooks/useTrainingProfile'
import Field from '../UI/Field'
import ReadOnlyField from '../UI/ReadOnlyField'
import HeartRateZones from './HeartRateZones'

type FormVals = {
	height_cm: string
	weight_kg: string
	resting_hr: string
}
type Errors = Partial<Record<keyof FormVals, string>>

const toNum = (s: string) => {
	if (s.trim() === '') return null
	const n = Number(s.replace(',', '.'))
	return Number.isFinite(n) ? n : null
}

export default function TrainingProfileCard() {
	const { data, isLoading, isSaving, save } = useTrainingProfile()

	const [showContent, setShowContent] = useState(false)
	const [modalOpen, setModalOpen] = useState(false)
	const [errors, setErrors] = useState<Errors>({})
	const [submitError, setSubmitError] = useState<string | null>(null)

	const [form, setForm] = useState<FormVals>({
		height_cm: '',
		weight_kg: '',
		resting_hr: '',
	})

	useEffect(() => {
		const t = setTimeout(() => setShowContent(true), 120)
		return () => clearTimeout(t)
	}, [])

	useEffect(() => {
		if (!data) return
		setForm({
			height_cm: data.height_cm != null ? String(data.height_cm) : '',
			weight_kg: data.weight_kg != null ? String(data.weight_kg) : '',
			resting_hr: data.resting_hr != null ? String(data.resting_hr) : '',
		})
	}, [data])

	const openModal = () => {
		setSubmitError(null)
		setErrors({})
		setModalOpen(true)
	}
	const closeModal = () => setModalOpen(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()

		const height = toNum(form.height_cm)
		const weight = toNum(form.weight_kg)
		const hr = toNum(form.resting_hr)

		// walidacja dopiero na sparsowanych liczbach
		const errs: Partial<Record<keyof FormVals, string>> = {}
		if (height == null || height <= 0) errs.height_cm = 'Podaj wzrost > 0'
		if (weight == null || weight <= 0) errs.weight_kg = 'Podaj wagę > 0'
		if (hr == null || hr <= 0) errs.resting_hr = 'Podaj HR spocz. > 0'
		// (opcjonalnie) zakresy:
		if (height && (height < 120 || height > 230)) errs.height_cm = 'Wzrost 120–230 cm'
		if (weight && (weight < 35 || weight > 250)) errs.weight_kg = 'Waga 35–250 kg'
		if (hr && (hr < 30 || hr > 120)) errs.resting_hr = 'HR spocz. 30–120 bpm'

		setErrors(errs)
		if (Object.keys(errs).length) return

		try {
			await save(
				{
					height_cm: height!,
					weight_kg: weight!,
					resting_hr: hr!,
				}
				// {
				// 	onSuccess: () => closeModal(),
				// 	onError: e => setSubmitError(extractErr(e)),
				// }
			)
			closeModal()
		} catch (err: any) {
			console.log(err)
			// spróbuj wyciągnąć komunikat z Axiosa
			const detail = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message ?? 'Błąd zapisu'
			setSubmitError(detail) // 👈 pokaż komunikat z backendu („Nie podano daty urodzenia…”)
		}
	}

	const hasZones = !!data?.hr_zones

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
						Profil biegacza
					</h2>

					{isLoading ? (
						<p className="text-white/80">Ładowanie…</p>
					) : hasZones ? (
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<ReadOnlyField label="Wzrost (cm)" value={data?.height_cm ?? '—'} />
								<ReadOnlyField label="Waga (kg)" value={data?.weight_kg ?? '—'} />
								<ReadOnlyField label="Tętno spocz. (bpm)" value={data?.resting_hr ?? '—'} />
							</div>

							<HeartRateZones zones={data?.hr_zones} />

							<div className="flex items-center gap-3">
								<button onClick={openModal} className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded  cursor-pointer">
									Zmień dane
								</button>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							<p className="text-white/80">Brakuje danych do wyliczenia stref tętna.</p>
							<button
								onClick={openModal}
								className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded font-medium cursor-pointer">
								Dodaj szczegóły użytkownika
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Modal */}
			{modalOpen && (
				<div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
					<div className="w-full max-w-md rounded-2xl bg-gray-800 border border-white/10 shadow-xl">
						<div className="p-5 border-b border-white/10 flex items-center justify-between">
							<h3 className="font-semibold">Uzupełnij dane</h3>
							<button onClick={closeModal} className="p-2 rounded hover:bg-white/10  cursor-pointer" aria-label="Zamknij modal">
								✕
							</button>
						</div>

						<form onSubmit={handleSubmit} className="p-5 space-y-4">
							<Field
								name="height_cm"
								label="Wzrost (cm)"
								type="number"
								value={form.height_cm}
								onChange={e => setForm(f => ({ ...f, height_cm: e.target.value }))}
								error={errors.height_cm}
							/>
							<Field
								name="weight_kg"
								label="Waga (kg)"
								type="number"
								value={form.weight_kg}
								onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))}
								error={errors.weight_kg}
							/>
							<Field
								name="resting_hr"
								label="Tętno spoczynkowe (bpm)"
								type="number"
								value={form.resting_hr}
								onChange={e => setForm(f => ({ ...f, resting_hr: e.target.value }))}
								error={errors.resting_hr}
							/>

							{submitError && <p className="text-red-400 text-sm">{submitError}</p>}

							<div className="flex items-center gap-3 pt-2">
								<button type="submit" className="bg-white text-black px-4 py-2 rounded-xl cursor-pointer" disabled={isSaving}>
									{isSaving ? 'Zapisywanie…' : 'Zapisz'}
								</button>
								<button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl border border-white/20  cursor-pointer">
									Anuluj
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</section>
	)
}
