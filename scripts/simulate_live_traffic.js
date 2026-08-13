const http = require('http');

const paths = ['/home', '/programs/yoga', '/programs/ayurveda', '/about-us', '/contact', '/pricing'];
const referrers = ['https://google.com', 'https://facebook.com', 'https://instagram.com', 'https://whatsapp.com', 'direct'];
const devices = ['mobile', 'desktop'];

console.log('🚀 Starting Lifed Health Live Traffic Simulator...');
console.log('Press Ctrl+C to stop.\n');

function sendPing() {
  const path = paths[Math.floor(Math.random() * paths.length)];
  const referrer = referrers[Math.floor(Math.random() * referrers.length)];
  const device = devices[Math.floor(Math.random() * devices.length)];
  const sessionId = `sess_sim_${Math.floor(Math.random() * 50)}`;

  const payload = JSON.stringify({
    path,
    referrer,
    device,
    sessionId,
    timestamp: new Date().toISOString()
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/webhooks/traffic/ping',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`[${new Date().toLocaleTimeString()}] 🟢 Ping Sent -> Path: ${path} | Source: ${referrer} | Res: ${res.statusCode}`);
    });
  });

  req.on('error', (e) => {
    console.error(`[${new Date().toLocaleTimeString()}] 🔴 Ping Error:`, e.message);
  });

  req.write(payload);
  req.end();
}

// Send a ping every 2.5 seconds
sendPing();
setInterval(sendPing, 2500);
