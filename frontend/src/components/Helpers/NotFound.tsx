import { Link } from 'react-router-dom'

export default function NotFound() {
	return (
		<div className="min-h-screen bg-slate-900 text-white grid place-items-center p-6">
			<div className="max-w-xl text-center">
				<h1 className="text-3xl font-bold">Ups! 404</h1>
				<p className="text-white/70 mt-2">Nie znaleziono takiej strony.</p>
				<Link to="/" className="inline-block mt-6 rounded-xl bg-white text-slate-900 px-5 py-2 font-semibold">
					Wróć na stronę główną
				</Link>
			</div>
		</div>
	)
}
