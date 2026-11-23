import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getTemperatureBand } from '@/lib/temperature-scale'
import { TemperatureBandChip } from './TemperatureBandChip'

describe('TemperatureBandChip', () => {
  it('TU-59 displays the textual temperature band label', () => {
    render(<TemperatureBandChip band={getTemperatureBand(28)} />)
    expect(screen.getByText('Quente')).toBeVisible()
    expect(screen.getByLabelText('Faixa de temperatura: Quente')).toBeVisible()
  })

  it('TU-60 does not render a colored chip when temperature is unavailable', () => {
    render(<TemperatureBandChip band={null} />)
    expect(screen.queryByLabelText(/Faixa de temperatura/)).not.toBeInTheDocument()
  })
})
