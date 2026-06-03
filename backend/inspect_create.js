require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./src/lib/prisma.js');

async function main() {
  try {
    console.log('--- Creating user manually ---');
    const user = await prisma.opsUser.create({
      data: {
        name: 'Ayush K Raj',
        email: 'aayushraj1601@gmail.com',
        passwordHash: await bcrypt.hash('password123', 12),
        role: 'ops'
      }
    });
    console.log('User created successfully:', user);
  } catch (error) {
    console.error('Error during query:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
