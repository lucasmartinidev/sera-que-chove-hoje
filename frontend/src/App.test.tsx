import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { useApiHealth } from './hooks/useApiHealth'

vi.mock('./hooks/useApiHealth', () => ({ useApiHealth: vi.fn() }))

describe('App API status', () => {
  afterEach(() => vi.restoreAllMocks())

  it('TU-33 announces API status through an accessible status role', () => {
    vi.mocked(useApiHealth).mockReturnValue('online')
    render(<App />)
    expect(screen.getByRole('status')).toHaveAccessibleName('API Status: online')
    expect(screen.getByText('API online')).toBeVisible()
  })
})
