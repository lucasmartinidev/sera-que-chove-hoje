import type { FormEvent } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

type CitySearchFormProps = {
  city: string
  isLoading: boolean
  disabled?: boolean
  onCityChange: (city: string) => void
  onSubmit: () => void
}

export function CitySearchForm({ city, disabled = false, isLoading, onCityChange, onSubmit }: CitySearchFormProps) {
  const isDisabled = disabled || isLoading || city.trim().length < 2
  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!isDisabled) onSubmit()
  }

  return (
    <form aria-busy={isLoading} className="w-full" onSubmit={submit} role="search">
      <label className="mb-2 block text-sm font-semibold text-surface-foreground" htmlFor="city-search">Cidade</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-surface-muted/40 bg-surface-raised px-4 focus-within:ring-2 focus-within:ring-focus-ring">
          <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-surface-muted" />
          <input aria-describedby="city-search-help" autoComplete="off" className="h-full w-full bg-transparent text-base text-surface-foreground outline-none placeholder:text-surface-muted disabled:cursor-not-allowed disabled:opacity-60" disabled={disabled} id="city-search" maxLength={100} minLength={2} onChange={(event) => onCityChange(event.target.value)} placeholder="Ex.: São Paulo" type="search" value={city} />
        </div>
        <Button className="h-12 bg-surface-foreground px-6 text-surface hover:bg-surface-muted" disabled={isDisabled} type="submit">{isLoading ? 'Buscando…' : 'Buscar'}</Button>
      </div>
      <p className="mt-2 text-sm text-surface-muted" id="city-search-help">Digite uma cidade para consultar o tempo agora.</p>
    </form>
  )
}
