require('dotenv').config(); // Trigger reload
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    const configuredOrigin = process.env.CLIENT_ORIGIN;
    
    // Check if origin matches configured origin, is localhost, 127.0.0.1, or is a workers.dev domain
    if (
      origin === configuredOrigin ||
      origin === 'http://localhost:5173' ||
      origin === 'http://localhost:5174' ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
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
  res.setHeader('X-Built-By', 'Ayush');
  next();
});

const path    = require('path');

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api', require('./src/routes/api.routes'));

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
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
