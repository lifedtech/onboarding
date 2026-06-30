const prisma = require('./src/lib/prisma');

async function main() {
  const admin = await prisma.opsUser.findUnique({
    where: { email: 'admin@lifedhealth.com' }
  });

  if (admin) {
    await prisma.opsUser.update({
      where: { email: 'admin@lifedhealth.com' },
      data: { role: 'SUPER_ADMIN' }
    });
    console.log('Updated admin@lifedhealth.com to SUPER_ADMIN');
  } else {
    console.log('admin@lifedhealth.com not found');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
