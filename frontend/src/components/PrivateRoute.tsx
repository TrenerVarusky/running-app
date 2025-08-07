// components/PrivateRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface Props {
	element: JSX.Element
}

export default function PrivateRoute({ element }: Props) {
	const { loggedIn } = useAuth()

	if (!loggedIn) {
		return <Navigate to="/" />
	}

	return element
}
