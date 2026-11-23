import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GeolocationState } from '@/hooks/useGeolocation'

type LocationButtonProps = {
  status: GeolocationState['status']
  disabled?: boolean
  onRequest: () => void
}

function buttonLabel(status: GeolocationState['status']): string {
  if (status === 'prompting') return 'Obtendo localização…'
  if (status === 'granted') return 'Atualizar localização'
  if (status === 'denied') return 'Tentar localização'
  return 'Minha localização'
}

export function LocationButton({ status, disabled = false, onRequest }: LocationButtonProps) {
  const isDisabled = disabled || status === 'prompting'
  return (
    <Button aria-label={buttonLabel(status)} className="h-12 w-full border-surface-muted/40 bg-surface-raised text-surface-foreground hover:bg-surface-foreground hover:text-surface sm:w-auto" disabled={isDisabled} onClick={onRequest} type="button" variant="outline">
      <MapPin aria-hidden="true" className="h-4 w-4" />
      <span>{buttonLabel(status)}</span>
    </Button>
  )
}
