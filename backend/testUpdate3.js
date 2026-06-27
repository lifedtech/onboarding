const prisma = require('./src/lib/prisma');

async function main() {
  const ayush = await prisma.opsUser.findFirst({
    where: { name: { contains: 'ayush', mode: 'insensitive' } }
  });
  
  if (ayush) {
    console.log('Found Ayush:', ayush.name, ayush.role);
    const updated = await prisma.opsUser.update({
      where: { id: ayush.id },
      data: { role: 'marketing' }
    });
    console.log('Updated to:', updated.role);
  } else {
    console.log('Ayush not found');
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
