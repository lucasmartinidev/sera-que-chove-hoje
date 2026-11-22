import { apiRequest } from './api'
import { isGeocodeResponse, isWeatherData } from './weather-api.validation'
import type { GeocodingCandidate } from '@/types/geocoding-candidate'
import type { WeatherData } from '@/types/weather'

type GeocodeResponse = {
  candidates: GeocodingCandidate[]
}

export async function searchCity(city: string): Promise<GeocodingCandidate[]> {
  const query = new URLSearchParams({ city })
  const response = await apiRequest<GeocodeResponse>(`/api/geocode?${query}`, isGeocodeResponse)
  return response.candidates
}

export function fetchWeather(latitude: number, longitude: number): Promise<WeatherData> {
  const query = new URLSearchParams({ lat: String(latitude), lon: String(longitude) })
  return apiRequest(`/api/weather?${query}`, isWeatherData)
}
