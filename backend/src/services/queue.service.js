const { Queue } = require('bullmq');
const IORedis = require('ioredis');

// ─── Redis connection ─────────────────────────────────────────────────────────
// BullMQ requires a dedicated IORedis instance (not shared with other uses).
// maxRetriesPerRequest must be null for BullMQ compatibility.

let redisConnection = null;
let messageQueue = null;

function getRedisConnection() {
  if (redisConnection) return redisConnection;

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redisConnection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,   // required by BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: (times) => {
      // Back off exponentially, cap at 30s, stop logging after first failure
      if (times === 1) console.warn('[Redis] Not connected — retrying in background. Messaging features unavailable until Redis is running.');
      return Math.min(times * 1000, 30000);
    },
  });

  redisConnection.on('connect', () => console.log('[Redis] Connected'));
  redisConnection.on('error',   () => {}); // suppress per-retry noise; retryStrategy logs once

  return redisConnection;
}

function getMessageQueue() {
  if (messageQueue) return messageQueue;

  messageQueue = new Queue('message-queue', {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,                        // retry failed jobs up to 3 times
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { count: 100 },   // keep last 100 completed jobs
      removeOnFail:     { count: 200 },   // keep last 200 failed jobs for inspection
    },
  });

  return messageQueue;
}

/**
 * Adds a message job to the queue.
 *
 * @param {'EMAIL' | 'WHATSAPP'} type
 * @param {string} healthmateId
 * @param {object} payload  - extra data (subject, body, template, variables, etc.)
 * @returns {Promise<Job>}
 */
async function enqueueMessage(type, healthmateId, payload = {}) {
  const queue = getMessageQueue();

  const job = await queue.add(
    `${type.toLowerCase()}-${healthmateId}`,
    { type, healthmateId, payload, enqueuedAt: new Date().toISOString() },
  );

  console.log(`[Queue] Job ${job.id} enqueued — type: ${type}, healthmate: ${healthmateId}`);
  return job;
}

/**
 * Adds a registration SLA job to the queue with a 24-hour delay.
 *
 * @param {string} healthmateId
 * @returns {Promise<Job>}
 */
async function enqueueRegistrationSLA(healthmateId) {
  const queue = getMessageQueue();

  const job = await queue.add(
    `registrationSLA-${healthmateId}`,
    { type: 'REGISTRATION_SLA', healthmateId },
    { delay: 24 * 60 * 60 * 1000 } // 24 hours in milliseconds
  );

  console.log(`[Queue] Job ${job.id} enqueued — type: REGISTRATION_SLA, healthmate: ${healthmateId}`);
  return job;
}

module.exports = { enqueueMessage, enqueueRegistrationSLA, getRedisConnection, getMessageQueue };
