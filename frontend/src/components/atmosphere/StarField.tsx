import type { CSSProperties, ReactElement } from 'react'
import { STAR_SHIMMER_CYCLE_MS, type AtmosphereMotion } from './atmosphere-constants'

type StarFieldProps = {
  motion: AtmosphereMotion
}

const STAR_COUNT = 18

export function StarField({ motion }: StarFieldProps): ReactElement {
  const animation = motion.reduced ? 'none' : `atmosphere-stars ${STAR_SHIMMER_CYCLE_MS}ms ease-in-out infinite`
  const stars = Array.from({ length: STAR_COUNT }, (_, index) => <span className="atmosphere-star" data-star-index={index} key={index} style={{ animation, '--star-index': index } as CSSProperties} />)
  return <div className="absolute inset-0" data-testid="star-field">{stars}</div>
}
