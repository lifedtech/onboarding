const { Worker } = require('bullmq');
const prisma = require('../lib/prisma');
const { getRedisConnection } = require('../services/queue.service');
const { sendEmail } = require('../services/email.service');
const { sendWhatsApp } = require('../services/whatsapp.service');
const { TEMPLATES, hydrateTemplate, getTemplateKey } = require('../utils/template.engine');

// ─── Job processor ────────────────────────────────────────────────────────────

async function processMessage(job) {
  const { type, healthmateId, payload } = job.data;

  console.log(`[Worker] Processing job ${job.id} — type: ${type}, attempt: ${job.attemptsMade + 1}`);

  // Fetch the latest healthmate data along with the owning opsUser
  const healthmate = await prisma.healthmate.findUnique({
    where: { id: healthmateId },
    include: { opsUser: true }
  });

  if (!healthmate) {
    // Don't retry — the record is gone
    throw new Error(`Healthmate ${healthmateId} not found. Discarding job.`);
  }

  const opsUser = healthmate.opsUser;

  // Determine template based on Phase & Partner Type
  const templateKey = getTemplateKey(healthmate.phase, healthmate.type);

  switch (type) {
    case 'EMAIL': {
      const to = payload.to || healthmate.contactEmail;

      if (!to) {
        throw new Error(`No email address for healthmate ${healthmateId}. Discarding job.`);
      }

      // Fetch raw email template, defaulting to general format if not set
      const rawTemplate = TEMPLATES.EMAIL[templateKey] || TEMPLATES.EMAIL.DAY_3_FOLLOWUP;
      
      // Hydrate subject and body
      const subject = payload.subject || hydrateTemplate(rawTemplate.subject, healthmate, opsUser);
      const body = payload.body || hydrateTemplate(rawTemplate.body, healthmate, opsUser);

      const result = await sendEmail(to, subject, body);
      console.log(`[Worker] ✓ Email job ${job.id} complete — messageId: ${result.messageId}`);
      return result;
    }

    case 'WHATSAPP': {
      const phone = payload.phone || healthmate.contactPhone;

      if (!phone) {
        throw new Error(`No phone number for healthmate ${healthmateId}. Discarding job.`);
      }

      // Fetch raw text and hydrate
      const rawText = TEMPLATES.WHATSAPP[templateKey] || TEMPLATES.WHATSAPP.DAY_3_FOLLOWUP;
      const hydratedText = payload.body || hydrateTemplate(rawText, healthmate, opsUser);

      const result = await sendWhatsApp(phone, templateKey, payload.variables || [], hydratedText);
      console.log(`[Worker] ✓ WhatsApp job ${job.id} complete — messageId: ${result.messageId}`);
      return result;
    }

    default:
      throw new Error(`Unknown message type "${type}". Discarding job.`);
  }
}

// ─── Worker initialisation ────────────────────────────────────────────────────

let worker = null;

function initMessageWorker() {
  if (worker) return worker;

  worker = new Worker('message-queue', processMessage, {
    connection: getRedisConnection(),
    concurrency: 5,   // process up to 5 jobs simultaneously
  });

  worker.on('completed', (job, result) => {
    console.log(`[Worker] Job ${job.id} completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed (attempt ${job?.attemptsMade}): ${err.message}`);
  });

  worker.on('error', (err) => {
    const msg = err?.message || '';
    if (!msg) return; // Ignore empty errors
    
    const isConnectionError = 
      msg.includes('ECONNREFUSED') || 
      msg.includes('Connection is closed') || 
      msg.includes('Redis') || 
      msg.includes('connect') ||
      msg.includes('ENOTFOUND');
      
    if (!isConnectionError) {
      console.error('[Worker] Worker error:', msg);
    }
  });

  console.log('[Worker] Message worker initialised and listening.');
  return worker;
}

module.exports = { initMessageWorker };
