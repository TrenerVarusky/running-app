import { useState } from 'react'
import BackButton from '../components/BackButton'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4">
			<div className="bg-gray-900 p-8 rounded-xl w-full max-w-md shadow-lg">
				<h2 className="text-3xl font-bold mb-6 text-center">Zaloguj się</h2>

				<div className="space-y-4">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="E-mail"
						className="w-full p-3 rounded bg-gray-800 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Hasło"
						className="w-full p-3 rounded bg-gray-800 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>

					<div className="flex items-center justify-between text-sm text-gray-400 ">
						<label>
							<input type="checkbox" className="mr-2 cursor-pointer" />
							Zapamiętaj mnie
						</label>
						<button className="hover:underline text-blue-400 cursor-pointer">Nie pamiętam hasła</button>
					</div>

					<button className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded text-white font-semibold cursor-pointer">
						Zaloguj się
					</button>
				</div>

				<p className="text-center text-sm text-gray-400 mt-6">
					Nie masz konta? <a href="/register" className="text-blue-400 hover:underline">Zarejestruj się</a>
				</p>
                <BackButton />
			</div>
		</div>
	)
}
