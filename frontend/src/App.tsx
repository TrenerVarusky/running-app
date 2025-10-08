import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import UserListPage from './pages/UserListPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import UserDetailsPage from './pages/UserDetailsPage'
import PrivateRoute from './components/PrivateRoute'
import { useEffect } from 'react'
import { decodeToken, getToken, logout } from './utils/Auth'
import PanelAdmin from './pages/PanelAdmin.tsx'
import Forbidden from './components/Helpers/Forbidden.tsx'
import AdminRoute from './components/Helpers/AdminRoute.tsx'
import NotFound from './components/Helpers/NotFound.tsx'
import PostPage from './pages/PostPage.tsx'
import ScrollToTop from './components/Helpers/ScrollToTop.tsx'
import ArticlesAll from './pages/ArticlesAll.tsx'

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
			<ScrollToTop />
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/users" element={<UserListPage />} />
				<Route path="/articlesAll" element={<ArticlesAll />} />

				<Route path="/userDetails" element={<PrivateRoute element={<UserDetailsPage />} />} />

				 {/* Panel Admin */}
				<Route path="/PanelAdmin" element={<AdminRoute element={<PanelAdmin />} />} />

				{/* Artykuły */}
    			<Route path="/post/:slug" element={<PostPage />} />

				{/* 403 */}
				<Route path="/403" element={<Forbidden />} />

				{/* 404 Not Found */}
				<Route path="*" element={<NotFound />} />
			</Routes>
		</Router>
	)
}

export default App
