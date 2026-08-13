const MINUTE = 60 * 1000;

const toInt = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const toFloat = (value, fallback) => {
  const n = parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

/**
 * All rate-limiting thresholds for the API, centralised so they can be tuned
 * per-environment via env vars without touching code. Every value below has
 * a sane default, so nothing needs to be set for the app to run.
 *
 * See rateLimit.middleware.js for how each block is applied.
 */
module.exports = {
  // ─── Authentication routes (login; also covers signup / password-reset if ──
  // ─── those are added later — see authBackoffLimiter) ────────────────────────
  // Combines a per-IP and a per-account counter. Neither imposes a hard
  // lockout: once past `freeAttempts`, each further failure pushes the next
  // allowed attempt out by `baseDelayMs * factor ^ n`, capped at
  // `maxDelayMs`, so a legitimate user is slowed down rather than locked out.
  auth: {
    ip: {
      freeAttempts: toInt(process.env.RATE_LIMIT_AUTH_IP_FREE_ATTEMPTS, 10),
      baseDelayMs: toInt(process.env.RATE_LIMIT_AUTH_IP_BACKOFF_BASE_MS, 1 * 1000),
      factor: toFloat(process.env.RATE_LIMIT_AUTH_IP_BACKOFF_FACTOR, 2),
      maxDelayMs: toInt(process.env.RATE_LIMIT_AUTH_IP_BACKOFF_MAX_MS, 15 * MINUTE),
      // A key with no failures for this long has its counter cleared.
      windowMs: toInt(process.env.RATE_LIMIT_AUTH_IP_WINDOW_MS, 60 * MINUTE),
    },
    account: {
      freeAttempts: toInt(process.env.RATE_LIMIT_AUTH_ACCOUNT_FREE_ATTEMPTS, 5),
      baseDelayMs: toInt(process.env.RATE_LIMIT_AUTH_ACCOUNT_BACKOFF_BASE_MS, 2 * 1000),
      factor: toFloat(process.env.RATE_LIMIT_AUTH_ACCOUNT_BACKOFF_FACTOR, 2),
      maxDelayMs: toInt(process.env.RATE_LIMIT_AUTH_ACCOUNT_BACKOFF_MAX_MS, 30 * MINUTE),
      windowMs: toInt(process.env.RATE_LIMIT_AUTH_ACCOUNT_WINDOW_MS, 60 * MINUTE),
    },
    // Response status codes on the wrapped route that count as a failed
    // attempt (comma-separated). Defaults to bad-credential responses only —
    // e.g. a 400 from a malformed request body does not count against it.
    failureStatusCodes: (process.env.RATE_LIMIT_AUTH_FAILURE_CODES || '401,403')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter(Number.isFinite),
  },

  // ─── Baseline for authenticated user actions (looser) ───────────────────────
  authenticated: {
    windowMs: toInt(process.env.RATE_LIMIT_AUTHENTICATED_WINDOW_MS, 15 * MINUTE),
    max: toInt(process.env.RATE_LIMIT_AUTHENTICATED_MAX, 500),
  },

  // ─── Costly authenticated actions — messaging, uploads (stricter) ───────────
  sensitive: {
    windowMs: toInt(process.env.RATE_LIMIT_SENSITIVE_WINDOW_MS, 15 * MINUTE),
    max: toInt(process.env.RATE_LIMIT_SENSITIVE_MAX, 30),
  },

  // ─── Public endpoints — signed webhooks and any other unauthenticated route ─
  public: {
    windowMs: toInt(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS, 15 * MINUTE),
    max: toInt(process.env.RATE_LIMIT_PUBLIC_MAX, 100),
  },
};
