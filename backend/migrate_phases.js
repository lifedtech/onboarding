const prisma = require('./src/lib/prisma');

async function migrate() {
  try {
    const result = await prisma.healthmate.updateMany({
      where: { phase: 'REGISTER' },
      data: { phase: 'PREPARE' }
    });
    console.log(`Successfully moved ${result.count} partners from REGISTER to PREPARE.`);

    const remainingRegister = await prisma.healthmate.count({ where: { phase: 'REGISTER' } });
    const totalPrepare = await prisma.healthmate.count({ where: { phase: 'PREPARE' } });
    console.log(`Current counts -> REGISTER: ${remainingRegister}, PREPARE: ${totalPrepare}`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
