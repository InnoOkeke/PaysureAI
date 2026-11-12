import { Injectable } from "@nestjs/common";

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

@Injectable()
export class AiCacheService {
  private readonly entries = new Map<string, CacheEntry>();

  get<T>(key: string): T | null {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set(key: string, value: unknown, ttlSeconds: number): void {
    if (ttlSeconds <= 0) return;
    this.entries.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  clear(): void {
    this.entries.clear();
  }
}
