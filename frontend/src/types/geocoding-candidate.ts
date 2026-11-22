export type GeocodingCandidate = {
  id: number
  name: string
  admin1: string | null
  country: string | null
  countryCode: string | null
  latitude: number
  longitude: number
  timezone: string | null
  population: number | null
}
