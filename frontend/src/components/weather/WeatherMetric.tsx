import type { LucideIcon } from 'lucide-react'

type WeatherMetricProps = {
  label: string
  value: string
  icon: LucideIcon
}

export function WeatherMetric({ label, value, icon: Icon }: WeatherMetricProps) {
  return (
    <div className="py-4">
      <dt className="text-sm text-surface-muted">{label}</dt>
      <dd className="mt-2 flex items-center gap-2 text-base font-semibold text-surface-foreground">
        <Icon aria-hidden="true" className="h-4 w-4 text-band-accent" strokeWidth={1.8} />
        <span>{value}</span>
      </dd>
    </div>
  )
}
