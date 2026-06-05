const crypto = require('crypto');

/**
 * Webhook signature verification middleware.
 * Verifies HMAC-SHA256 signature provided in the 'X-RD-Signature' header.
 */
const verifyRdSignature = (req, res, next) => {
  const signature = req.headers['x-rd-signature'];
  const secret = process.env.RD_WEBHOOK_SECRET;

  // If secret is not configured in .env, log a warning and let the request through (e.g. during development transition)
  if (!secret) {
    console.warn('[Webhook Security] ⚠️ RD_WEBHOOK_SECRET is not configured in .env. Skipping signature check.');
    return next();
  }

  if (!signature) {
    return res.status(401).json({ message: 'Unauthorized: Missing X-RD-Signature header.' });
  }

  try {
    const rawBody = JSON.stringify(req.body);
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature, 'utf-8');
    const computedBuffer = Buffer.from(computedSignature, 'utf-8');

    // Secure timing comparison
    if (signatureBuffer.length !== computedBuffer.length) {
      return res.status(401).json({ message: 'Unauthorized: Invalid webhook signature.' });
    }

    const isMatch = crypto.timingSafeEqual(signatureBuffer, computedBuffer);
    if (!isMatch) {
      return res.status(401).json({ message: 'Unauthorized: Invalid webhook signature.' });
    }

    next();
  } catch (error) {
    console.error('[verifyRdSignature] Error during signature verification:', error);
    return res.status(500).json({ message: 'Internal server error during signature verification.' });
  }
};

module.exports = verifyRdSignature;
