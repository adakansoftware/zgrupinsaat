import { env } from '@/lib/env'

type Bucket = {
  count: number
  resetAt: number
}

export interface RateLimitStore {
  get(key: string): Bucket | undefined
  set(key: string, bucket: Bucket): void
  delete(key: string): void
  entries(): IterableIterator<[string, Bucket]>
}

class MemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, Bucket>()

  get(key: string) {
    return this.buckets.get(key)
  }

  set(key: string, bucket: Bucket) {
    this.buckets.set(key, bucket)
  }

  delete(key: string) {
    this.buckets.delete(key)
  }

  entries() {
    return this.buckets.entries()
  }
}

declare global {
  var __zgrupRateLimitStore: RateLimitStore | undefined
}

export function getRateLimitStore() {
  if (!globalThis.__zgrupRateLimitStore) {
    globalThis.__zgrupRateLimitStore = new MemoryRateLimitStore()
  }

  return globalThis.__zgrupRateLimitStore
}

export function getRateLimitStoreDriver() {
  return env.RATE_LIMIT_STORE
}
