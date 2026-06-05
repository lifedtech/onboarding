const crypto = require('crypto');
const { enqueueMessage, getRedisConnection } = require('./queue.service');

/**
 * Generates temporary login credentials and schedules delivery notifications.
 * Degrades gracefully by sending directly if Redis is offline.
 * 
 * @param {object} healthmate - The healthmate record from database
 * @returns {Promise<{loginId: string, tempPassword: string}>}
 */
const provisionClientCredentials = async (healthmate) => {
  const loginId = healthmate.contactEmail;
  if (!loginId) {
    throw new Error(`Cannot provision credentials: contact email is missing for Healthmate ${healthmate.id}.`);
  }

  // Generate a random 12-character alphanumeric password
  const tempPassword = crypto.randomBytes(6).toString('hex').toUpperCase();

  console.log(`[Credential Service] Successfully generated credentials for "${healthmate.name}":`);
  console.log(`  Login ID: ${loginId}`);
  console.log(`  Temporary Password: ${tempPassword}`);

  // Draft delivery notifications
  const emailSubject = `Welcome to Lifed Healthmate Portal — Access Credentials`;
  const messageBody = `Hello ${healthmate.contactName || healthmate.name},
  
Congratulations! Your credentials have been verified by the R&D compliance team. 

Your dashboard login credentials have been provisioned:

  Portal Link:  https://portal.lifedhealth.com
  Login ID:     ${loginId}
  Password:     ${tempPassword}

Please log in to your dashboard and update your password immediately for security reasons.

Best regards,
Lifed Onboarding Team`;

  // Get Redis connection to check its status
  const redisConnection = getRedisConnection();
  const isRedisReady = redisConnection && redisConnection.status === 'ready';

  if (isRedisReady) {
    // Dispatch email asynchronously via BullMQ message queue
    await enqueueMessage('EMAIL', healthmate.id, {
      to: loginId,
      subject: emailSubject,
      body: messageBody
    });

    // Dispatch WhatsApp notification if phone is available
    if (healthmate.contactPhone) {
      const waBody = `Hello *${healthmate.contactName || healthmate.name}*, your credentials for the Lifed Portal are ready. User: ${loginId} / Pass: ${tempPassword}`;
      await enqueueMessage('WHATSAPP', healthmate.id, {
        phone: healthmate.contactPhone,
        body: waBody
      });
    }
  } else {
    console.warn(`[Credential Service] ⚠️ Redis offline (status: ${redisConnection ? redisConnection.status : 'undefined'}). Falling back to direct notification dispatch.`);
    
    // Direct sending fallbacks (handles console simulation internally)
    const { sendEmail } = require('./email.service');
    const { sendWhatsApp } = require('./whatsapp.service');

    await sendEmail(loginId, emailSubject, messageBody).catch(err => {
      console.error('[Credential Service] Direct email fallback transmission failed:', err.message);
    });

    if (healthmate.contactPhone) {
      const waBody = `Hello *${healthmate.contactName || healthmate.name}*, your credentials for the Lifed Portal are ready. User: ${loginId} / Pass: ${tempPassword}`;
      await sendWhatsApp(healthmate.contactPhone, 'CREDENTIALS', [], waBody).catch(err => {
        console.error('[Credential Service] Direct WhatsApp fallback transmission failed:', err.message);
      });
    }
  }

  return { loginId, tempPassword };
};

module.exports = {
  provisionClientCredentials,
};
