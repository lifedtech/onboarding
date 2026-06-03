require('dotenv').config();
const prisma = require('./src/lib/prisma.js');

async function main() {
  try {
    console.log('--- Database Connection Check ---');
    console.log(`DATABASE_URL in use: ${process.env.DATABASE_URL}`);
    const count = await prisma.opsUser.count();
    console.log(`Total users in database: ${count}`);

    const users = await prisma.opsUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    console.log('Users list:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error during query:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
