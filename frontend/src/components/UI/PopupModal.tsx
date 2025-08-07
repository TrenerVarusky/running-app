import ReactDOM from 'react-dom'

interface Props {
	title?: string        
	message: string
	onClose: () => void
	confirmText?: string    
}

export default function PopupModal({
	title = 'Informacja',     
	message,
	onClose,
	confirmText = 'OK'       
}: Props) {
	return ReactDOM.createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
			<div className="bg-white text-black rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
				{title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
				<p className="mb-6">{message}</p>
				<button
					onClick={onClose}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
				>
					{confirmText}
				</button>
			</div>
		</div>,
		document.getElementById('modal-root')!
	)
}
