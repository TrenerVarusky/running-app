// src/components/AdminRoute.tsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

type Props = { element: JSX.Element }

function hasAdminRole(user: any): boolean {
	if (!user) return false
	if (typeof user.is_admin === 'boolean') return user.is_admin
	if (typeof user.role === 'string') return user.role.toLowerCase() === 'admin'
	if (Array.isArray(user.roles)) {
		return user.roles.map((r: any) => String(r).toLowerCase()).includes('admin')
	}
	return false
}

export default function AdminRoute({ element }: Props) {
	const { user, loggedIn } = useAuth()
	const location = useLocation()

	if (!loggedIn) {
		// niezalogowany -> na login
		return <Navigate to="/login" replace state={{ from: location }} />
	}
	if (!hasAdminRole(user)) {
		// zalogowany ale bez roli admin -> 403 (lub /)
		return <Navigate to="/403" replace />
	}
	return element
}
