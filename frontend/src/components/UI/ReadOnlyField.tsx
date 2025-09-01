import React from 'react'

export default function ReadOnlyField({
	label,
	value,
	className = '',
}: {
	label: string
	value: React.ReactNode
	className?: string
}) {
	return (
		<div className={className}>
			<p className="text-sm text-white/70">{label}</p>
			<p className="mt-1 text-lg font-semibold">{value ?? '—'}</p>
		</div>
	)
}
