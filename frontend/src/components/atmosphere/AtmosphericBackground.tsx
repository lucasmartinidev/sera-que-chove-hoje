import type { ReactElement } from 'react'
import type { ConditionFamily } from '../../lib/condition-family'
import { BandGlowLayer } from './BandGlowLayer'
import { ParticleLayer } from './ParticleLayer'
import { SkyLayer } from './SkyLayer'
import { StarField } from './StarField'
import { ThunderLayer } from './ThunderLayer'
import type { AtmosphereMotion } from './atmosphere-constants'

type AtmosphericBackgroundProps = {
  family: ConditionFamily
  period: 'day' | 'night'
  sky: { top: string; bottom: string }
  bandDeep: string | null
  motion: AtmosphereMotion
}

export function AtmosphericBackground({ family, period, sky, bandDeep, motion }: AtmosphericBackgroundProps): ReactElement {
  const hasParticles = family === 'rain' || family === 'snow'
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" data-atmosphere={family} data-period={period} data-testid="atmospheric-background">
      <SkyLayer sky={sky} motion={motion} />
      <BandGlowLayer bandDeep={bandDeep} />
      {hasParticles && <ParticleLayer family={family} motion={motion} />}
      {family === 'thunderstorm' && <ThunderLayer motion={motion} />}
      {family === 'clear' && period === 'night' && <StarField motion={motion} />}
    </div>
  )
}
