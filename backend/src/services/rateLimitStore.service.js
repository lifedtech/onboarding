const IORedis = require('ioredis');

/**
 * Backing store for the auth exponential-backoff limiter
 * (see middleware/rateLimit.middleware.js -> authBackoffLimiter).
 *
 * Prefers Redis so attempt counters survive process restarts and are shared
 * across multiple backend instances; falls back to an in-memory Map when
 * Redis is unreachable, the same graceful-degradation pattern already used
 * by credential.service.js.
 *
 * This opens its own IORedis connection deliberately — queue.service.js's
 * connection is dedicated to BullMQ and must not be reused for other
 * commands (see the comment there).
 */

let redisConnection = null;

function getRedis() {
  if (redisConnection) return redisConnection;

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redisConnection = new IORedis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => Math.min(times * 1000, 30000),
  });
  redisConnection.on('error', () => {}); // degrade silently; callers check `.status`
  redisConnection.connect().catch(() => {});

  return redisConnection;
}

// ─── In-memory fallback ────────────────────────────────────────────────────────
const memoryStore = new Map();

function memoryGet(key) {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return entry;
}

function memorySet(key, state, ttlMs) {
  memoryStore.set(key, { ...state, expiresAt: Date.now() + ttlMs });
}

function isRedisReady(redis) {
  return redis && redis.status === 'ready';
}

/**
 * Returns the current { count, blockedUntil } for a key, or null if unset/expired.
 */
async function getState(key) {
  const redis = getRedis();

  if (isRedisReady(redis)) {
    const data = await redis.hgetall(`ratelimit:${key}`);
    if (!data || Object.keys(data).length === 0) return null;
    return { count: parseInt(data.count, 10) || 0, blockedUntil: parseInt(data.blockedUntil, 10) || 0 };
  }

  const entry = memoryGet(key);
  return entry ? { count: entry.count, blockedUntil: entry.blockedUntil } : null;
}

/**
 * Records a failed attempt for `key` and returns the resulting state.
 * Once `count` exceeds `freeAttempts`, `blockedUntil` is pushed out by
 * `baseDelayMs * factor ^ (count - freeAttempts - 1)`, capped at `maxDelayMs`.
 * The whole entry expires after `windowMs` of inactivity.
 */
async function recordFailure(key, { freeAttempts, baseDelayMs, factor, maxDelayMs, windowMs }) {
  const redis = getRedis();
  const now = Date.now();
  const redisKey = `ratelimit:${key}`;

  let count;
  if (isRedisReady(redis)) {
    // Atomic increment so concurrent failures for the same key aren't lost.
    count = await redis.hincrby(redisKey, 'count', 1);
  } else {
    count = (memoryGet(key)?.count || 0) + 1;
  }

  let blockedUntil = 0;
  if (count > freeAttempts) {
    const delay = Math.min(baseDelayMs * Math.pow(factor, count - freeAttempts - 1), maxDelayMs);
    blockedUntil = now + delay;
  }

  if (isRedisReady(redis)) {
    await redis.hset(redisKey, 'blockedUntil', blockedUntil);
    await redis.pexpire(redisKey, windowMs);
  } else {
    memorySet(key, { count, blockedUntil }, windowMs);
  }

  return { count, blockedUntil };
}

/**
 * Clears backoff state for a key (called after a successful attempt).
 */
async function reset(key) {
  const redis = getRedis();
  if (isRedisReady(redis)) {
    await redis.del(`ratelimit:${key}`);
  } else {
    memoryStore.delete(key);
  }
}

module.exports = { getState, recordFailure, reset };
