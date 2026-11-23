import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useReducedMotion } from './useReducedMotion'

type MediaQueryController = {
  mediaQuery: MediaQueryList
  setMatches: (matches: boolean) => void
}

type MediaQueryListener = (event: MediaQueryListEvent) => void

function createMediaQueryController(initialMatches: boolean): MediaQueryController {
  let currentMatches = initialMatches
  const listeners = new Set<MediaQueryListener>()
  const mediaQuery = {
    get matches(): boolean {
      return currentMatches
    },
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_type: string, listener: MediaQueryListener): void => {
      listeners.add(listener)
    },
    removeEventListener: (_type: string, listener: MediaQueryListener): void => {
      listeners.delete(listener)
    },
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  } as MediaQueryList
  const setMatches = (matches: boolean): void => {
    currentMatches = matches
    listeners.forEach((listener) => listener({ matches } as MediaQueryListEvent))
  }
  return { mediaQuery, setMatches }
}

describe('useReducedMotion', () => {
  afterEach(() => vi.restoreAllMocks())

  it('TU-55 reflects the matchMedia value and updates after a change event', () => {
    const controller = createMediaQueryController(false)
    vi.spyOn(window, 'matchMedia').mockReturnValue(controller.mediaQuery)
    const hook = renderHook(() => useReducedMotion())
    expect(hook.result.current).toBe(false)
    act(() => controller.setMatches(true))
    expect(hook.result.current).toBe(true)
    hook.unmount()
  })
})
