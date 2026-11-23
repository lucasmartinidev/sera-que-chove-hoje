import type { ReactElement } from 'react'

type BandGlowLayerProps = {
  bandDeep: string | null
}

export function BandGlowLayer({ bandDeep }: BandGlowLayerProps): ReactElement | null {
  if (bandDeep === null) return null
  return <div className="absolute inset-0 opacity-40" data-testid="band-glow" style={{ background: `radial-gradient(circle at 50% 30%, ${bandDeep}, transparent 65%)` }} />
}
