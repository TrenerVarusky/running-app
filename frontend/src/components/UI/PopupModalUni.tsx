type PopupModalProps = {
	isOpen: boolean
	onClose: () => void
	children: React.ReactNode
}

export default function PopupModal({ isOpen, onClose, children }: PopupModalProps) {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
			<div className="bg-white text-black rounded-2xl p-6 w-full max-w-lg relative">
				{/* przycisk zamykania */}
				<button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-black">
					✕
				</button>

				{children}
			</div>
		</div>
	)
}
