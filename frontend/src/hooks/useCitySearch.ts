import { useState } from 'react'
import { ApiError } from '../services/api'
import { searchCity } from '../services/weather-api'
import type { GeocodingCandidate } from '@/types/geocoding-candidate'

export type CitySearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; candidates: GeocodingCandidate[] }
  | { status: 'empty' }
  | { status: 'error'; message: string }

function getSearchErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Não foi possível buscar cidades. Tente novamente.'
}

export function useCitySearch() {
  const [city, setCity] = useState('')
  const [state, setState] = useState<CitySearchState>({ status: 'idle' })

  async function search(): Promise<void> {
    setState({ status: 'loading' })
    try {
      const candidates = await searchCity(city)
      setState(candidates.length === 0 ? { status: 'empty' } : { status: 'success', candidates })
    } catch (error: unknown) {
      setState({ status: 'error', message: getSearchErrorMessage(error) })
    }
  }

  return { city, setCity, state, search }
}
