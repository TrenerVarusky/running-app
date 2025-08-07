import { useState } from 'react'
import BackButton from '../components/BackButton'

export default function RegisterPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-4">
			<div className="bg-gray-900 p-8 rounded-xl w-full max-w-md shadow-lg">
				<h2 className="text-3xl font-bold mb-6 text-center">Utwórz konto</h2>

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

					<p className="text-xs text-gray-400">
						Hasło musi mieć przynajmniej 8 znaków, jedną wielką literę, jedną małą literę, cyfrę i znak specjalny.
					</p>

					<div className="flex items-start gap-2 text-sm text-gray-400">
						<input type="checkbox" className="cursor-pointer"/>
						<p>
							Akceptuję <a href="#" className="text-blue-400 hover:underline">regulamin</a>
						</p>
					</div>

					<button className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded text-white font-semibold cursor-pointer">
						Utwórz konto
					</button>
				</div>

				<p className="text-center text-sm text-gray-400 mt-6">
					Masz już konto? <a href="/login" className="text-blue-400 hover:underline">Zaloguj się</a>
				</p>
                <BackButton />
			</div>
		</div>
	)
}
