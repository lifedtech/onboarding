const prisma = require('../lib/prisma');

/**
 * GET /api/healthmates
 * Returns all healthmates owned by the authenticated OpsUser,
 * with their associated tasks included.
 */
const getAllHealthmates = async (req, res) => {
  try {
    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const rawLimit = parseInt(req.query.limit) || 100;
    const limit = Math.min(rawLimit, 500); // hard cap at 500
    const skip = (page - 1) * limit;

    const where = isAdmin ? {} : { opsUserId: req.user.id };

    const [total, healthmates] = await prisma.$transaction([
      prisma.healthmate.count({ where }),
      prisma.healthmate.findMany({
        where,
        take: limit,
        skip,
        include: {
          tasks: {
            orderBy: { createdAt: 'asc' },
          },
          opsUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    ]);

    const { isUserOnline } = require('../services/presence.service');
    const healthmatesWithPresence = healthmates.map(hm => ({
      ...hm,
      opsUser: hm.opsUser ? {
        ...hm.opsUser,
        isOnline: isUserOnline(hm.opsUser.id)
      } : null
    }));

    return res.status(200).json({
      data: healthmatesWithPresence,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[getAllHealthmates]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/healthmates
 * Creates a new healthmate and assigns it to the authenticated OpsUser.
 */
const createHealthmate = async (req, res) => {
  const { name, type, category, contactName, contactEmail, contactPhone } = req.body;

  if (!name || !type || !category) {
    return res.status(400).json({ message: 'name, type, and category are required.' });
  }

  // Validate the enum value at the API layer before hitting the DB
  const validTypes = ['PRACTITIONER', 'CENTRE', 'ORGANIZER'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      message: `type must be one of: ${validTypes.join(', ')}.`,
    });
  }

  try {
    const healthmate = await prisma.healthmate.create({
      data: {
        name,
        type,
        category,
        contactName: contactName || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        opsUserId: req.user.id,
        // phase defaults to PRE_QUALIFY, daysInPhase defaults to 0 per schema
      },
    });

    // Automatically seed standard tasks across all phases for the new enquiry
    await seedAllDefaultTasks(healthmate.id, 'PRE_QUALIFY');

    // Retrieve the fully hydrated healthmate with its seeded tasks
    const fresh = await prisma.healthmate.findUnique({
      where: { id: healthmate.id },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return res.status(201).json(fresh);
  } catch (error) {
    console.error('[createHealthmate]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * PATCH /api/healthmates/:id/phase
 * Updates a healthmate's onboarding phase and resets the daysInPhase counter.
 * This is a dedicated endpoint because phase transitions are a core business action.
 */
const updateHealthmatePhase = async (req, res) => {
  const { id } = req.params;
  const { phase } = req.body;

  const validPhases = ['PRE_QUALIFY', 'PREPARE', 'REGISTER', 'REVIEW', 'LIVE'];
  if (!phase || !validPhases.includes(phase)) {
    return res.status(400).json({
      message: `phase must be one of: ${validPhases.join(', ')}.`,
    });
  }

  try {
    const existing = await prisma.healthmate.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Healthmate not found.' });
    }

    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    if (!isAdmin && existing.opsUserId !== req.user.id) {
      return res.status(403).json({
        message: 'Access Denied: Only the assigned Operations coordinator or an Administrator can modify this partner.'
      });
    }

    // Backend Gatekeeper Lock: REGISTER -> REVIEW phase transition requires VERIFIED registration status
    if (existing.phase === 'REGISTER' && phase === 'REVIEW') {
      if (existing.registrationStatus !== 'VERIFIED') {
        return res.status(400).json({
          message: 'Cannot move to Review phase until R&D has verified registration credentials.'
        });
      }
    }

    await prisma.healthmate.update({
      where: { id },
      data: {
        phase,
        daysInPhase: 0, // Reset the counter on every phase transition
      },
    });

    // Seed standard tasks across all phases if not already present
    await seedAllDefaultTasks(id, phase);

    // Retrieve fresh partner state with all tasks included
    const updated = await prisma.healthmate.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
        opsUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const { isUserOnline } = require('../services/presence.service');
    const responseData = {
      ...updated,
      opsUser: updated.opsUser ? {
        ...updated.opsUser,
        isOnline: isUserOnline(updated.opsUser.id)
      } : null
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('[updateHealthmatePhase]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * PATCH /api/healthmates/:id
 * General-purpose update for healthmate fields (name, contact info, category, etc.).
 * Phase changes should go through the dedicated /phase endpoint.
 */
const updateHealthmate = async (req, res) => {
  const { id } = req.params;
  const {
    name, category, contactName, contactEmail, contactPhone, opsUserId,
    screeningRemarks, screeningQueries, recallReminder,
    programTitle, programStartDate, programEndDate, programStatus, programApprovedMsg,
    registrationStatus, registrationRemark
  } = req.body;
  const isAdmin = req.user.role?.toLowerCase() === 'admin';

  try {
    const existing = await prisma.healthmate.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Healthmate not found.' });
    }

    if (!isAdmin && existing.opsUserId !== req.user.id) {
      return res.status(403).json({
        message: 'Access Denied: Only the assigned Operations coordinator or an Administrator can modify this partner.'
      });
    }

    const updated = await prisma.healthmate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(contactName !== undefined && { contactName }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(opsUserId !== undefined && { opsUserId }),
        ...(screeningRemarks !== undefined && { screeningRemarks }),
        ...(screeningQueries !== undefined && { screeningQueries }),
        ...(recallReminder !== undefined && { recallReminder: recallReminder ? new Date(recallReminder) : null }),
        ...(programTitle !== undefined && { programTitle }),
        ...(programStartDate !== undefined && { programStartDate: programStartDate ? new Date(programStartDate) : null }),
        ...(programEndDate !== undefined && { programEndDate: programEndDate ? new Date(programEndDate) : null }),
        ...(programStatus !== undefined && { programStatus }),
        ...(programApprovedMsg !== undefined && { programApprovedMsg }),
        ...(registrationStatus !== undefined && { registrationStatus }),
        ...(registrationRemark !== undefined && { registrationRemark }),
      },
      include: {
        tasks: true,
        opsUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const { isUserOnline } = require('../services/presence.service');
    const responseData = {
      ...updated,
      opsUser: updated.opsUser ? {
        ...updated.opsUser,
        isOnline: isUserOnline(updated.opsUser.id)
      } : null
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('[updateHealthmate]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * DELETE /api/healthmates/:id
 * Deletes a healthmate and all associated tasks (cascade is handled by the schema).
 */
const deleteHealthmate = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.healthmate.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Healthmate not found.' });
    }

    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    if (!isAdmin && existing.opsUserId !== req.user.id) {
      return res.status(403).json({
        message: 'Access Denied: Only the assigned Operations coordinator or an Administrator can modify this partner.'
      });
    }

    await prisma.healthmate.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    console.error('[deleteHealthmate]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * PATCH /api/healthmates/:id/notes
 * Updates the internal notes field for a healthmate.
 */
const updateNotes = async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  if (typeof notes !== 'string') {
    return res.status(400).json({ message: '`notes` must be a string.' });
  }

  try {
    const existing = await prisma.healthmate.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Healthmate not found.' });
    }

    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    if (!isAdmin && existing.opsUserId !== req.user.id) {
      return res.status(403).json({
        message: 'Access Denied: Only the assigned Operations coordinator or an Administrator can modify this partner.'
      });
    }

    const updated = await prisma.healthmate.update({
      where: { id },
      data: { notes },
      include: { tasks: true },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('[updateNotes]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * PUT /api/healthmates/:id
 * Replaces and updates general fields of a healthmate manually.
 */
const updateHealthmateDetails = async (req, res) => {
  const { id } = req.params;
  const { name, type, category, contactName, contactEmail, contactPhone, notes } = req.body;

  if (!name || !type || !category) {
    return res.status(400).json({ message: 'name, type, and category are required.' });
  }

  const validTypes = ['PRACTITIONER', 'CENTRE', 'ORGANIZER'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      message: `type must be one of: ${validTypes.join(', ')}.`,
    });
  }

  try {
    const existing = await prisma.healthmate.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Healthmate not found.' });
    }

    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    if (!isAdmin && existing.opsUserId !== req.user.id) {
      return res.status(403).json({
        message: 'Access Denied: Only the assigned Operations coordinator or an Administrator can modify this partner.'
      });
    }

    const updated = await prisma.healthmate.update({
      where: { id },
      data: {
        name,
        type,
        category,
        contactName: contactName !== undefined ? contactName : null,
        contactEmail: contactEmail !== undefined ? contactEmail : null,
        contactPhone: contactPhone !== undefined ? contactPhone : null,
        notes: notes !== undefined ? notes : null,
      },
      include: { tasks: true },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('[updateHealthmateDetails]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// ─── Default Tasks Seeding Config ────────────────────────────────────────────

const defaultTasks = {
  PRE_QUALIFY: [
    "Verify primary contact email and phone number",
    "Complete screening call and business analysis"
  ],
  PREPARE: [
    "Upload certified professional qualifications",
    "Sign partnership framework agreement"
  ],
  REGISTER: [
    "Submit valid business registration registry copy",
    "Configure bank payout and tax collection variables"
  ],
  REVIEW: [
    "Perform background verification and credit review",
    "Conduct live platform video walkthrough"
  ],
  LIVE: [
    "Configure booking schedule and live slots",
    "Send welcome package and micro-habits toolkit"
  ]
};

const seedAllDefaultTasks = async (healthmateId, initialPhase) => {
  const phaseOrder = ['PRE_QUALIFY', 'PREPARE', 'REGISTER', 'REVIEW', 'LIVE'];
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
 * POST /api/healthmates/:id/upload
 * Saves the uploaded registration document and updates the database.
 * Automatically completes the registration task if present.
 */
const uploadRegistrationDocument = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const existing = await prisma.healthmate.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Healthmate not found.' });
    }

    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    if (!isAdmin && existing.opsUserId !== req.user.id) {
      return res.status(403).json({
        message: 'Access Denied: Only the assigned Operations coordinator or an Administrator can modify this partner.'
      });
    }

    const regDocUrl = `/uploads/${req.file.filename}`;
    const regDocName = req.file.originalname;

    // Update partner document URL and set status back to PENDING
    await prisma.healthmate.update({
      where: { id },
      data: { 
        regDocUrl, 
        regDocName,
        registrationStatus: 'PENDING'
      }
    });

    // When documents are submitted in the REGISTER phase, trigger BullMQ job with 24-hour delay
    if (existing.phase === 'REGISTER') {
      try {
        const { enqueueRegistrationSLA } = require('../services/queue.service');
        await enqueueRegistrationSLA(id);
      } catch (qErr) {
        console.error('[uploadRegistrationDocument] Failed to enqueue SLA job:', qErr);
      }
    }

    // Auto-complete the registration task
    const regTask = await prisma.task.findFirst({
      where: {
        healthmateId: id,
        title: {
          contains: 'business registration registry copy',
          mode: 'insensitive'
        }
      }
    });

    if (regTask) {
      await prisma.task.update({
        where: { id: regTask.id },
        data: { completed: true }
      });
    }

    // Retrieve fresh partner state
    const updated = await prisma.healthmate.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('[uploadRegistrationDocument]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * DELETE /api/healthmates/:id/upload
 * Deletes the uploaded registration document from the server disk and Postgres db.
 * Automatically unchecks the registration task.
 */
const deleteRegistrationDocument = async (req, res) => {
  const { id } = req.params;
  const path = require('path');
  const fs = require('fs');

  try {
    const existing = await prisma.healthmate.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Healthmate not found.' });
    }

    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    if (!isAdmin && existing.opsUserId !== req.user.id) {
      return res.status(403).json({
        message: 'Access Denied: Only the assigned Operations coordinator or an Administrator can modify this partner.'
      });
    }

    // Delete the file physically on disk if exists
    if (existing.regDocUrl) {
      const fileName = existing.regDocUrl.replace('/uploads/', '');
      const filePath = path.join(__dirname, '../../uploads', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Update database fields to null
    await prisma.healthmate.update({
      where: { id },
      data: {
        regDocUrl: null,
        regDocName: null
      }
    });

    // Automatically uncheck the registry copy task
    const regTask = await prisma.task.findFirst({
      where: {
        healthmateId: id,
        title: {
          contains: 'business registration registry copy',
          mode: 'insensitive'
        }
      }
    });

    if (regTask) {
      await prisma.task.update({
        where: { id: regTask.id },
        data: { completed: false }
      });
    }

    // Retrieve fresh partner state
    const updated = await prisma.healthmate.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('[deleteRegistrationDocument]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/rnd/verify-credentials
 * Updates the Healthmate's registration credentials status to VERIFIED and saves their remark.
 */
const rndVerifyCredentials = async (req, res) => {
  const { healthmateId, id, remark, registrationRemark } = req.body;
  const targetId = healthmateId || id;
  const targetRemark = remark || registrationRemark || '';

  if (!targetId) {
    return res.status(400).json({ message: 'healthmateId is required.' });
  }

  try {
    const existing = await prisma.healthmate.findUnique({
      where: { id: targetId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Healthmate not found.' });
    }

    const updated = await prisma.healthmate.update({
      where: { id: targetId },
      data: {
        registrationStatus: 'VERIFIED',
        registrationRemark: targetRemark
      },
      include: {
        tasks: {
          orderBy: { createdAt: 'asc' },
        },
        opsUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      }
    });

    // Auto-generate and provision client dashboard credentials
    try {
      const { provisionClientCredentials } = require('../services/credential.service');
      await provisionClientCredentials(updated);
    } catch (credError) {
      console.error('[rndVerifyCredentials] Webhook / Credential provisioning failed:', credError);
    }

    const { isUserOnline } = require('../services/presence.service');
    const responseData = {
      ...updated,
      opsUser: updated.opsUser ? {
        ...updated.opsUser,
        isOnline: isUserOnline(updated.opsUser.id)
      } : null
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('[rndVerifyCredentials]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  getAllHealthmates,
  createHealthmate,
  updateHealthmate,
  updateHealthmatePhase,
  updateNotes,
  deleteHealthmate,
  updateHealthmateDetails,
  uploadRegistrationDocument,
  deleteRegistrationDocument,
  rndVerifyCredentials,
};
