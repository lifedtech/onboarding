const prisma = require('../lib/prisma');

const PURGE_INTERVAL = 60 * 60 * 1000; // Run every hour
const RETENTION_PERIOD = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Irrecoverably deletes all messages created more than 7 days ago.
 */
async function purgeOldMessages() {
  try {
    const cutOff = new Date(Date.now() - RETENTION_PERIOD);
    const result = await prisma.opsMessage.deleteMany({
      where: {
        createdAt: {
          lt: cutOff,
        },
      },
    });
    if (result.count > 0) {
      console.log(`[Purge] Cleaned up ${result.count} messages older than 7 days.`);
    }
  } catch (err) {
    console.error('[Purge] Failed to run message purge cycle:', err);
  }
}

/**
 * Irrecoverably deletes all session logs created more than 7 days ago.
 */
async function purgeOldSessionLogs() {
  try {
    const cutOff = new Date(Date.now() - RETENTION_PERIOD);
    const result = await prisma.sessionLog.deleteMany({
      where: {
        loginAt: {
          lt: cutOff,
        },
      },
    });
    if (result.count > 0) {
      console.log(`[Purge] Cleaned up ${result.count} session logs older than 7 days.`);
    }
  } catch (err) {
    console.error('[Purge] Failed to run session log purge cycle:', err);
  }
}

/**
 * Initializes the autonomous hourly deletion job.
 */
function startMessagePurgeJob() {
  // Execute immediately on startup
  purgeOldMessages();
  purgeOldSessionLogs();

  // Schedule to run hourly
  setInterval(() => {
    purgeOldMessages();
    purgeOldSessionLogs();
  }, PURGE_INTERVAL);
  console.log('[Purge] Message and session log automatic deletion service started (7 days rolling purge).');
}

module.exports = {
  startMessagePurgeJob,
};
