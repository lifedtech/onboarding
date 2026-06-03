const sgMail = require('@sendgrid/mail');

// Initialize SendGrid if key is present
const hasApiKey = !!process.env.SENDGRID_API_KEY;
if (hasApiKey) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Sends an email using SendGrid. Falls back to console simulation if the API key is missing.
 */
async function sendEmail(to, subject, body) {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'support@lifedhealth.com';

  if (!hasApiKey) {
    console.warn('[EmailService] ⚠️ SendGrid API key missing. Simulating sending email:');
    console.log('─'.repeat(60));
    console.log(`  To:      ${to}`);
    console.log(`  From:    ${fromEmail}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:\n${body}`);
    console.log('─'.repeat(60));
    return { success: true, messageId: `mock-email-${Date.now()}` };
  }

  try {
    const msg = {
      to,
      from: fromEmail,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>')
    };

    const response = await sgMail.send(msg);
    const messageId = response[0]?.headers?.['x-message-id'] || `sg-${Date.now()}`;
    return { success: true, messageId };
  } catch (error) {
    console.error('[EmailService] SendGrid transmission failed:', error.message);
    throw error;
  }
}

module.exports = { sendEmail };
