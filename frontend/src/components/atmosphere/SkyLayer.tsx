import type { CSSProperties, ReactElement } from 'react'
import type { AtmosphereMotion } from './atmosphere-constants'

type SkyLayerProps = {
  sky: { top: string; bottom: string }
  motion: AtmosphereMotion
}

function skyStyle(sky: SkyLayerProps['sky']): CSSProperties {
  return { background: `linear-gradient(to bottom, ${sky.top}, ${sky.bottom})` }
}

export function SkyLayer({ sky, motion }: SkyLayerProps): ReactElement {
  const transition = `${motion.transitionMs}ms ease-out`
  return (
    <div className="absolute inset-0" data-testid="sky-layer">
      <div className="absolute inset-0" data-sky-layer="previous" style={skyStyle(sky)} />
      <div className="absolute inset-0 opacity-0" data-sky-layer="current" style={{ ...skyStyle(sky), transition: `opacity ${transition}` }} />
    </div>
  )
}
