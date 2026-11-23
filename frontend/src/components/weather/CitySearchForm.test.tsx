import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CitySearchForm } from './CitySearchForm'

function SearchHarness({ onSubmit }: { onSubmit: () => void }) {
  const [city, setCity] = useState('')
  return <CitySearchForm city={city} isLoading={false} onCityChange={setCity} onSubmit={onSubmit} />
}

describe('CitySearchForm', () => {
  it('TU-17 submits by Enter and by the search button', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<SearchHarness onSubmit={onSubmit} />)
    const input = screen.getByRole('searchbox', { name: 'Cidade' })
    expect(input).toHaveAccessibleDescription('Digite uma cidade para consultar o tempo agora.')
    await user.type(input, 'São Paulo')
    await user.keyboard('{Enter}')
    await user.clear(input)
    await user.type(input, 'Lisboa')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(onSubmit).toHaveBeenCalledTimes(2)
  })
})
