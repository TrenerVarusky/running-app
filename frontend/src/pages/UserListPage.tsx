import { useQuery } from '@tanstack/react-query'

type User = {
	email: string
	role: string
}

const fetchUsers = async (): Promise<User[]> => {
	const res = await fetch('http://localhost:8000/Users')
	if (!res.ok) throw new Error('Błąd podczas pobierania użytkowników')
	return res.json()
}

function UserListPage () {
	const {
		data: users,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['users'],
		queryFn: fetchUsers,
	})

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
			<h1 className="text-3xl font-bold text-blue-600 mb-4">Lista użytkowników</h1>

			{isLoading && <p>Ładowanie...</p>}
			{error && <p className="text-red-500">Błąd: {(error as Error).message}</p>}

			{users && users.length > 0 ? (
				<ul className="space-y-2">
					{users.map((user, index) => (
						<li key={index} className="bg-white p-3 rounded shadow">
							<strong>{user.email}</strong> — rola: <em>{user.role || 'Brak'}</em>
						</li>
					))}
				</ul>
			) : (
				!isLoading && <p>Brak użytkowników.</p>
			)}
		</div>
	)
}

export default UserListPage
