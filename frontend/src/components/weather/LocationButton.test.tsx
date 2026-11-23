import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LocationButton } from './LocationButton'

describe('LocationButton', () => {
  it('TU-37 communicates prompting and denied permission states', async () => {
    const user = userEvent.setup()
    const onRequest = vi.fn()
    const { rerender } = render(<LocationButton onRequest={onRequest} status="prompting" />)
    expect(screen.getByRole('button', { name: 'Obtendo localização…' })).toBeDisabled()
    rerender(<LocationButton onRequest={onRequest} status="denied" />)
    await user.click(screen.getByRole('button', { name: 'Tentar localização' }))
    expect(onRequest).toHaveBeenCalledOnce()
  })
})
