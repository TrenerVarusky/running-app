// src/components/Navbar.tsx
import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FiUser } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'

const Navbar = () => {
	const [menuOpen, setMenuOpen] = useState(false)
	const [shouldRender, setShouldRender] = useState(false)
	const { user, loggedIn } = useAuth()
	const location = useLocation()

	useEffect(() => {
		if (menuOpen) {
			setShouldRender(true)
		} else {
			const timeout = setTimeout(() => setShouldRender(false), 300) // czas trwania animacji
			return () => clearTimeout(timeout)
		}
	}, [menuOpen])

	return (
		<nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 shadow-md bg-gray-900 text-white">
			<h1 className="text-2xl font-bold tracking-wide">
				<Link to="/" onClick={() => setMenuOpen(false)} className="block ">
					RunPower
				</Link>
			</h1>

			<ul className="hidden md:flex space-x-6 font-medium">
				<li className="hover:text-blue-400">
					<Link to="/" onClick={() => setMenuOpen(false)} className="block ">
						Strona główna
					</Link>
				</li>
				<li>
					<Link to="/users" className="hover:text-blue-400 transition">
						Użytkownicy
					</Link>
				</li>
				<li className="hover:text-blue-400 cursor-pointer transition">Kontakt</li>
				{loggedIn && (
					<li>
						<Link to="/userDetails" className="flex items-center gap-2 hover:text-blue-400">
							<FiUser className="text-xl" />
							<span>{user?.name}</span>
						</Link>
					</li>
				)}
				{location.pathname !== '/login' && !loggedIn && (
					<li>
						<Link to="/login" className="hover:text-blue-400 transition">
							Zaloguj się
						</Link>
					</li>
				)}
			</ul>

			{/* Hamburger menu */}
			<div className="md:hidden">
				<button onClick={() => setMenuOpen(!menuOpen)}>
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg">
						{menuOpen ? (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
						) : (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
						)}
					</svg>
				</button>
			</div>

			{/* Mobile dropdown */}
			{shouldRender && (
				<div
					className={`absolute z-50 top-16 left-0 w-full bg-gray-800 px-6 py-4 md:hidden transition-all ${
						menuOpen ? 'animate-slideDownFade' : 'animate-slideUpFade'
					}`}>
					<ul className="space-y-2">
						<li className="hover:text-blue-400">
							<Link to="/" onClick={() => setMenuOpen(false)} className="block ">
								Strona główna
							</Link>
						</li>
						<li>
							<Link to="/users" onClick={() => setMenuOpen(false)} className="block hover:text-blue-400">
								O nas
							</Link>
						</li>
						<li className="hover:text-blue-400">Kontakt</li>
						{loggedIn && (
							<li>
								<Link to="/userDetails" className="flex items-center gap-2 hover:text-blue-400">
									<FiUser className="text-xl" />
									<span>{user?.name}</span>
								</Link>
							</li>
						)}
						{location.pathname !== '/login' && !loggedIn &&  (
							<li>
								<Link to="/login" onClick={() => setMenuOpen(false)} className="block hover:text-blue-400">
									Zaloguj się
								</Link>
							</li>
						)}
					</ul>
				</div>
			)}
		</nav>
	)
}

export default Navbar
