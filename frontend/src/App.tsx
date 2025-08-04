import { useQuery } from '@tanstack/react-query'

type User = {
  id: number
  name: string
  email: string
}

const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch('http://localhost:8000/users')
  if (!res.ok) throw new Error('Błąd podczas pobierania użytkowników')
  return res.json()
}

function App() {
  const { data: users, isLoading, error } = useQuery({
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
          {users.map((user) => (
            <li key={user.id} className="bg-white p-3 rounded shadow">
              <strong>{user.name}</strong> ({user.email})
            </li>
          ))}
        </ul>
      ) : (
        !isLoading && <p>Brak użytkowników.</p>
      )}
    </div>
  )
}

export default App
