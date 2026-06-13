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
 * Initializes the autonomous hourly deletion job.
 */
function startMessagePurgeJob() {
  // Execute immediately on startup
  purgeOldMessages();

  // Schedule to run hourly
  setInterval(purgeOldMessages, PURGE_INTERVAL);
  console.log('[Purge] Message automatic deletion service started (7 days rolling purge).');
}

module.exports = {
  startMessagePurgeJob,
};
