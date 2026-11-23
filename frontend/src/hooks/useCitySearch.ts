import { useRef, useState } from 'react'
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
  const requestId = useRef(0)

  async function search(): Promise<GeocodingCandidate[]> {
    const currentRequestId = requestId.current + 1
    requestId.current = currentRequestId
    setState({ status: 'loading' })
    try {
      const candidates = await searchCity(city)
      if (currentRequestId !== requestId.current) return []
      if (candidates.length === 0) {
        setState({ status: 'empty' })
        return []
      }
      setState({ status: 'success', candidates })
      return candidates
    } catch (error: unknown) {
      if (currentRequestId !== requestId.current) return []
      setState({ status: 'error', message: getSearchErrorMessage(error) })
      return []
    }
  }

  function reset(): void {
    requestId.current += 1
    setState({ status: 'idle' })
  }

  return { city, setCity, state, search, reset }
}
