import type { CSSProperties, ReactElement } from 'react'
import { PARTICLE_DENSITY, RAIN_FALL_CYCLE_MS, SNOW_FALL_CYCLE_MS, type AtmosphereMotion } from './atmosphere-constants'

type ParticleLayerProps = {
  family: 'rain' | 'snow'
  motion: AtmosphereMotion
}

function particleCount(family: ParticleLayerProps['family']): number {
  return PARTICLE_DENSITY.desktop[family]
}

export function ParticleLayer({ family, motion }: ParticleLayerProps): ReactElement {
  const duration = family === 'rain' ? RAIN_FALL_CYCLE_MS : SNOW_FALL_CYCLE_MS
  const animation = motion.reduced ? 'none' : `atmosphere-${family} ${duration}ms linear infinite`
  const particles = Array.from({ length: particleCount(family) }, (_, index) => <span className="atmosphere-particle" data-particle-index={index} key={index} style={{ animation, '--particle-index': index } as CSSProperties} />)
  return <div className="absolute inset-0" data-particle-family={family} data-testid="particle-layer">{particles}</div>
}
