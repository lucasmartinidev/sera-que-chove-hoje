import { useState } from 'react'
import type { Coordinates } from '@/types/weather'

export type GeolocationState =
  | { status: 'idle' }
  | { status: 'prompting' }
  | { status: 'granted'; coordinates: Coordinates }
  | { status: 'denied' }
  | { status: 'unavailable' }

const PERMISSION_DENIED_CODE = 1
const GEOLOCATION_TIMEOUT_MS = 10000
const MAXIMUM_LOCATION_AGE_MS = 60000
const GEOLOCATION_OPTIONS = { enableHighAccuracy: false, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: MAXIMUM_LOCATION_AGE_MS }

function readCurrentCoordinates(): Promise<Coordinates> {
  if (navigator.geolocation === undefined) return Promise.reject(new Error('Geolocalização indisponível'))
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) => reject(error),
      GEOLOCATION_OPTIONS,
    )
  })
}

function isPermissionDenied(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === PERMISSION_DENIED_CODE
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' })

  async function requestLocation(): Promise<Coordinates | null> {
    setState({ status: 'prompting' })
    try {
      const coordinates = await readCurrentCoordinates()
      setState({ status: 'granted', coordinates })
      return coordinates
    } catch (error: unknown) {
      setState(isPermissionDenied(error) ? { status: 'denied' } : { status: 'unavailable' })
      return null
    }
  }

  return { state, requestLocation }
}
