import type { ReactElement } from 'react'
import { THUNDER_FLASH_CYCLE_MS, type AtmosphereMotion } from './atmosphere-constants'

type ThunderLayerProps = {
  motion: AtmosphereMotion
}

export function ThunderLayer({ motion }: ThunderLayerProps): ReactElement {
  const animation = motion.reduced ? 'none' : `atmosphere-thunder ${THUNDER_FLASH_CYCLE_MS}ms ease-in-out infinite`
  return <div className="absolute inset-0" data-testid="thunder-layer" style={{ animation }} />
}
