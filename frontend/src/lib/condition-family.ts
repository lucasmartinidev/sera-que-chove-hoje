export type ConditionFamily =
  | 'clear'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'thunderstorm'
  | 'neutral'

const CLOUDY_CODES = new Set([1, 2, 3])
const FOG_CODES = new Set([45, 48])
const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82])
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86])
const THUNDERSTORM_CODES = new Set([95, 96, 97, 99])

export function getConditionFamily(weatherCode: number | null): ConditionFamily {
  if (weatherCode === 0) return 'clear'
  if (weatherCode === null) return 'neutral'
  if (CLOUDY_CODES.has(weatherCode)) return 'cloudy'
  if (FOG_CODES.has(weatherCode)) return 'fog'
  if (RAIN_CODES.has(weatherCode)) return 'rain'
  if (SNOW_CODES.has(weatherCode)) return 'snow'
  if (THUNDERSTORM_CODES.has(weatherCode)) return 'thunderstorm'
  return 'neutral'
}
