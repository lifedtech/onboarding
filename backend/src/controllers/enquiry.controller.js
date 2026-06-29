const prisma = require('../lib/prisma');
const ServiceUserService = require('../services/serviceUser.service');


/**
 * GET /api/enquiries
 * Returns all enquiries.
 */
const getAllEnquiries = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const rawLimit = parseInt(req.query.limit) || 100;
    const limit = Math.min(rawLimit, 500); // hard cap at 500
    const skip = (page - 1) * limit;

    const [total, enquiries] = await prisma.$transaction([
      prisma.enquiry.count(),
      prisma.enquiry.findMany({
        take: limit,
        skip,
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
      })
    ]);

    return res.status(200).json({
      data: enquiries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
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
  const { 
    name, contact, alternateContact, remarks, clientType, callbackLater, reminderDate, contacted, city, state, country, 
    subcategory, platformFound, programPossibility, format, priceRange, capacity,
    scoreRelevance, scoreSafety, scoreExperience, scoreCredibility, scoreLocation,
    scoreVisual, scoreBooking, scoreUniqueness, scoreCorporate, scoreRepeatability
  } = req.body;

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
        alternateContact: alternateContact || null,
        remarks: remarks || null,
        clientType,
        contacted: contacted === true,
        callbackLater: callbackLater === true,
        reminderDate: (callbackLater && reminderDate) ? new Date(reminderDate) : null,
        city: city || null,
        state: state || null,
        country: country || null,
        subcategory: subcategory || null,
        platformFound: platformFound || null,
        programPossibility: programPossibility || null,
        format: format || null,
        priceRange: priceRange || null,
        capacity: capacity || null,
        scoreRelevance: parseInt(scoreRelevance) || 0,
        scoreSafety: parseInt(scoreSafety) || 0,
        scoreExperience: parseInt(scoreExperience) || 0,
        scoreCredibility: parseInt(scoreCredibility) || 0,
        scoreLocation: parseInt(scoreLocation) || 0,
        scoreVisual: parseInt(scoreVisual) || 0,
        scoreBooking: parseInt(scoreBooking) || 0,
        scoreUniqueness: parseInt(scoreUniqueness) || 0,
        scoreCorporate: parseInt(scoreCorporate) || 0,
        scoreRepeatability: parseInt(scoreRepeatability) || 0,
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
  const { 
    name, contact, alternateContact, remarks, clientType, callbackLater, reminderDate, contacted, city, state, country, 
    subcategory, platformFound, programPossibility, format, priceRange, capacity,
    scoreRelevance, scoreSafety, scoreExperience, scoreCredibility, scoreLocation,
    scoreVisual, scoreBooking, scoreUniqueness, scoreCorporate, scoreRepeatability 
  } = req.body;

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
        ...(alternateContact !== undefined && { alternateContact }),
        ...(remarks !== undefined && { remarks }),
        ...(clientType !== undefined && { clientType }),
        ...(contacted !== undefined && { contacted }),
        ...(callbackLater !== undefined && { callbackLater }),
        ...(callbackLater !== undefined && {
          reminderDate: callbackLater && reminderDate ? new Date(reminderDate) : null
        }),
        ...(city !== undefined && { city: city || null }),
        ...(state !== undefined && { state: state || null }),
        ...(country !== undefined && { country: country || null }),
        ...(subcategory !== undefined && { subcategory: subcategory || null }),
        ...(platformFound !== undefined && { platformFound: platformFound || null }),
        ...(programPossibility !== undefined && { programPossibility: programPossibility || null }),
        ...(format !== undefined && { format: format || null }),
        ...(priceRange !== undefined && { priceRange: priceRange || null }),
        ...(capacity !== undefined && { capacity: capacity || null }),
        ...(scoreRelevance !== undefined && { scoreRelevance: parseInt(scoreRelevance) || 0 }),
        ...(scoreSafety !== undefined && { scoreSafety: parseInt(scoreSafety) || 0 }),
        ...(scoreExperience !== undefined && { scoreExperience: parseInt(scoreExperience) || 0 }),
        ...(scoreCredibility !== undefined && { scoreCredibility: parseInt(scoreCredibility) || 0 }),
        ...(scoreLocation !== undefined && { scoreLocation: parseInt(scoreLocation) || 0 }),
        ...(scoreVisual !== undefined && { scoreVisual: parseInt(scoreVisual) || 0 }),
        ...(scoreBooking !== undefined && { scoreBooking: parseInt(scoreBooking) || 0 }),
        ...(scoreUniqueness !== undefined && { scoreUniqueness: parseInt(scoreUniqueness) || 0 }),
        ...(scoreCorporate !== undefined && { scoreCorporate: parseInt(scoreCorporate) || 0 }),
        ...(scoreRepeatability !== undefined && { scoreRepeatability: parseInt(scoreRepeatability) || 0 }),
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
        city: enquiry.city,
        state: enquiry.state,
        country: enquiry.country,
        subcategory: enquiry.subcategory,
        platformFound: enquiry.platformFound,
        programPossibility: enquiry.programPossibility,
        format: enquiry.format,
        priceRange: enquiry.priceRange,
        capacity: enquiry.capacity,
        notes: enquiry.remarks || 'Promoted from Enquiry.',
        opsUserId: req.user.id,
        phase: 'PRE_QUALIFY',
      }
    });

    // Seed default tasks
    // Let's create the default tasks for this partner
    const phaseOrder = ['PRE_QUALIFY', 'REGISTER', 'PREPARE', 'REVIEW', 'LIVE'];
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

/**
 * POST /api/enquiries/:id/promote-user
 * Promotes an enquiry of type SERVICE_USER to a Service User profile in our JSON database.
 */
const promoteToServiceUser = async (req, res) => {
  const { id } = req.params;
  const { tier } = req.body;

  try {
    const enquiry = await prisma.enquiry.findUnique({ where: { id } });
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }

    if (enquiry.clientType !== 'SERVICE_USER') {
      return res.status(400).json({ message: 'Only Service User enquiries can be promoted to service users list.' });
    }

    // Determine email and phone
    const isEmail = enquiry.contact.includes('@');
    const email = isEmail ? enquiry.contact : `${enquiry.name.toLowerCase().replace(/\s+/g, '')}@example.com`;
    const phone = !isEmail ? enquiry.contact : '';

    const newUser = ServiceUserService.create({
      name: enquiry.name,
      email,
      phone,
      tier: tier || 'SILVER',
      status: 'ACTIVE',
      notes: enquiry.remarks || 'Promoted from Enquiry.'
    });

    // Mark the enquiry as moved to pipeline and contacted
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

    return res.status(201).json({
      serviceUser: newUser,
      enquiry: updatedEnquiry
    });
  } catch (error) {
    console.error('[promoteToServiceUser]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  getAllEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  promoteToPartner,
  promoteToServiceUser,
};

