import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { StatusMessage } from './StatusMessage'

describe('StatusMessage', () => {
  it('TU-38 announces busy and error states and exposes retry', async () => {
    const user = userEvent.setup()
    const retry = vi.fn()
    const { rerender } = render(<StatusMessage busy error={false} message="Consultando o clima…" />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true')
    rerender(<StatusMessage busy={false} error message="Serviço indisponível." onRetry={retry} />)
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Serviço indisponível.')
    expect(retry).toHaveBeenCalledOnce()
  })
})
