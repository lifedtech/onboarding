require('dotenv').config(); // Trigger reload
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// ─── Trust Proxy ──────────────────────────────────────────────────────────────
// Per-IP rate limiting (see middleware/rateLimit.middleware.js) relies on
// req.ip. If this API sits behind a reverse proxy / load balancer, Express
// must be told to trust its X-Forwarded-For header, or every request will
// appear to come from the proxy's IP and share a single rate-limit bucket.
// Left unset, Express's default (no proxy trusted) applies — safe for a
// directly-exposed deployment, but set this to the number of trusted hops
// (e.g. "1") or a specific proxy IP/CIDR when running behind one.
if (process.env.TRUST_PROXY) {
  const trustProxy = process.env.TRUST_PROXY;
  app.set('trust proxy', trustProxy === 'true' ? true : trustProxy);
}

// ─── Crash Resilience ─────────────────────────────────────────────────────────
// A single unhandled rejection/exception anywhere (background worker, SSE broadcast,
// presence tracking) would otherwise terminate the whole Node process by default,
// taking the entire API down with it. Log and keep serving instead.
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    const configuredOrigin = process.env.CLIENT_ORIGIN;

    // Check if origin matches configured origin, is localhost, 127.0.0.1, local network IP, or is a workers.dev domain
    if (
      origin === configuredOrigin ||
      origin === 'http://localhost:5173' ||
      origin === 'http://localhost:5174' ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.') ||
      (origin.startsWith('http://172.') && origin.match(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./)) ||
      origin.endsWith('.workers.dev')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Easter egg header
app.use((req, res, next) => {
  res.setHeader('X-Built-By', 'axshh');
  res.setHeader('X-Location', 'Kochi-Kerala-India');
  res.setHeader('X-Company', 'Holobiont Pvt-Ltd');
  res.setHeader('X-Version', 'v1.0');
  next();
});

const path = require('path');
const { authenticate } = require('./src/middleware/auth.middleware');

app.use(express.json());
// Uploaded files (registration documents, avatars) are internal business
// records, not public assets — require a valid session to fetch any of
// them. <img>/<a> tags can't send an Authorization header, so authenticate
// falls back to a ?token= query param for this path specifically (see
// middleware/auth.middleware.js).
app.use('/uploads', authenticate, express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api', require('./src/routes/api.routes'));

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catch-all safety net for anything a route/controller didn't handle itself
// (every controller already catches its own errors and responds with a
// generic message — see e.g. controllers/*.js). Full detail always goes to
// the server log; the client only ever sees a generic message for 5xx, since
// error.message can carry a raw DB error, a file path, or other internals.
// A deliberately-thrown 4xx (err.status < 500) is assumed to carry a
// message written for the client, so that one is passed through.

app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(`[${req.method} ${req.originalUrl}]`, err.stack || err);
  res.status(status).json({
    message: status < 500 && err.message ? err.message : 'Internal server error.',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // Initialise the message worker after the server is up.
  // Wrapped in a try/catch so a missing Redis connection doesn't crash the server —
  // the API stays fully functional; only the messaging queue is unavailable.
  try {
    const { initMessageWorker } = require('./src/workers/message.worker');
    initMessageWorker();
  } catch (err) {
    console.warn('[Worker] Could not initialise message worker:', err.message);
    console.warn('[Worker] Messaging features will be unavailable until Redis is running.');
  }

  // Initialise message purge service (E2EE 7-day retention)
  try {
    const { startMessagePurgeJob } = require('./src/services/purge.service');
    startMessagePurgeJob();
  } catch (err) {
    console.error('[Purge] Failed to initialize message purge service:', err.message);
  }
});
