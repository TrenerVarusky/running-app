import { useState } from 'react'
import { Link } from 'react-router-dom'
import biegaczImg from '../assets/biegacz.png'

export default function LandingPage() {
	const [menuOpen, setMenuOpen] = useState(false)

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
			{/* Navbar */}
			<nav className="flex justify-between items-center px-6 py-4 shadow-md">
				<h1 className="text-2xl font-bold tracking-wide">RunPower</h1>

				<ul className="hidden md:flex space-x-6 font-medium">
					<li className="hover:text-blue-400 cursor-pointer transition">Strona główna</li>
					<li>
						<Link to="/users" className="hover:text-blue-400 transition">
							O nas
						</Link>
					</li>
					<li className="hover:text-blue-400 cursor-pointer transition">Kontakt</li>
				</ul>

				{/* Hamburger */}
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
			</nav>

			{/* Mobile Menu */}
			{menuOpen && (
				<div className="md:hidden px-6 py-2 space-y-2 bg-gray-800">
					<p className="cursor-pointer hover:text-blue-400">Strona główna</p>
					<p className="cursor-pointer hover:text-blue-400">O nas</p>
					<p className="cursor-pointer hover:text-blue-400">Kontakt</p>
				</div>
			)}

			{/* Hero Section */}
			<div className="flex flex-1 items-center justify-between px-6 md:px-20 py-12 flex-col md:flex-row">
				<div className="text-center md:text-left max-w-xl space-y-6">
					<h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
						Biegaj <span className="text-blue-500">lepiej</span> każdego dnia
					</h2>
					<p className="text-lg text-gray-300">
						Nasza aplikacja pomoże Ci śledzić postępy, analizować treningi i osiągać cele.
					</p>
					<button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition">
						Rozpocznij teraz
					</button>
				</div>

				<img src={biegaczImg} alt="Biegacz" className="w-full md:w-1/2 mt-12 md:mt-0 object-contain drop-shadow-xl" />
			</div>
		</div>
	)
}
