import React from 'react'

type FieldProps = {
	name: string
	label: string
	type?: 'text' | 'number' | 'date' | 'email' | 'password'
	value: string | number
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	required?: boolean
	error?: string
	className?: string
}

export default function Field({
	name,
	label,
	type = 'text',
	value,
	onChange,
	required,
	error,
	className = '',
}: FieldProps) {
	return (
		<div className={className}>
			<label htmlFor={name} className="block mb-1">
				{label}
			</label>
			<input
				id={name}
				name={name}
				type={type}
				value={value}
				onChange={onChange}
				required={required}
				className={`w-full p-2 rounded bg-gray-700 text-white ${error ? 'ring-2 ring-red-500' : ''}`}
			/>
			{error && <p className="text-red-400 text-sm mt-1">{error}</p>}
		</div>
	)
}
