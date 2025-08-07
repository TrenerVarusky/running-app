import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import UserListPage from './pages/UserListPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import UserDetailsPage from './pages/UserDetailsPage'
import PrivateRoute from './components/PrivateRoute'
import { useEffect } from 'react'
import { decodeToken, getToken, logout } from './utils/Auth'

function App() {

	useEffect(() => {
		const token = getToken()
		if (token) {
			const decoded = decodeToken(token)
			if (decoded?.exp) {
				const expMs = decoded.exp * 1000
				const now = Date.now()
				const delay = expMs - now

				if (delay > 0) {
					const timeout = setTimeout(() => {
						console.log('Token wygasł – wylogowano')
						logout()
					}, delay)

					return () => clearTimeout(timeout)
				} else {
					logout()
				}
			}
		}
	}, [])
	return (
		<Router>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/users" element={<UserListPage />} />

				<Route path="/userDetails" element={<PrivateRoute element={<UserDetailsPage />} />} />
			</Routes>
		</Router>
	)
}

export default App