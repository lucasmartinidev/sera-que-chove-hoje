import { config } from '../config';

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

export class MemoryCache {
  private readonly entries = new Map<string, CacheEntry>();

  constructor(private readonly ttlMs: number = config.cacheTtlMs) {}

  get<T>(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (entry === undefined) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T): void {
    this.removeExpiredEntries();
    this.entries.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  private removeExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt <= now) this.entries.delete(key);
    }
  }
}

export const memoryCache = new MemoryCache();
