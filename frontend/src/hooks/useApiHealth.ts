import { useEffect, useState } from 'react'
import { fetchHealth } from '../services/health-api'

export type ApiStatus = 'checking' | 'online' | 'offline'

const HEALTH_CHECK_INTERVAL_MS = 5000

export function useApiHealth(): ApiStatus {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')
  useEffect(() => {
    let isActive = true
    const checkApiStatus = async (): Promise<void> => {
      try {
        const health = await fetchHealth()
        if (isActive) setApiStatus(health.status === 'healthy' ? 'online' : 'offline')
      } catch {
        if (isActive) setApiStatus('offline')
      }
    }
    void checkApiStatus()
    const interval = window.setInterval(() => void checkApiStatus(), HEALTH_CHECK_INTERVAL_MS)
    return () => {
      isActive = false
      window.clearInterval(interval)
    }
  }, [])
  return apiStatus
}
