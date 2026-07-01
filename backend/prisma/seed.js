const prisma = require('../src/lib/prisma');
const bcrypt = require('@node-rs/bcrypt');

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

  console.log('[Seed] 🎉 Seeding completed successfully!');
}
main()
  .catch((e) => {
    console.error('[Seed] Error running seed script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
