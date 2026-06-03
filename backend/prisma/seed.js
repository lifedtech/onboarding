const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

async function main() {
  console.log('[Seed] 🧹 Clearing existing database records...');
  
  // Clear in order of dependencies (child records first)
  await prisma.task.deleteMany({});
  await prisma.healthmate.deleteMany({});
  await prisma.opsUser.deleteMany({});

  console.log('[Seed] 👤 Creating default Ops User...');
  const passwordHash = await bcrypt.hash('admin123', SALT_ROUNDS);

  const opsUser = await prisma.opsUser.create({
    data: {
      email: 'admin@lifed.com',
      passwordHash,
      name: 'Admin Ops',
      role: 'admin'
    }
  });

  console.log(`[Seed] Ops User created: ${opsUser.email}`);

  console.log('[Seed] 🏥 Creating mock partners (Healthmates)...');

  // Define 5 distinct partners
  const partnersData = [
    {
      name: 'Dr. Sarah Jenkins',
      type: 'PRACTITIONER',
      category: 'Physiotherapy',
      phase: 'PRE_QUALIFY',
      daysInPhase: 3,
      contactName: 'Sarah Jenkins',
      contactEmail: 'sarah.j@example.com',
      contactPhone: '+61412345678',
      notes: 'Interested in sports rehabilitation partnerships.'
    },
    {
      name: 'Harmony Wellbeing Centre',
      type: 'CENTRE',
      category: 'Yoga & Meditation',
      phase: 'PREPARE',
      daysInPhase: 8,
      contactName: 'Marcus Aurelius',
      contactEmail: 'marcus@harmonywellbeing.com',
      contactPhone: '+61412345679',
      notes: 'Large centre with 5 active yoga studios.'
    },
    {
      name: 'Elite Sports Rehabilitation',
      type: 'CENTRE',
      category: 'Sports Medicine',
      phase: 'REGISTER',
      daysInPhase: 14,
      contactName: 'Coach Carter',
      contactEmail: 'carter@eliterehab.com',
      contactPhone: '+61412345681',
      notes: 'Specializes in post-surgical patient recovery pathways.'
    },
    {
      name: 'Holistic Retreats Organizer',
      type: 'ORGANIZER',
      category: 'Wellness Retreats',
      phase: 'REVIEW',
      daysInPhase: 4,
      contactName: 'Elena Rostova',
      contactEmail: 'elena@holisticretreats.com',
      contactPhone: '+61412345680',
      notes: 'Coordinates seasonal mindfulness retreats globally.'
    },
    {
      name: 'Dr. Amit Patel',
      type: 'PRACTITIONER',
      category: 'Ayurveda',
      phase: 'LIVE',
      daysInPhase: 0,
      contactName: 'Amit Patel',
      contactEmail: 'amit.p@example.com',
      contactPhone: '+61412345682',
      notes: 'Fully onboarded and ready to start publishing wellness plans.'
    }
  ];

  for (const partner of partnersData) {
    const healthmate = await prisma.healthmate.create({
      data: {
        name: partner.name,
        type: partner.type,
        category: partner.category,
        phase: partner.phase,
        daysInPhase: partner.daysInPhase,
        contactName: partner.contactName,
        contactEmail: partner.contactEmail,
        contactPhone: partner.contactPhone,
        notes: partner.notes,
        opsUserId: opsUser.id
      }
    });

    console.log(`  - Seeded healthmate: ${healthmate.name} (${healthmate.phase})`);

    // Create custom phase tasks for each Healthmate
    const tasks = getPhaseTasks(healthmate.phase);
    for (const task of tasks) {
      await prisma.task.create({
        data: {
          title: task.title,
          completed: task.completed,
          phase: task.phase,
          healthmateId: healthmate.id
        }
      });
    }
  }

  console.log('[Seed] 🎉 Seeding completed successfully!');
}

/**
 * Returns standard tasks mapped for the partner based on their onboarding phase.
 */
function getPhaseTasks(currentPhase) {
  const tasks = [
    // Pre-Qualify Phase Tasks
    { title: 'Verify primary contact email and phone number', completed: true, phase: 'PRE_QUALIFY' },
    { title: 'Complete screening call and business analysis', completed: false, phase: 'PRE_QUALIFY' },
    
    // Prepare Phase Tasks
    { title: 'Upload certified professional qualifications', completed: true, phase: 'PREPARE' },
    { title: 'Sign partnership framework agreement', completed: false, phase: 'PREPARE' },

    // Register Phase Tasks
    { title: 'Submit valid business registration registry copy', completed: false, phase: 'REGISTER' },
    { title: 'Configure bank payout and tax collection variables', completed: false, phase: 'REGISTER' },

    // Review Phase Tasks
    { title: 'Perform background verification and credit review', completed: true, phase: 'REVIEW' },
    { title: 'Conduct live platform video walkthrough', completed: false, phase: 'REVIEW' },

    // Live Phase Tasks
    { title: 'Configure booking schedule and live slots', completed: true, phase: 'LIVE' },
    { title: 'Send welcome package and micro-habits toolkit', completed: true, phase: 'LIVE' }
  ];

  // Return the tasks, marking tasks belonging to previous phases as completed automatically
  const phaseOrder = ['PRE_QUALIFY', 'PREPARE', 'REGISTER', 'REVIEW', 'LIVE'];
  const currentIndex = phaseOrder.indexOf(currentPhase);

  return tasks.map(task => {
    const taskIndex = phaseOrder.indexOf(task.phase);
    // If the task belongs to an earlier phase, mark as completed
    if (taskIndex < currentIndex) {
      return { ...task, completed: true };
    }
    // If the task belongs to a future phase, it is uncompleted
    if (taskIndex > currentIndex) {
      return { ...task, completed: false };
    }
    // Otherwise keep default state
    return task;
  });
}

main()
  .catch((e) => {
    console.error('[Seed] Error running seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
