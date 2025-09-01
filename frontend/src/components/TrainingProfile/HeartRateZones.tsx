type ZoneKey = 'z1' | 'z2' | 'z3' | 'z4' | 'z5'
type HrZones = Partial<Record<ZoneKey, [number, number]>>

const ORDER: ZoneKey[] = ['z1', 'z2', 'z3', 'z4', 'z5']
const META: Record<ZoneKey, { title: string; pct: string; desc: string }> = {
	z1: { title: 'Strefa 1', pct: '50–60%', desc: 'regeneracyjna' },
	z2: { title: 'Strefa 2', pct: '60–70%', desc: 'wytrzymałość tlenowa (easy run)' },
	z3: { title: 'Strefa 3', pct: '70–80%', desc: 'tempo komfortowe / próg aerobowy' },
	z4: { title: 'Strefa 4', pct: '80–90%', desc: 'próg beztlenowy' },
	z5: { title: 'Strefa 5', pct: '90–100%', desc: 'maksymalna intensywność' },
}

export default function HeartRateZones({ zones }: { zones: HrZones | null | undefined }) {
	return (
		<div className="rounded-xl bg-white/5 border border-white/10 p-4">
			<h3 className="font-semibold mb-3">Strefy tętna</h3>
			<ol className="space-y-2 list-decimal pl-6">
				{ORDER.map(k => {
					const r = zones?.[k]
					const { title, pct, desc } = META[k]
					return (
						<li key={k} className="text-sm">
							<div className="flex items-start justify-between gap-4">
								<p className="text-white/90">
									<span className="font-semibold">{title}</span> <span className="text-white/70">({pct})</span> — {desc}
								</p>
								<p className="font-semibold tabular-nums">{r ? `${r[0]}–${r[1]} bpm` : '—'}</p>
							</div>
						</li>
					)
				})}
			</ol>
		</div>
	)
}
