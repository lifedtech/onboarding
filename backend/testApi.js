require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const ayush = await prisma.opsUser.findFirst({
      where: { name: { contains: 'ayush', mode: 'insensitive' } }
    });
    
    if (!ayush) {
      console.log('Ayush not found');
      return;
    }

    const token = jwt.sign(
      { id: ayush.id, email: ayush.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Testing PATCH /api/users/' + ayush.id);
    const updateRes = await axios.patch('http://localhost:3001/api/users/' + ayush.id, {
      role: 'marketing'
    }, {
      headers: { Authorization: 'Bearer ' + token }
    });
    
    console.log('Update Status:', updateRes.status);
    console.log('Update Data:', updateRes.data);
  } catch (err) {
    console.log('Error:', err.response ? err.response.data : err.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
