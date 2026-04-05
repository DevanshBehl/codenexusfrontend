interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

class InMemoryCache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private readonly defaultTTL = 10000;

    set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttl,
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key) as CacheEntry<T> | undefined;
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    invalidate(key: string): void {
        this.delete(key);
    }

    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern.replace("*", ".*"));
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }
}

export const unreadCountCache = new InMemoryCache();

const UNREAD_CACHE_KEY = (cnid: string) => `unread:${cnid}`;
const UNREAD_CACHE_TTL = 10000;

export function getUnreadCountCacheKey(cnid: string): string {
    return UNREAD_CACHE_KEY(cnid);
}

export function getCachedUnreadCount(cnid: string): number | null {
    return unreadCountCache.get<number>(UNREAD_CACHE_KEY(cnid));
}

export function setCachedUnreadCount(cnid: string, count: number): void {
    unreadCountCache.set(UNREAD_CACHE_KEY(cnid), count, UNREAD_CACHE_TTL);
}

export function invalidateUnreadCountCache(cnid: string): void {
    unreadCountCache.invalidate(UNREAD_CACHE_KEY(cnid));
}
