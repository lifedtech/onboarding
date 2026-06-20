const prisma = require('../lib/prisma');

/**
 * GET /api/enquiries
 * Returns all enquiries.
 */
const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        opsUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
    return res.status(200).json(enquiries);
  } catch (error) {
    console.error('[getAllEnquiries]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/enquiries
 * Creates a new enquiry.
 */
const createEnquiry = async (req, res) => {
  const { name, contact, remarks, clientType, callbackLater, reminderDate, contacted, location } = req.body;

  if (!name || !contact || !clientType) {
    return res.status(400).json({ message: 'name, contact, and clientType are required.' });
  }

  const validTypes = ['SERVICE_USER', 'HEALTH_PARTNER'];
  if (!validTypes.includes(clientType)) {
    return res.status(400).json({ message: 'clientType must be either SERVICE_USER or HEALTH_PARTNER.' });
  }

  try {
    const enquiry = await prisma.enquiry.create({
      data: {
        name,
        contact,
        remarks: remarks || null,
        clientType,
        contacted: contacted === true,
        callbackLater: callbackLater === true,
        reminderDate: (callbackLater && reminderDate) ? new Date(reminderDate) : null,
        location: location || null,
        opsUserId: req.user.id,
      },
      include: {
        opsUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return res.status(201).json(enquiry);
  } catch (error) {
    console.error('[createEnquiry]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * PATCH /api/enquiries/:id
 * Updates an existing enquiry.
 */
const updateEnquiry = async (req, res) => {
  const { id } = req.params;
  const { name, contact, remarks, clientType, callbackLater, reminderDate, contacted, location } = req.body;

  try {
    const existing = await prisma.enquiry.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    // Auth check (Ops can modify their own, admin can modify any)
    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    if (!isAdmin && existing.opsUserId !== req.user.id) {
      return res.status(403).json({ message: 'Access Denied: You do not own this enquiry.' });
    }

    const updated = await prisma.enquiry.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(contact !== undefined && { contact }),
        ...(remarks !== undefined && { remarks }),
        ...(clientType !== undefined && { clientType }),
        ...(contacted !== undefined && { contacted }),
        ...(callbackLater !== undefined && { callbackLater }),
        ...(callbackLater !== undefined && {
          reminderDate: callbackLater && reminderDate ? new Date(reminderDate) : null
        }),
        ...(location !== undefined && { location })
      },
      include: {
        opsUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('[updateEnquiry]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * DELETE /api/enquiries/:id
 * Deletes an enquiry.
 */
const deleteEnquiry = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.enquiry.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    if (!isAdmin && existing.opsUserId !== req.user.id) {
      return res.status(403).json({ message: 'Access Denied: You do not own this enquiry.' });
    }

    await prisma.enquiry.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error('[deleteEnquiry]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/enquiries/:id/promote
 * Promotes an enquiry of type HEALTH_PARTNER to a Healthmate partner profile.
 */
const promoteToPartner = async (req, res) => {
  const { id } = req.params;
  const { category, type } = req.body; // allow setting these upon promotion

  try {
    const enquiry = await prisma.enquiry.findUnique({ where: { id } });
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    if (enquiry.clientType !== 'HEALTH_PARTNER') {
      return res.status(400).json({ message: 'Only Health Partner enquiries can be promoted to pipeline.' });
    }

    // Create a new Healthmate profile in the PRE_QUALIFY phase
    const isEmail = enquiry.contact.includes('@');
    const healthmate = await prisma.healthmate.create({
      data: {
        name: enquiry.name,
        type: type || 'PRACTITIONER',
        category: category || 'Wellness',
        contactName: enquiry.name,
        contactEmail: isEmail ? enquiry.contact : null,
        contactPhone: !isEmail ? enquiry.contact : null,
        notes: enquiry.location
          ? `Location: ${enquiry.location}. ${enquiry.remarks || ''}`
          : (enquiry.remarks || 'Promoted from Enquiry.'),
        opsUserId: req.user.id,
        phase: 'PRE_QUALIFY',
      }
    });

    // Seed default tasks
    // Let's create the default tasks for this partner
    const phaseOrder = ['PRE_QUALIFY', 'PREPARE', 'REGISTER', 'REVIEW', 'LIVE'];
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

    for (const phase of phaseOrder) {
      const tasks = defaultTasks[phase] || [];
      for (const title of tasks) {
        await prisma.task.create({
          data: {
            title,
            phase,
            completed: false,
            healthmateId: healthmate.id
          }
        });
      }
    }

    // Mark the enquiry as moved to pipeline instead of deleting it
    const updatedEnquiry = await prisma.enquiry.update({
      where: { id },
      data: {
        movedToPipeline: true,
        contacted: true
      },
      include: {
        opsUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Retrieve fresh partner state with all tasks included
    const freshPartner = await prisma.healthmate.findUnique({
      where: { id: healthmate.id },
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

    return res.status(201).json({
      healthmate: freshPartner,
      enquiry: updatedEnquiry
    });
  } catch (error) {
    console.error('[promoteToPartner]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  getAllEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  promoteToPartner,
};
