import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { rioCandidate, vitoriaCandidate } from '@/test/weather-fixtures'
import { CityCandidateList } from './CityCandidateList'

describe('CityCandidateList', () => {
  it('TU-36 shows regional context and selects the matching city', () => {
    const onSelect = vi.fn()
    render(<CityCandidateList candidates={[vitoriaCandidate, rioCandidate]} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: 'Vitória, Espírito Santo · Brasil' }))
    expect(screen.getByRole('region', { name: 'Cidades encontradas' })).toBeVisible()
    expect(onSelect).toHaveBeenCalledWith(vitoriaCandidate)
  })
})
