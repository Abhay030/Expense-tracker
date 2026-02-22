/**
 * Simple in-memory TTL cache for expensive API responses.
 * Perfect for < 5000 users. Per-user keyed, auto-expires.
 * 
 * For production at scale (>10k users), replace with Redis.
 */

class MemoryCache {
    constructor() {
        this.cache = new Map();
        // Cleanup expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    /**
     * Get cached value for a key
     * @returns {any|null} Cached value or null if expired/missing
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }

    /**
     * Set a cached value
     * @param {string} key - Cache key
     * @param {any} value - Value to cache
     * @param {number} ttlMs - Time to live in milliseconds
     */
    set(key, value, ttlMs = 60000) {
        this.cache.set(key, {
            value,
            expiresAt: Date.now() + ttlMs,
        });
    }

    /**
     * Invalidate all cache entries for a specific user
     */
    invalidateUser(userId) {
        const userIdStr = userId.toString();
        const prefix = `user:${userIdStr}:`;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Generate a per-user cache key
     */
    key(userId, endpoint) {
        const userIdStr = userId.toString();
        return `user:${userIdStr}:${endpoint}`;
    }

    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Express middleware factory: caches response for the given TTL
     * Usage: router.get('/endpoint', protect, cache.middleware(60000), handler)
     */
    middleware(ttlMs = 60000) {
        return (req, res, next) => {
            const userId = req.user?._id || req.user?.id;
            if (!userId) return next();

            const cacheKey = this.key(userId, req.originalUrl);
            const cached = this.get(cacheKey);

            if (cached) {
                return res.json(cached);
            }

            // Intercept res.json to cache the response
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                this.set(cacheKey, body, ttlMs);
                return originalJson(body);
            };
            next();
        };
    }
}

// Singleton instance
const cache = new MemoryCache();

module.exports = cache;
