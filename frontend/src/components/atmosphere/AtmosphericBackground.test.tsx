import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AtmosphericBackground } from './AtmosphericBackground'

const sky = { top: '#0EA5E9', bottom: '#BAE6FD' }
const motion = { reduced: false, transitionMs: 600 }

describe('AtmosphericBackground', () => {
  it('TU-56 renders a decorative, non-interactive background with condition layers', () => {
    render(<AtmosphericBackground family="rain" period="day" sky={sky} bandDeep="#0E7490" motion={motion} />)
    const background = screen.getByTestId('atmospheric-background')
    expect(background).toHaveAttribute('aria-hidden', 'true')
    expect(background).toHaveClass('pointer-events-none')
    expect(screen.getByTestId('sky-layer')).toBeInTheDocument()
    expect(screen.getByTestId('particle-layer')).toBeInTheDocument()
    expect(screen.queryByTestId('thunder-layer')).not.toBeInTheDocument()
  })

  it('TU-56 renders thunder and stars only for their matching conditions', () => {
    const { rerender } = render(<AtmosphericBackground family="thunderstorm" period="day" sky={sky} bandDeep="#86198F" motion={motion} />)
    expect(screen.getByTestId('thunder-layer')).toBeInTheDocument()
    rerender(<AtmosphericBackground family="clear" period="night" sky={sky} bandDeep={null} motion={motion} />)
    expect(screen.getByTestId('star-field')).toBeInTheDocument()
    expect(screen.queryByTestId('band-glow')).not.toBeInTheDocument()
  })

  it('TU-57 disables layer animations and transitions when motion is reduced', () => {
    render(<AtmosphericBackground family="snow" period="night" sky={sky} bandDeep="#1E40AF" motion={{ reduced: true, transitionMs: 0 }} />)
    expect(screen.getByTestId('particle-layer').firstElementChild).toHaveStyle({ animation: 'none' })
    expect(screen.getByTestId('sky-layer').querySelector('[data-sky-layer="current"]')?.getAttribute('style')).toContain('0ms')
  })

  it('TU-58 uses the safe eight-second thunder flash cycle', () => {
    render(<AtmosphericBackground family="thunderstorm" period="night" sky={sky} bandDeep="#86198F" motion={motion} />)
    expect(screen.getByTestId('thunder-layer').getAttribute('style')).toContain('8000ms')
  })
})
