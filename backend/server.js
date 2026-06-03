require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

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
});
