import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryCache } from './cache';

describe('MemoryCache', () => {
  afterEach(() => vi.useRealTimers());

  it('TU-08 retorna o valor em cache até o TTL e causa miss após expirar', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-22T12:00:00.000Z'));
    const cache = new MemoryCache(1000);
    cache.set('weather:-23.55,-46.64', { temperature: 22 });
    expect(cache.get<{ temperature: number }>('weather:-23.55,-46.64')).toEqual({ temperature: 22 });
    vi.advanceTimersByTime(1000);
    expect(cache.get('weather:-23.55,-46.64')).toBeUndefined();
  });
});
