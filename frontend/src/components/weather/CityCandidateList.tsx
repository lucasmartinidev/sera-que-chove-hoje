import type { GeocodingCandidate } from '@/types/geocoding-candidate'

type CityCandidateListProps = {
  candidates: GeocodingCandidate[]
  onSelect: (candidate: GeocodingCandidate) => void
}

function locationDetails(candidate: GeocodingCandidate): string {
  return [candidate.admin1, candidate.country]
    .filter((part): part is string => part !== null && part.length > 0 && part !== candidate.name)
    .join(' · ') || candidate.countryCode || 'Localidade'
}

export function CityCandidateList({ candidates, onSelect }: CityCandidateListProps) {
  if (candidates.length === 0) return null
  return (
    <section aria-label="Cidades encontradas" aria-live="polite" className="mt-5 border-y border-border py-4">
      <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Escolha a cidade</h2>
      <ul className="divide-y divide-border">
        {candidates.map((candidate) => (
          <li key={candidate.id}>
            <button aria-label={`${candidate.name}, ${locationDetails(candidate)}`} className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => onSelect(candidate)} type="button">
              <span className="font-semibold">{candidate.name}</span>
              <span className="text-right text-sm text-muted-foreground">{locationDetails(candidate) || candidate.countryCode || 'Localidade'}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
