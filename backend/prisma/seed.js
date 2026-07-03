const prisma = require('../src/lib/prisma');
const bcrypt = require('@node-rs/bcrypt');

const SALT_ROUNDS = 12;

function randomDate(daysBack = 45) {
  return new Date(Date.now() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log('[Seed] 🧹 Clearing existing database records...');
  
  // Clear in order of dependencies
  await prisma.opsMessage.deleteMany({});
  await prisma.participant.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.healthmateQualification.deleteMany({});
  await prisma.healthmate.deleteMany({});
  await prisma.enquiry.deleteMany({});
  await prisma.sessionLog.deleteMany({});
  await prisma.opsUser.deleteMany({});

  console.log('[Seed] 👤 Creating Ops Users...');
  const passwordHash = await bcrypt.hash('admin123', SALT_ROUNDS);

  const adminUser = await prisma.opsUser.create({
    data: {
      email: 'admin@lifed.com',
      passwordHash,
      name: 'Admin Ops',
      role: 'admin',
      statusMode: 'online',
    }
  });

  const salesUser = await prisma.opsUser.create({
    data: {
      email: 'sales@lifed.com',
      passwordHash,
      name: 'Sales Rep',
      role: 'marketing',
      statusMode: 'busy',
    }
  });

  const opsUser = await prisma.opsUser.create({
    data: {
      email: 'ops@lifed.com',
      passwordHash,
      name: 'Support Ops',
      role: 'ops',
      statusMode: 'online',
    }
  });

  const opsUsers = [adminUser, salesUser, opsUser];

  console.log('[Seed] 📝 Creating Enquiries...');
  const enquiryNames = ['Alice Green', 'Bob White', 'Charlie Brown', 'Diana Prince', 'Eve Smith', 'Frank Castle', 'Grace Lee'];
  for (let i = 0; i < 20; i++) {
    const isPartner = i % 2 === 0;
    await prisma.enquiry.create({
      data: {
        name: enquiryNames[i % enquiryNames.length] + ' ' + i,
        email: `enquiry${i}@example.com`,
        contact: `+1555000${1000+i}`,
        clientType: isPartner ? 'HEALTH_PARTNER' : 'SERVICE_USER',
        city: 'New York',
        opsUserId: opsUsers[i % opsUsers.length].id,
        createdAt: randomDate(60), // Up to 60 days ago
      }
    });
  }

  console.log('[Seed] 🏥 Creating Healthmates...');
  const phases = ['PRE_QUALIFY', 'PREPARE', 'REGISTER', 'REVIEW', 'LIVE'];
  const types = ['PRACTITIONER', 'CENTRE', 'ORGANIZER'];
  const categories = ['Yoga', 'Physiotherapy', 'Nutrition', 'Mental Health'];

  const healthmates = [];
  for (let i = 0; i < 25; i++) {
    const hm = await prisma.healthmate.create({
      data: {
        name: `Healthmate Partner ${i + 1}`,
        type: types[i % types.length],
        category: categories[i % categories.length],
        phase: phases[i % phases.length],
        daysInPhase: Math.floor(Math.random() * 10),
        contactName: `Dr. Smith ${i}`,
        contactEmail: `partner${i}@clinic.com`,
        city: 'Los Angeles',
        state: 'CA',
        opsUserId: opsUsers[i % opsUsers.length].id,
        createdAt: randomDate(45), // MTD metrics will pick up last 30 days
        registrationStatus: phases[i % phases.length] === 'LIVE' ? 'VERIFIED' : 'PENDING',
      }
    });
    healthmates.push(hm);

    // Create tasks for this healthmate
    if (i % 2 === 0) {
      await prisma.task.create({
        data: {
          title: `Verify documents for ${hm.name}`,
          completed: Math.random() > 0.5,
          phase: hm.phase,
          healthmateId: hm.id,
          createdAt: randomDate(10),
        }
      });
    }
  }

  console.log('[Seed] 🎟️ Creating Support Tickets...');
  const ticketTypes = ['SYSTEM', 'HEALTHMATE', 'SERVICE_USER'];
  const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH'];

  for (let i = 0; i < 15; i++) {
    const tType = ticketTypes[i % ticketTypes.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const tData = {
      title: `Issue with ${tType} feature ${i}`,
      description: 'Customer is reporting an issue connecting to the portal.',
      type: tType,
      status: status,
      priority: priorities[i % priorities.length],
      createdAt: randomDate(15),
    };

    if (status === 'RESOLVED') {
      tData.resolutionRemarks = 'Resolved by updating the user credentials.';
    }

    if (tType === 'SYSTEM') {
      tData.raisedByOpsId = opsUser.id;
    } else if (tType === 'HEALTHMATE') {
      tData.healthmateId = healthmates[i % healthmates.length].id;
    } else {
      tData.serviceUserEmail = `user${i}@client.com`;
    }

    // Assign half the tickets
    if (i % 2 === 0) {
      tData.assignedToId = opsUsers[Math.floor(Math.random() * opsUsers.length)].id;
    }

    await prisma.ticket.create({ data: tData });
  }

  console.log('[Seed] 🎉 Demo data deployed successfully!');
}

main()
  .catch((e) => {
    console.error('[Seed] Error running seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
