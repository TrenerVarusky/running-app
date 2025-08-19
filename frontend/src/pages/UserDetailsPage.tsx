import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useProfile, useUpdateProfile } from '../hooks/useProfile'
import { genderOptions, type Gender } from '../constants/profile'

type FormState = {
	first_name: string
	last_name: string
	birth_date: string
	height_cm: string
	weight_kg: string
	gender: '' | Gender
}

type Errors = Partial<Record<keyof FormState, string>>

const toGenderOrNull = (g: '' | Gender): Gender | null => (g === '' ? null : g)
const MAX_BIRTH = '2025-01-01'
const nameRe = /^[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż]{3,}$/

export default function ProfilePage() {
	const { data, isLoading } = useProfile()
	const save = useUpdateProfile()
	const [showContent, setShowContent] = useState(false)

	const [form, setForm] = useState<FormState>({
		first_name: '',
		last_name: '',
		birth_date: '',
		height_cm: '',
		weight_kg: '',
		gender: '',
	})
	const [errors, setErrors] = useState<Errors>({})

	useEffect(() => {
		const t = setTimeout(() => setShowContent(true), 150)
		return () => clearTimeout(t)
	}, [])

	useEffect(() => {
		if (!data) return
		setForm(f => ({
			...f,
			first_name: data.first_name ?? '',
			last_name: data.last_name ?? '',
			birth_date: data.birth_date ?? '',
			height_cm: data.height_cm?.toString() ?? '',
			weight_kg: data.weight_kg?.toString() ?? '',
			gender: (data.gender as Gender) ?? '',
		}))
	}, [data])

	const validate = (s: FormState): Errors => {
		const e: Errors = {}
		const num = (v: string) => Number(v.replace(',', '.'))

		if (!s.first_name.trim()) e.first_name = 'Imię jest wymagane.'
		else if (!nameRe.test(s.first_name.trim())) {
			e.first_name = 'Imię musi mieć conajmniej 3 litery i zawierać tylko litery, spacje, myślnik lub apostrof.'
		}
		if (!s.last_name.trim()) e.last_name = 'Nazwisko jest wymagane.'
		else if (!nameRe.test(s.last_name.trim())) {
			e.last_name = 'Nazwisko musi mieć conajmniej 3 litery i zawierać tylko litery, spacje, myślnik lub apostrof.'
		}
		if (!s.birth_date) e.birth_date = 'Data urodzenia jest wymagana.'
		else if (s.birth_date > MAX_BIRTH) {
			e.birth_date = 'Data nie może być późniejsza niż 01.01.2025.'
		}
		if (!s.gender) e.gender = 'Wybierz płeć.'

		if (!s.weight_kg.trim()) e.weight_kg = 'Waga jest wymagana.'
		else if (!(num(s.weight_kg) > 0)) e.weight_kg = 'Waga musi być większa niż 0.'
		if (!s.height_cm.trim()) e.height_cm = 'Wzrost jest wymagany.'
		else if (!(num(s.height_cm) > 0)) e.height_cm = 'Wzrost musi być większy niż 0.'

		return e
	}

	const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target
		setForm(f => ({ ...f, [name]: value }))
		// czyść błąd tego pola przy edycji
		setErrors(prev => ({ ...prev, [name]: undefined }))
	}

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const errs = validate(form)
		setErrors(errs)
		if (Object.keys(errs).length) return

		const toNum = (v: string) => Number(v.replace(',', '.'))
		save.mutate({
			first_name: form.first_name.trim(),
			last_name: form.last_name.trim(),
			birth_date: form.birth_date,
			height_cm: toNum(form.height_cm),
			weight_kg: toNum(form.weight_kg),
			gender: toGenderOrNull(form.gender),
		})
	}

	return (
		<div className="flex flex-col min-h-screen bg-gray-900 text-white">
			<Navbar />

			<main className="flex-grow py-36 px-4">
				<div className="max-w-5xl mx-auto grid gap-8">
					{/* Karta z profilem (API) */}
					<div
						className={`bg-gray-800 p-8 rounded-xl shadow-lg transform transition-all duration-700 ease-out will-change-[transform,opacity] 
        ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
						<h2
							className={`text-2xl font-bold mb-6 transition-all duration-700 ease-out 
          ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
							style={{ transitionDelay: '80ms' }}>
							Szczegóły profilu
						</h2>

						{isLoading ? (
							<p className="text-white/80">Ładowanie…</p>
						) : (
							<form onSubmit={onSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label htmlFor="first_name" className="block mb-1">
											Imię
										</label>
										<input
											id="first_name"
											name="first_name"
											type="text"
											value={form.first_name}
											onChange={onChange}
											className={`w-full p-2 rounded bg-gray-700 text-white ${
												errors.first_name ? 'ring-2 ring-red-500' : ''
											}`}
											required
										/>
										{errors.first_name && <p className="text-red-400 text-sm mt-1">{errors.first_name}</p>}
									</div>
									<div>
										<label htmlFor="last_name" className="block mb-1">
											Nazwisko
										</label>
										<input
											id="last_name"
											name="last_name"
											type="text"
											value={form.last_name}
											onChange={onChange}
											className={`w-full p-2 rounded bg-gray-700 text-white ${
												errors.last_name ? 'ring-2 ring-red-500' : ''
											}`}
											required
										/>
										{errors.last_name && <p className="text-red-400 text-sm mt-1">{errors.last_name}</p>}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label htmlFor="birth_date" className="block mb-1">
											Data urodzenia
										</label>
										<input
											id="birth_date"
											name="birth_date"
											type="date"
											value={form.birth_date}
											max={MAX_BIRTH}
											onChange={onChange}
											className={`w-full p-2 rounded bg-gray-700 text-white ${
												errors.birth_date ? 'ring-2 ring-red-500' : ''
											}`}
											required
										/>
										{errors.birth_date && <p className="text-red-400 text-sm mt-1">{errors.birth_date}</p>}
									</div>
									<div>
										<label htmlFor="gender" className="block mb-1">
											Płeć
										</label>
										<select
											id="gender"
											name="gender"
											value={form.gender}
											onChange={onChange}
											className={`w-full p-2 rounded bg-gray-700 text-white ${
												errors.gender ? 'ring-2 ring-red-500' : ''
											}`}
											required>
											<option value="">Wybierz</option>
											{genderOptions.map(o => (
												<option key={o.value} value={o.value}>
													{o.label}
												</option>
											))}
										</select>
										{errors.gender && <p className="text-red-400 text-sm mt-1">{errors.gender}</p>}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label htmlFor="weight_kg" className="block mb-1">
											Waga (kg)
										</label>
										<input
											id="weight_kg"
											name="weight_kg"
											type="number"
											step="0.01"
											min={0.01}
											inputMode="decimal"
											value={form.weight_kg}
											onChange={onChange}
											className={`w-full p-2 rounded bg-gray-700 text-white ${
												errors.weight_kg ? 'ring-2 ring-red-500' : ''
											}`}
											required
										/>
										{errors.weight_kg && <p className="text-red-400 text-sm mt-1">{errors.weight_kg}</p>}
									</div>
									<div>
										<label htmlFor="height_cm" className="block mb-1">
											Wzrost (cm)
										</label>
										<input
											id="height_cm"
											name="height_cm"
											type="number"
											step="0.01"
											min={0.01}
											inputMode="decimal"
											value={form.height_cm}
											onChange={onChange}
											className={`w-full p-2 rounded bg-gray-700 text-white ${
												errors.height_cm ? 'ring-2 ring-red-500' : ''
											}`}
											required
										/>
										{errors.height_cm && <p className="text-red-400 text-sm mt-1">{errors.height_cm}</p>}
									</div>
								</div>

								<div className="flex items-center gap-3">
									<button
										type="submit"
										className="mt-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:opacity-60"
										disabled={save.isPending}>
										{save.isPending ? 'Zapisywanie…' : 'Zapisz dane'}
									</button>

									{save.isSuccess && <span className="text-green-500 text-sm">Zapisano ✅</span>}
									{save.isError && <span className="text-red-500 text-sm">Błąd zapisu ❌</span>}
								</div>
							</form>
						)}
					</div>
				</div>
			</main>

			<Footer />
		</div>
	)
}
