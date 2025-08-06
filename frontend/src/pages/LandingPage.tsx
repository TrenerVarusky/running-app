import { useState, useEffect } from 'react'
import biegaczImg from '../assets/biegacz.png'
import Navbar from '../components/Navbar'

export default function LandingPage() {
	const [showContent, setShowContent] = useState(false)

	useEffect(() => {
		setTimeout(() => {
			setShowContent(true)
		}, 200)
	}, [])

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col overflow-x-hidden">
			<Navbar />

			{/* Hero Section */}
			<div className="flex flex-1 items-center justify-between px-6 md:px-20 py-12 flex-col md:flex-row pt-32">
				<div
					className={`text-center md:text-left max-w-xl space-y-6 transform transition duration-1000 ease-in-out ${
						showContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
					}`}>
					<h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
						Biegaj <span className="text-blue-500">lepiej</span> każdego dnia
					</h2>
					<p className="text-lg text-gray-300">
						Nasza aplikacja pomoże Ci śledzić postępy, analizować treningi i osiągać cele.
					</p>
					<button className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition px-6 py-3 rounded-full text-white">
						Rozpocznij teraz
					</button>
				</div>

				<img
					src={biegaczImg}
					alt="Biegacz"
					className={`w-full md:w-1/2 mt-12 md:mt-0 object-contain drop-shadow-xl transform transition duration-1000 ease-in-out ${
						showContent ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
					}`}
				/>
			</div>
			<div className="flex flex-1 items-center justify-between px-6 md:px-20 py-12 flex-col md:flex-row">
				<div
					className={`text-center md:text-left max-w-xl space-y-6 transform transition duration-1000 ease-in-out ${
						showContent ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
					}`}>
					<h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
						Biegaj <span className="text-blue-500">lepiej</span> każdego dnia
					</h2>
					<p className="text-lg text-gray-300">
						Nasza aplikacja pomoże Ci śledzić postępy, analizować treningi i osiągać cele.
					</p>
					<button className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition px-6 py-3 rounded-full text-white">
						Rozpocznij teraz
					</button>
				</div>

				<img
					src={biegaczImg}
					alt="Biegacz"
					className={`w-full md:w-1/2 mt-12 md:mt-0 object-contain drop-shadow-xl transform transition duration-1000 ease-in-out ${
						showContent ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
					}`}
				/>
			</div>
		</div>
	)
}
