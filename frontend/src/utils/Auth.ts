// utils/auth.ts

export function getToken(): string | null {
	return localStorage.getItem('token')
}

export function getUser(): { email: string; name: string; role: string } | null {
	const user = localStorage.getItem('user')
	return user ? JSON.parse(user) : null
}

export function decodeToken(token: string) {
	try {
		return JSON.parse(atob(token.split('.')[1]))
	} catch (e) {
		return null
	}
}

export function isTokenExpired(token: string): boolean {
	const decoded = decodeToken(token)
	if (!decoded || !decoded.exp) return true
	const now = Math.floor(Date.now() / 1000)
	return decoded.exp < now
}

export function isAuthenticated(): boolean {
	const token = getToken()
	if (!token) return false
	return !isTokenExpired(token)
}

export function logout(): void {
	localStorage.removeItem('token')
	localStorage.removeItem('user')
	window.location.href = '/'
}
