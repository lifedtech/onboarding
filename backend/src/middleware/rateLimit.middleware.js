const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const config = require('../config/rateLimit.config');
const rateLimitStore = require('../services/rateLimitStore.service');

/**
 * Keys authenticated-tier limiters by ops user id rather than IP, so staff
 * sharing an office network don't share (and deplete) one bucket. Falls back
 * to IP for anything that reaches these limiters unauthenticated.
 */
const authenticatedKeyGenerator = (req) =>
  req.user?.id ? `user:${req.user.id}` : `ip:${ipKeyGenerator(req.ip)}`;

/**
 * Loose baseline limiter for authenticated user actions.
 */
const globalLimiter = rateLimit({
  windowMs: config.authenticated.windowMs,
  max: config.authenticated.max,
  keyGenerator: authenticatedKeyGenerator,
  message: {
    message: 'Too many requests. Please slow down and try again shortly.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Stricter limiter layered on top of globalLimiter for costly authenticated
 * operations (file uploads, outbound messaging).
 */
const strictLimiter = rateLimit({
  windowMs: config.sensitive.windowMs,
  max: config.sensitive.max,
  keyGenerator: authenticatedKeyGenerator,
  message: {
    message: 'Action limit exceeded. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Moderate limiter for public, unauthenticated endpoints (signed webhooks).
 */
const webhookLimiter = rateLimit({
  windowMs: config.public.windowMs,
  max: config.public.max,
  message: {
    message: 'Rate limit exceeded.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for authentication routes (login; also applies to signup /
 * password-reset if those are added later).
 *
 * Tracks failures on two independent dimensions — per-IP and per-account
 * (email) — each with its own exponential backoff (config.auth.ip /
 * config.auth.account). Neither is a hard lockout: once a dimension's
 * `freeAttempts` is exceeded, every further failure pushes the next allowed
 * attempt out by `baseDelayMs * factor ^ n`, capped at `maxDelayMs`, and a
 * successful attempt clears that dimension's count.
 *
 * The per-IP counter is intentionally left to expire on its own rather than
 * reset on a successful login on that IP — otherwise credential-stuffing
 * across many accounts from one IP would reset its own throttle the moment
 * any single guess landed.
 */
function authKey(scope, id) {
  return `auth:${scope}:${id}`;
}

async function authBackoffLimiter(req, res, next) {
  try {
    const { ip: ipConfig, account: accountConfig, failureStatusCodes } = config.auth;

    const ipKey = authKey('ip', ipKeyGenerator(req.ip));
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : null;
    const acctKey = email ? authKey('account', email) : null;

    const [ipState, acctState] = await Promise.all([
      rateLimitStore.getState(ipKey),
      acctKey ? rateLimitStore.getState(acctKey) : Promise.resolve(null),
    ]);

    const now = Date.now();
    const blocked = [ipState, acctState].find((s) => s && s.blockedUntil > now);

    if (blocked) {
      const retryAfterSec = Math.ceil((blocked.blockedUntil - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        message: `Too many attempts. Please try again in ${retryAfterSec} second${retryAfterSec === 1 ? '' : 's'}.`,
      });
    }

    res.on('finish', () => {
      const isFailure = failureStatusCodes.includes(res.statusCode);
      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;

      if (isFailure) {
        rateLimitStore.recordFailure(ipKey, ipConfig).catch((err) => console.error('[rateLimit] failed to record IP failure:', err));
        if (acctKey) {
          rateLimitStore.recordFailure(acctKey, accountConfig).catch((err) => console.error('[rateLimit] failed to record account failure:', err));
        }
      } else if (isSuccess && acctKey) {
        rateLimitStore.reset(acctKey).catch((err) => console.error('[rateLimit] failed to reset account state:', err));
      }
    });

    next();
  } catch (err) {
    // The limiter must never be the reason auth goes down.
    console.error('[rateLimit] authBackoffLimiter error:', err);
    next();
  }
}

module.exports = {
  authLimiter: authBackoffLimiter,
  globalLimiter,
  strictLimiter,
  webhookLimiter,
};
