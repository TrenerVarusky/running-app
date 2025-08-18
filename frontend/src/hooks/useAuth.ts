import { useEffect, useState } from 'react'
import { getUser, isAuthenticated } from '../utils/Auth'

export function useAuth() {
	const [user, setUser] = useState(getUser())
	const [loggedIn, setLoggedIn] = useState(isAuthenticated())

	useEffect(() => {
		const handleStorageChange = () => {
			setUser(getUser())
			setLoggedIn(isAuthenticated())
		}

		window.addEventListener('storage', handleStorageChange)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
		}
	}, [])

	return { user, loggedIn }
}