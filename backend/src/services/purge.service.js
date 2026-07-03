const prisma = require('../lib/prisma');

const PURGE_INTERVAL = 60 * 60 * 1000; // Run every hour
const RETENTION_PERIOD = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const TICKET_RETENTION_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

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
 * Irrecoverably deletes all tickets created more than 30 days ago.
 */
async function purgeOldTickets() {
  try {
    const cutOff = new Date(Date.now() - TICKET_RETENTION_PERIOD);
    const result = await prisma.ticket.deleteMany({
      where: {
        createdAt: {
          lt: cutOff,
        },
      },
    });
    if (result.count > 0) {
      console.log(`[Purge] Cleaned up ${result.count} tickets older than 30 days.`);
    }
  } catch (err) {
    console.error('[Purge] Failed to run ticket purge cycle:', err);
  }
}

/**
 * Initializes the autonomous hourly deletion job.
 */
function startMessagePurgeJob() {
  // Execute immediately on startup
  purgeOldMessages();
  purgeOldSessionLogs();
  purgeOldTickets();

  // Schedule to run hourly
  setInterval(() => {
    purgeOldMessages();
    purgeOldSessionLogs();
    purgeOldTickets();
  }, PURGE_INTERVAL);
  console.log('[Purge] Automatic deletion service started (7-day msgs/logs, 30-day tickets rolling purge).');
}

module.exports = {
  startMessagePurgeJob,
};
