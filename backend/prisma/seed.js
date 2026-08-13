const crypto = require('crypto');
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
  // No hardcoded password — a fixed credential in a git-tracked seed script
  // is a real secret sitting in version control forever. Set
  // SEED_DEFAULT_PASSWORD for a known local dev password; otherwise a
  // random one is generated and printed once (this DB has no other record
  // of it afterward, so save it if you need it).
  const seedPassword = process.env.SEED_DEFAULT_PASSWORD || crypto.randomBytes(12).toString('base64url');
  if (!process.env.SEED_DEFAULT_PASSWORD) {
    console.log(`[Seed] ⚠️  SEED_DEFAULT_PASSWORD not set — generated password for all seeded accounts: ${seedPassword}`);
    console.log('[Seed]     Set SEED_DEFAULT_PASSWORD in your .env to pin a known password instead.');
  }
  const passwordHash = await bcrypt.hash(seedPassword, SALT_ROUNDS);

  const adminUser = await prisma.opsUser.create({
    data: {
      email: 'tech@lifedhealth.com',
      passwordHash,
      name: 'Admin Ops',
      role: 'admin',
      accessScopes: ['FULL_ACCESS'],
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
