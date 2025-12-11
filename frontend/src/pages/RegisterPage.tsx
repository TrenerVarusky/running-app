import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/UI/BackButton'
import PopupModal from '../components/UI/PopupModal'

const registerUser = async (userData: { name: string; email: string; password: string; role: string }) => {
	const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(userData),
	})

	const data = await res.json()
	if (!res.ok) {
		throw new Error(data?.detail || 'Błąd rejestracji')
	}

	return data
}

export default function RegisterPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [name, setName] = useState('')
	const [isAccepted, setIsAccepted] = useState(false)
	const [errors, setErrors] = useState({
		name: '',
		email: '',
		password: '',
		terms: '',
	})

	const [showPopup, setShowPopup] = useState(false)
	const [popupMessage, setPopupMessage] = useState('')
	const navigate = useNavigate()

	const validate = () => {
		const newErrors: any = {}

		if (!name.trim()) newErrors.name = 'Imię jest wymagane.'
		if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Nieprawidłowy adres e-mail.'
		if (!password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/)) {
			newErrors.password = 'Hasło musi mieć min. 8 znaków, dużą i małą literę, cyfrę i znak specjalny.'
		}
		if (!isAccepted) newErrors.terms = 'Musisz zaakceptować regulamin.'

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const mutation = useMutation({
		mutationFn: registerUser,
		onSuccess: data => {
			console.log('Rejestracja OK:', data)
			setPopupMessage(`Witaj, ${name}!`)
			setShowPopup(true)
		},
		onError: (error: any) => {
			console.error('Błąd rejestracji:', error.message)
			setPopupMessage(error.message)
			setShowPopup(true)
		},
	})

	const handleRegister = () => {
		if (!validate()) return

		mutation.mutate({
			name,
			email,
			password,
			role: 'Użytkownik',
		})
	}

	const handlePopupClose = () => {
		setShowPopup(false)
		if (mutation.isSuccess) navigate('/')
	}

	return (
		<>
			{showPopup && (
				<PopupModal
					title={mutation.isError ? 'Błąd rejestracji' : 'Rejestracja zakończona!'}
					message={popupMessage}
					onClose={handlePopupClose}
				/>
			)}

			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4">
				<div className="bg-gray-900 p-8 rounded-xl w-full max-w-md shadow-lg">
					<h2 className="text-3xl font-bold mb-6 text-center">Utwórz konto</h2>

					<div className="space-y-4">
						<input
							type="text"
							value={name}
							onChange={e => setName(e.target.value)}
							placeholder="Imię"
							className={`w-full p-3 rounded bg-gray-800 border ${
								errors.name ? 'border-red-500' : 'border-gray-700'
							} placeholder-gray-400 focus:outline-none focus:ring-2 ${
								errors.name ? 'focus:ring-red-500' : 'focus:ring-blue-500'
							}`}
						/>
						{errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}

						<input
							type="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							placeholder="E-mail"
							className={`w-full p-3 rounded bg-gray-800 border ${
								errors.email ? 'border-red-500' : 'border-gray-700'
							} placeholder-gray-400 focus:outline-none focus:ring-2 ${
								errors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'
							}`}
						/>
						{errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}

						<input
							type="password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							placeholder="Hasło"
							className={`w-full p-3 rounded bg-gray-800 border ${
								errors.password ? 'border-red-500' : 'border-gray-700'
							} placeholder-gray-400 focus:outline-none focus:ring-2 ${
								errors.password ? 'focus:ring-red-500' : 'focus:ring-blue-500'
							}`}
						/>
						{errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}

						<div className="flex flex-col text-sm text-gray-400">
							<label className="flex items-start gap-2">
								<input
									type="checkbox"
									checked={isAccepted}
									onChange={e => setIsAccepted(e.target.checked)}
									className={`cursor-pointer mt-1 ${errors.terms ? 'accent-red-500' : 'accent-blue-500'}`}
								/>
								<p>
									Akceptuję{' '}
									<a href="#" className="text-blue-400 hover:underline">
										regulamin
									</a>
								</p>
							</label>
							{errors.terms && <p className="text-red-400 text-sm mt-1">{errors.terms}</p>}
						</div>

						<button
							onClick={handleRegister}
							disabled={mutation.isPending}
							className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded text-white font-semibold cursor-pointer disabled:opacity-50">
							{mutation.isPending ? 'Rejestracja...' : 'Utwórz konto'}
						</button>
					</div>

					<p className="text-center text-sm text-gray-400 mt-6">
						Masz już konto?{' '}
						<a href="/login" className="text-blue-400 hover:underline">
							Zaloguj się
						</a>
					</p>
					<BackButton />
				</div>
			</div>
		</>
	)
}
