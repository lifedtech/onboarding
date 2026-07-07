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

  console.log('[Seed] 🎉 Initial system data deployed successfully! (Demo data removed)');
}

main()
  .catch((e) => {
    console.error('[Seed] Error running seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
