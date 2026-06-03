const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const isTwilioConfigured = !!(accountSid && authToken && twilioPhone);
let client = null;

if (isTwilioConfigured) {
  client = twilio(accountSid, authToken);
}

/**
 * Triggers WhatsApp messages using Twilio API.
 */
async function sendWhatsApp(phone, template, variables = [], hydratedText = '') {
  // If we have hydratedText, send that, else fallback to simulation template details
  const messageBody = hydratedText || `Template: ${template} Variables: ${JSON.stringify(variables)}`;

  if (!isTwilioConfigured) {
    console.warn('[WhatsAppService] ⚠️ Twilio credentials missing. Simulating WhatsApp:');
    console.log('─'.repeat(60));
    console.log(`  To:   ${phone}`);
    console.log(`  From: whatsapp:${twilioPhone || '+14155238886'}`);
    console.log(`  Body: ${messageBody}`);
    console.log('─'.repeat(60));
    return { success: true, messageId: `mock-wa-${Date.now()}` };
  }

  try {
    const response = await client.messages.create({
      body: messageBody,
      from: `whatsapp:${twilioPhone}`,
      to: `whatsapp:${phone}`
    });

    return { success: true, messageId: response.sid };
  } catch (error) {
    console.error('[WhatsAppService] Twilio SMS failed:', error.message);
    throw error;
  }
}

module.exports = { sendWhatsApp };
