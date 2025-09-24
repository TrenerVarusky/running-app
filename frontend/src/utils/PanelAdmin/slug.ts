import { SLUG_MAX } from "./constants"

export function slugify(input: string): string {
	const map: Record<string, string> = {
		ą: 'a',
		ć: 'c',
		ę: 'e',
		ł: 'l',
		ń: 'n',
		ó: 'o',
		ś: 's',
		ź: 'z',
		ż: 'z',
		Ą: 'a',
		Ć: 'c',
		Ę: 'e',
		Ł: 'l',
		Ń: 'n',
		Ó: 'o',
		Ś: 's',
		Ź: 'z',
		Ż: 'z',
	}
	return input
		.split('')
		.map(ch => map[ch] ?? ch)
		.join('')
		.toLowerCase()
		.replace(/[^a-z0-9 -]/g, '')
		.trim()
		.replace(/ +/g, '-')
		.replace(/-+/g, '-')
		.slice(0, SLUG_MAX)
}