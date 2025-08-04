import { useQuery } from '@tanstack/react-query'

const fetchHello = async (): Promise<string> => {
  const res = await fetch('http://localhost:8000/hello')
  const data = await res.json()
  return data.message
}

function App() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hello'],
    queryFn: fetchHello,
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Running App</h1>
      {isLoading && <p>Ładowanie...</p>}
      {error && <p className="text-red-500">Błąd: {(error as Error).message}</p>}
      {data && <p className="text-gray-800">{data}</p>}
    </div>
  )
}

export default App
