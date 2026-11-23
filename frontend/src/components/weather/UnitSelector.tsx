import { Button } from '@/components/ui/button'
import type { TemperatureUnit, WindSpeedUnit } from '@/types/units'

type UnitSelectorProps = {
  temperatureUnit: TemperatureUnit
  windSpeedUnit: WindSpeedUnit
  onToggleTemperature: () => void
  onToggleWindSpeed: () => void
}

export function UnitSelector({ temperatureUnit, windSpeedUnit, onToggleTemperature, onToggleWindSpeed }: UnitSelectorProps) {
  return (
    <div aria-label="Unidades de medida" className="flex flex-wrap gap-4" role="group">
      <div aria-label="Unidade de temperatura" className="flex items-center gap-1" role="group">
        <Button aria-pressed={temperatureUnit === 'celsius'} className="bg-surface-raised text-surface-foreground hover:bg-surface-foreground hover:text-surface" onClick={() => { if (temperatureUnit !== 'celsius') onToggleTemperature() }} size="sm" type="button" variant={temperatureUnit === 'celsius' ? 'secondary' : 'ghost'}>°C</Button>
        <Button aria-pressed={temperatureUnit === 'fahrenheit'} className="bg-surface-raised text-surface-foreground hover:bg-surface-foreground hover:text-surface" onClick={() => { if (temperatureUnit !== 'fahrenheit') onToggleTemperature() }} size="sm" type="button" variant={temperatureUnit === 'fahrenheit' ? 'secondary' : 'ghost'}>°F</Button>
      </div>
      <div aria-label="Unidade de velocidade do vento" className="flex items-center gap-1" role="group">
        <Button aria-pressed={windSpeedUnit === 'kmh'} className="bg-surface-raised text-surface-foreground hover:bg-surface-foreground hover:text-surface" onClick={() => { if (windSpeedUnit !== 'kmh') onToggleWindSpeed() }} size="sm" type="button" variant={windSpeedUnit === 'kmh' ? 'secondary' : 'ghost'}>km/h</Button>
        <Button aria-pressed={windSpeedUnit === 'mph'} className="bg-surface-raised text-surface-foreground hover:bg-surface-foreground hover:text-surface" onClick={() => { if (windSpeedUnit !== 'mph') onToggleWindSpeed() }} size="sm" type="button" variant={windSpeedUnit === 'mph' ? 'secondary' : 'ghost'}>mph</Button>
      </div>
    </div>
  )
}
