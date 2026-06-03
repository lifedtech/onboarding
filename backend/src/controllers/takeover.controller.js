const prisma = require('../lib/prisma');
const {
  createRequest,
  getRequestsForUser,
  getRequestsSentByUser,
  handleRequestDecision
} = require('../services/takeover.service');

/**
 * POST /api/takeover/request
 * Creates a new partner takeover request.
 */
const requestTakeover = async (req, res) => {
  const { healthmateId } = req.body;
  if (!healthmateId) {
    return res.status(400).json({ message: 'healthmateId is required.' });
  }

  try {
    const healthmate = await prisma.healthmate.findUnique({
      where: { id: healthmateId },
      include: {
        opsUser: true
      }
    });

    if (!healthmate) {
      return res.status(404).json({ message: 'Partner enquiry not found.' });
    }

    if (healthmate.opsUserId === req.user.id) {
      return res.status(400).json({ message: 'You are already assigned to this partner.' });
    }

    // Call service to register takeover request
    const request = createRequest(
      healthmateId,
      healthmate.name,
      req.user.id,
      req.user.name,
      healthmate.opsUserId
    );

    return res.status(201).json({
      success: true,
      message: `Take over request sent successfully to ${healthmate.opsUser?.name || 'coordinator'}!`,
      request
    });
  } catch (error) {
    console.error('[requestTakeover]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * GET /api/takeover/pending
 * Returns all active pending requests for the authenticated user.
 */
const getPendingTakeovers = async (req, res) => {
  try {
    const inbound = getRequestsForUser(req.user.id);
    const outbound = getRequestsSentByUser(req.user.id);

    return res.status(200).json({
      inbound,
      outbound
    });
  } catch (error) {
    console.error('[getPendingTakeovers]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/takeover/decision
 * Approves or declines a pending partner takeover request.
 */
const decideTakeover = async (req, res) => {
  const { requestId, decision } = req.body; // decision: 'ACCEPTED' or 'REJECTED'

  if (!requestId || !decision || !['ACCEPTED', 'REJECTED'].includes(decision)) {
    return res.status(400).json({ message: 'requestId and valid decision (ACCEPTED/REJECTED) are required.' });
  }

  try {
    const request = handleRequestDecision(requestId, decision);
    if (!request) {
      return res.status(404).json({ message: 'Take over request not found or already processed.' });
    }

    if (request.assigneeId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: You are not the assigned coordinator for this request.' });
    }

    if (decision === 'ACCEPTED') {
      // Transfer access inside database
      await prisma.healthmate.update({
        where: { id: request.healthmateId },
        data: { opsUserId: request.requesterId }
      });

      return res.status(200).json({
        success: true,
        message: 'Take over request approved. Access successfully transferred!',
        request
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Take over request declined.',
      request
    });
  } catch (error) {
    console.error('[decideTakeover]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  requestTakeover,
  getPendingTakeovers,
  decideTakeover
};
