const prisma = require('../lib/prisma');
const { enqueueMessage } = require('../services/queue.service');

const VALID_TYPES = ['EMAIL', 'WHATSAPP'];

/**
 * POST /api/healthmates/:id/messages
 *
 * Enqueues a message job for a healthmate.
 * Returns 202 Accepted immediately — the actual send happens in the background worker.
 *
 * Body:
 *   type     {string}  'EMAIL' | 'WHATSAPP'
 *   payload  {object}  Optional overrides (to, subject, body, phone, template, variables)
 */
const triggerMessage = async (req, res) => {
  const { id } = req.params;
  const { type, payload = {} } = req.body;

  if (!type || !VALID_TYPES.includes(type.toUpperCase())) {
    return res.status(400).json({
      message: `type must be one of: ${VALID_TYPES.join(', ')}.`,
    });
  }

  try {
    // Verify the healthmate exists
    const healthmate = await prisma.healthmate.findUnique({
      where: { id },
    });

    if (!healthmate) {
      return res.status(404).json({ message: 'Healthmate not found.' });
    }

    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    if (!isAdmin && healthmate.opsUserId !== req.user.id) {
      return res.status(403).json({
        message: 'Access Denied: Only the assigned Operations coordinator or an Administrator can send messages to this partner.'
      });
    }

    // Quick pre-flight check — warn if contact info is missing
    const normalizedType = type.toUpperCase();
    if (normalizedType === 'EMAIL' && !healthmate.contactEmail && !payload.to) {
      return res.status(422).json({
        message: 'No email address on file for this partner. Add a contact email first.',
      });
    }
    if (normalizedType === 'WHATSAPP' && !healthmate.contactPhone && !payload.phone) {
      return res.status(422).json({
        message: 'No phone number on file for this partner. Add a contact phone first.',
      });
    }

    const job = await enqueueMessage(normalizedType, id, payload);

    // 202 Accepted — job is queued, not yet processed
    return res.status(202).json({
      message: 'Message queued successfully.',
      jobId: job.id,
      type: normalizedType,
      healthmateId: id,
    });
  } catch (error) {
    console.error('[triggerMessage]', error);

    // If Redis is down, return a clear error rather than a generic 500
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('Redis')) {
      return res.status(503).json({
        message: 'Message queue is unavailable. Please ensure Redis is running.',
      });
    }

    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { triggerMessage };
