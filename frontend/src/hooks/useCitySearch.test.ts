import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as weatherApi from '../services/weather-api'
import { ApiError } from '../services/api'
import type { GeocodingCandidate } from '@/types/geocoding-candidate'
import { useCitySearch } from './useCitySearch'

const candidate: GeocodingCandidate = {
  id: 7, name: 'Lisboa', admin1: 'Lisboa', country: 'Portugal', countryCode: 'PT',
  latitude: 38.7, longitude: -9.1, timezone: 'Europe/Lisbon', population: 545000,
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise })
  return { promise, resolve }
}

describe('useCitySearch', () => {
  afterEach(() => vi.restoreAllMocks())

  it('TU-13 expõe loading, candidatos e estado de cidade não encontrada', async () => {
    const pending = deferred<GeocodingCandidate[]>()
    const searchCity = vi.spyOn(weatherApi, 'searchCity').mockReturnValue(pending.promise)
    const { result } = renderHook(() => useCitySearch())
    act(() => result.current.setCity('Lisboa'))
    act(() => { void result.current.search() })
    expect(result.current.state.status).toBe('loading')
    await act(async () => {
      pending.resolve([candidate])
      await pending.promise
    })
    expect(result.current.state).toMatchObject({ status: 'success', candidates: [candidate] })
    searchCity.mockResolvedValueOnce([])
    act(() => result.current.setCity('cidade inexistente'))
    await act(async () => result.current.search())
    expect(result.current.state).toEqual({ status: 'empty' })
  })

  it('TU-35 expõe mensagem segura quando a busca falha', async () => {
    vi.spyOn(weatherApi, 'searchCity').mockRejectedValue(new ApiError({ code: 'UPSTREAM_ERROR', message: 'Não foi possível obter os dados de clima agora. Tente novamente.', statusCode: 502 }))
    const { result } = renderHook(() => useCitySearch())
    act(() => result.current.setCity('Lisboa'))
    await act(async () => result.current.search())
    expect(result.current.state).toEqual({ status: 'error', message: 'Não foi possível obter os dados de clima agora. Tente novamente.' })
  })
})
