export type TemperatureBandId =
  | 'extreme-cold'
  | 'very-cold'
  | 'cold'
  | 'cool'
  | 'mild'
  | 'warm'
  | 'very-warm'
  | 'extreme-heat'

export type TemperatureBand = {
  id: TemperatureBandId
  labelPtBr: string
}

type TemperatureBandDefinition = TemperatureBand & {
  upperLimitC: number | null
}

const EXTREME_COLD_LIMIT_C = -10
const VERY_COLD_LIMIT_C = 0
const COLD_LIMIT_C = 10
const COOL_LIMIT_C = 18
const MILD_LIMIT_C = 24
const WARM_LIMIT_C = 30
const VERY_WARM_LIMIT_C = 38

const TEMPERATURE_BANDS: TemperatureBandDefinition[] = [
  { id: 'extreme-cold', labelPtBr: 'Frio extremo', upperLimitC: EXTREME_COLD_LIMIT_C },
  { id: 'very-cold', labelPtBr: 'Muito frio', upperLimitC: VERY_COLD_LIMIT_C },
  { id: 'cold', labelPtBr: 'Frio', upperLimitC: COLD_LIMIT_C },
  { id: 'cool', labelPtBr: 'Fresco', upperLimitC: COOL_LIMIT_C },
  { id: 'mild', labelPtBr: 'Ameno', upperLimitC: MILD_LIMIT_C },
  { id: 'warm', labelPtBr: 'Quente', upperLimitC: WARM_LIMIT_C },
  { id: 'very-warm', labelPtBr: 'Muito quente', upperLimitC: VERY_WARM_LIMIT_C },
  { id: 'extreme-heat', labelPtBr: 'Calor extremo', upperLimitC: null },
]

export function getTemperatureBand(temperatureC: number | null): TemperatureBand | null {
  if (temperatureC === null) return null
  const band = TEMPERATURE_BANDS.find(({ upperLimitC }) => upperLimitC === null || temperatureC <= upperLimitC)
  return band ? { id: band.id, labelPtBr: band.labelPtBr } : TEMPERATURE_BANDS[0]
}
