import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import UserListPage from './pages/UserListPage'

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/users" element={<UserListPage />} />
			</Routes>
		</Router>
	)
}

export default App