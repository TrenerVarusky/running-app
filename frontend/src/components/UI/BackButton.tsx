import { useNavigate } from 'react-router-dom'

export default function BackButton() {
  const navigate = useNavigate()

  return (
    <div className="mt-6 flex justify-center">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 border border-white text-white px-4 py-2 rounded-lg hover:bg-white/10 transition cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Wróć do strony głównej
      </button>
    </div>
  )
}
