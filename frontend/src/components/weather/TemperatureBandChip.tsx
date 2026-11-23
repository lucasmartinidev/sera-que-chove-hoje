import type { ReactElement } from 'react'
import type { TemperatureBand } from '@/lib/temperature-scale'

type TemperatureBandChipProps = {
  band: TemperatureBand | null
}

export function TemperatureBandChip({ band }: TemperatureBandChipProps): ReactElement | null {
  if (band === null) return null
  return <span aria-label={`Faixa de temperatura: ${band.labelPtBr}`} className="inline-flex items-center rounded-full bg-band-accent px-3 py-1 text-xs font-semibold text-band-contrast">{band.labelPtBr}</span>
}
