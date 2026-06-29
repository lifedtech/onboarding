const prisma = require('../lib/prisma');
const { provisionClientCredentials } = require('../services/credential.service');

// ─── Default Tasks Seeding Helper (Independent Copy/Adaptation) ──────────────
const defaultTasks = {
  PRE_QUALIFY: [
    "Schedule a call to explain Lifed",
    "Score the healthmate",
    "Schedule the follow ups",
    "Identify the program that Lifed can co-create"
  ],
  REGISTER: [
    "Do a call on the registration process",
    "Validate the credentials",
    "Validate bank account",
    "Approve the healthmate account",
    "Send a video explaining the program builder and the program management dashboard"
  ],
  PREPARE: [
    "Schedule a call to explain the Healthmate dashboard and program builder",
    "Collect the details about the program",
    "Categorize them into a) ready to be live, b) have to co - create and curate",
    "If ready to be live, have a follow-up and make them submit the program",
    "If co-create, then R/D curate and take suggestions from healthmate, then submit for review"
  ],
  REVIEW: [
    "Review the program with complete validation",
    "If rectification needed, schedule a call and sit with them and complete the process",
    "If program is ready to be Live, Send a SOP for program conduction."
  ],
  LIVE: [
    "Once the program is live, schedule follow up to make them share in their accounts",
    "Send a welcome kit (digital, first 100 send a physical one)",
    "Review the program in 10 days",
    "If no booking in 10 days, trigger the sales and marketing team."
  ]
};

const seedAllDefaultTasks = async (healthmateId, initialPhase) => {
  const phaseOrder = ['PRE_QUALIFY', 'REGISTER', 'PREPARE', 'REVIEW', 'LIVE'];
  const currentIndex = phaseOrder.indexOf(initialPhase);

  for (const phase of phaseOrder) {
    const tasks = defaultTasks[phase] || [];
    const phaseIndex = phaseOrder.indexOf(phase);
    for (const title of tasks) {
      const existing = await prisma.task.findFirst({
        where: { healthmateId, title }
      });
      if (!existing) {
        await prisma.task.create({
          data: {
            title,
            phase,
            completed: phaseIndex < currentIndex,
            healthmateId
          }
        });
      }
    }
  }
};

/**
 * POST /api/webhooks/registration-submitted
 * Transitions Healthmate to REGISTER phase.
 */
const handleRegistrationSubmission = async (req, res) => {
  const { healthmateId } = req.body;

  if (!healthmateId) {
    return res.status(400).json({ message: 'healthmateId is required.' });
  }

  try {
    const existing = await prisma.healthmate.findUnique({
      where: { id: healthmateId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Healthmate not found.' });
    }

    const updated = await prisma.healthmate.update({
      where: { id: healthmateId },
      data: {
        phase: 'REGISTER',
        daysInPhase: 0
      },
      include: { tasks: true }
    });

    await seedAllDefaultTasks(healthmateId, 'REGISTER');

    return res.status(200).json({
      success: true,
      message: 'Healthmate successfully transitioned to REGISTER phase.',
      healthmate: updated
    });
  } catch (error) {
    console.error('[handleRegistrationSubmission]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/webhooks/verification-completed
 * Sets credentials verification status to VERIFIED and provisions credentials.
 */
const handleVerificationCompletion = async (req, res) => {
  const { healthmateId, remark } = req.body;

  if (!healthmateId) {
    return res.status(400).json({ message: 'healthmateId is required.' });
  }

  try {
    const existing = await prisma.healthmate.findUnique({
      where: { id: healthmateId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Healthmate not found.' });
    }

    const updated = await prisma.healthmate.update({
      where: { id: healthmateId },
      data: {
        registrationStatus: 'VERIFIED',
        registrationRemark: remark || 'Verified via R&D Webhook.'
      }
    });

    // Invoke automated credential provisioning service
    const credentials = await provisionClientCredentials(updated);

    return res.status(200).json({
      success: true,
      message: 'Credentials verified and dashboard provisioning dispatched.',
      healthmateId: updated.id,
      credentialsSent: {
        loginId: credentials.loginId
      }
    });
  } catch (error) {
    console.error('[handleVerificationCompletion]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/webhooks/program-submitted
 * Transitions Healthmate to REVIEW phase when they submit program details.
 */
const handleProgramSubmission = async (req, res) => {
  const { healthmateId, programTitle, programStartDate, programEndDate } = req.body;

  if (!healthmateId) {
    return res.status(400).json({ message: 'healthmateId is required.' });
  }

  try {
    const existing = await prisma.healthmate.findUnique({
      where: { id: healthmateId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Healthmate not found.' });
    }

    const updated = await prisma.healthmate.update({
      where: { id: healthmateId },
      data: {
        phase: 'REVIEW',
        daysInPhase: 0,
        programTitle: programTitle || existing.programTitle,
        programStartDate: programStartDate ? new Date(programStartDate) : existing.programStartDate,
        programEndDate: programEndDate ? new Date(programEndDate) : existing.programEndDate,
        programStatus: 'PENDING'
      }
    });

    await seedAllDefaultTasks(healthmateId, 'REVIEW');

    return res.status(200).json({
      success: true,
      message: 'Program details submitted. Healthmate transitioned to REVIEW phase.',
      healthmate: updated
    });
  } catch (error) {
    console.error('[handleProgramSubmission]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/webhooks/program-status
 * Updates the program approval status and remarks from the R&D team review.
 */
const handleProgramStatus = async (req, res) => {
  const { healthmateId, status, approvedMessage } = req.body;

  if (!healthmateId || !status) {
    return res.status(400).json({ message: 'healthmateId and status are required.' });
  }

  const validStatuses = ['PENDING', 'APPROVED', 'CORRECTION_REQUIRED'];
  if (!validStatuses.includes(status.toUpperCase())) {
    return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const existing = await prisma.healthmate.findUnique({
      where: { id: healthmateId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Healthmate not found.' });
    }

    const updated = await prisma.healthmate.update({
      where: { id: healthmateId },
      data: {
        programStatus: status.toUpperCase(),
        programApprovedMsg: approvedMessage || null
      }
    });

    return res.status(200).json({
      success: true,
      message: `Program status successfully updated to ${status.toUpperCase()}.`,
      healthmate: updated
    });
  } catch (error) {
    console.error('[handleProgramStatus]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  handleRegistrationSubmission,
  handleVerificationCompletion,
  handleProgramSubmission,
  handleProgramStatus
};
