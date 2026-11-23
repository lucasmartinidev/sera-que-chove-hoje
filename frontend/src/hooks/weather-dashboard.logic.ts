import type { Dispatch, SetStateAction } from 'react'
import type { CitySearchState } from './useCitySearch'
import type { GeolocationState } from './useGeolocation'
import type { WeatherState } from './useWeather'
import type { GeocodingCandidate } from '@/types/geocoding-candidate'
import type { Coordinates } from '@/types/weather'

export type DashboardLocation = {
  label: string
  coordinates: Coordinates
}

export type DashboardFeedback = {
  message: string | null
  busy: boolean
  error: boolean
  retryable: boolean
}

export type DashboardDependencies = {
  citySearch: { state: CitySearchState; search: () => Promise<GeocodingCandidate[]>; reset: () => void }
  weather: { state: WeatherState; loadWeather: (coordinates: Coordinates) => Promise<void>; retry: () => Promise<void> }
  geolocation: { state: GeolocationState; requestLocation: () => Promise<Coordinates | null> }
  setLocation: Dispatch<SetStateAction<DashboardLocation | null>>
}

type FeedbackInput = {
  city: CitySearchState
  weather: WeatherState
  geolocation: GeolocationState
  location: DashboardLocation | null
}

type DashboardActions = {
  submitSearch: () => Promise<void>
  selectCandidate: (candidate: GeocodingCandidate) => void
  requestLocation: () => Promise<void>
  retry: () => void
}

export function getDashboardFeedback(input: FeedbackInput): DashboardFeedback {
  if (input.city.status === 'loading') return { message: 'Buscando cidades…', busy: true, error: false, retryable: false }
  if (input.weather.status === 'loading') return { message: 'Consultando o clima…', busy: true, error: false, retryable: false }
  if (input.geolocation.status === 'prompting') return { message: 'Obtendo sua localização…', busy: true, error: false, retryable: false }
  if (input.weather.status === 'error') return { message: input.weather.message, busy: false, error: true, retryable: true }
  if (input.city.status === 'error') return { message: input.city.message, busy: false, error: true, retryable: true }
  if (input.city.status === 'empty') return { message: 'Nenhuma cidade encontrada. Tente outro nome.', busy: false, error: false, retryable: false }
  if (input.location === null && input.city.status !== 'success' && input.geolocation.status === 'denied') return { message: 'Permissão de localização negada. Você ainda pode buscar uma cidade.', busy: false, error: false, retryable: false }
  if (input.location === null && input.city.status !== 'success' && input.geolocation.status === 'unavailable') return { message: 'Localização indisponível. Você ainda pode buscar uma cidade.', busy: false, error: false, retryable: false }
  return { message: null, busy: false, error: false, retryable: false }
}

function candidateLocation(candidate: GeocodingCandidate): DashboardLocation {
  const region = candidate.admin1 === candidate.name ? null : candidate.admin1
  const label = [candidate.name, region, candidate.country].filter((part): part is string => part !== null && part.length > 0).join(', ')
  return { label, coordinates: { latitude: candidate.latitude, longitude: candidate.longitude } }
}

function selectCandidate(input: { candidate: GeocodingCandidate; dashboard: DashboardDependencies }): void {
  const selectedLocation = candidateLocation(input.candidate)
  input.dashboard.setLocation(selectedLocation)
  input.dashboard.citySearch.reset()
  void input.dashboard.weather.loadWeather(selectedLocation.coordinates)
}

async function submitSearch(dashboard: DashboardDependencies): Promise<void> {
  dashboard.setLocation(null)
  const candidates = await dashboard.citySearch.search()
  if (candidates.length === 1) selectCandidate({ candidate: candidates[0], dashboard })
}

async function requestLocation(dashboard: DashboardDependencies): Promise<void> {
  dashboard.citySearch.reset()
  dashboard.setLocation(null)
  const coordinates = await dashboard.geolocation.requestLocation()
  if (coordinates === null) return
  dashboard.setLocation({ label: 'Minha localização', coordinates })
  void dashboard.weather.loadWeather(coordinates)
}

function retry(dashboard: DashboardDependencies): void {
  if (dashboard.weather.state.status === 'error') {
    void dashboard.weather.retry()
    return
  }
  if (dashboard.citySearch.state.status === 'error') void submitSearch(dashboard)
}

export function createDashboardActions(dashboard: DashboardDependencies): DashboardActions {
  return {
    submitSearch: () => submitSearch(dashboard),
    selectCandidate: (candidate) => selectCandidate({ candidate, dashboard }),
    requestLocation: () => requestLocation(dashboard),
    retry: () => retry(dashboard),
  }
}
