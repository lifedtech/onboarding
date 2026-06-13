const axios = require('axios');

async function main() {
  try {
    console.log('--- Testing Port 3005 Login Endpoint ---');
    const response = await axios.post('http://localhost:3005/api/auth/login', {
      email: 'admin@lifed.com',
      password: 'admin123'
    });
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('Response Error Status:', error.response.status);
      console.error('Response Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Network Error:', error.message);
    }
  }
}

main();
