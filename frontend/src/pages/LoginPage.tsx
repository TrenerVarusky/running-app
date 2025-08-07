import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import PopupModal from '../components/UI/PopupModal'
import BackButton from '../components/UI/BackButton'
import { decodeToken, logout } from '../utils/Auth'

const loginUser = async ({ email, password }: { email: string; password: string }) => {
	const response = await fetch('http://localhost:8000/auth/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password }),
	})

	const data = await response.json()

	if (!response.ok) {
		throw new Error(data.detail || 'Nieznany błąd logowania')
	}

	return data
}

function scheduleTokenExpiryLogout(token: string) {
	const decoded = decodeToken(token)
	if (decoded?.exp) {
		const delay = decoded.exp * 1000 - Date.now()
		if (delay > 0) {
			setTimeout(() => {
				logout()
			}, delay)
		}
	}
}

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [errors, setErrors] = useState({ email: '', password: '' })
	const [popupMessage, setPopupMessage] = useState('')
	const [showPopup, setShowPopup] = useState(false)
	const navigate = useNavigate()

	const validate = () => {
		const newErrors: any = {}
		if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Nieprawidłowy e-mail.'
		if (!password.trim()) newErrors.password = 'Hasło jest wymagane.'
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const mutation = useMutation({
		mutationFn: loginUser,
		onSuccess: data => {
			localStorage.setItem('token', data.access_token)

			localStorage.setItem(
				'user',
				JSON.stringify({
					email: data.email,
					name: data.name,
					role: data.role,
				})
			)
			console.log(localStorage.getItem('token'))
			console.log(localStorage.getItem('user'))
			scheduleTokenExpiryLogout(data.access_token)
			console.log('Zalogowano!', data)
			// localStorage.setItem('token', data.access_token) // aby zapisac token
			navigate('/')
		},
		onError: (error: any) => {
			console.error('Błąd logowania:', error.message)
			setPopupMessage(error.message)
			setShowPopup(true)
		},
	})

	const handleLogin = () => {
		if (!validate()) return
		mutation.mutate({ email, password })
	}

	const handlePopupClose = () => setShowPopup(false)

	return (
		<>
			{showPopup && <PopupModal title="Błąd logowania" message={popupMessage} onClose={handlePopupClose} />}

			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4">
				<div className="bg-gray-900 p-8 rounded-xl w-full max-w-md shadow-lg">
					<h2 className="text-3xl font-bold mb-6 text-center">Zaloguj się</h2>

					<div className="space-y-4">
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

						<div className="flex items-center justify-between text-sm text-gray-400">
							<label>
								<input type="checkbox" className="mr-2 cursor-pointer" />
								Zapamiętaj mnie
							</label>
							<button className="hover:underline text-blue-400 cursor-pointer">Nie pamiętam hasła</button>
						</div>

						<button
							onClick={handleLogin}
							className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded text-white font-semibold cursor-pointer">
							{mutation.isPending ? 'Logowanie...' : 'Zaloguj się'}
						</button>
					</div>

					<p className="text-center text-sm text-gray-400 mt-6">
						Nie masz konta?{' '}
						<a href="/register" className="text-blue-400 hover:underline">
							Zarejestruj się
						</a>
					</p>
					<BackButton />
				</div>
			</div>
		</>
	)
}
