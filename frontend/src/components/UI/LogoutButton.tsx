import { useNavigate } from 'react-router-dom'

export default function LogoutButton() {
	const navigate = useNavigate()

	return (
		<div className="mt-6 flex justify-center">
			<button
				onClick={() => {
					localStorage.removeItem('token')
					localStorage.removeItem('user')
					navigate('/')
				}}
				className="flex items-center gap-2 border border-white text-white px-4 py-2 rounded-lg hover:bg-white/10 transition cursor-pointer">
				Wyloguj się
			</button>
		</div>
	)
}
