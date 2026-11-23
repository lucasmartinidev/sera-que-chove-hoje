import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { TemperatureUnit, WindSpeedUnit } from '@/types/units'
import { UnitSelector } from './UnitSelector'

function UnitSelectorHarness() {
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>('celsius')
  const [windSpeedUnit, setWindSpeedUnit] = useState<WindSpeedUnit>('kmh')
  return (
    <UnitSelector
      onToggleTemperature={() => setTemperatureUnit((unit) => unit === 'celsius' ? 'fahrenheit' : 'celsius')}
      onToggleWindSpeed={() => setWindSpeedUnit((unit) => unit === 'kmh' ? 'mph' : 'kmh')}
      temperatureUnit={temperatureUnit}
      windSpeedUnit={windSpeedUnit}
    />
  )
}

describe('UnitSelector', () => {
  it('TU-20 changes temperature and wind units independently', async () => {
    const user = userEvent.setup()
    render(<UnitSelectorHarness />)
    await user.click(screen.getByRole('button', { name: '°F' }))
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'km/h' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'mph' }))
    expect(screen.getByRole('button', { name: 'mph' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '°F' })).toHaveAttribute('aria-pressed', 'true')
  })
})
