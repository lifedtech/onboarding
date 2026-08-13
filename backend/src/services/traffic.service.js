const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'traffic_logs.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      events: [],
      summary: {
        totalTraffic: 0,
        todayTraffic: 0,
        activeUsersNow: 0
      }
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

function readData() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { events: [], summary: { totalTraffic: 0, todayTraffic: 0, activeUsersNow: 0 } };
  }
}

function writeData(data) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

const TrafficService = {
  // Record incoming traffic event from Laravel site or frontend ping
  recordEvent: (eventData) => {
    const db = readData();
    
    const newEvent = {
      id: `trf_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      sessionId: eventData.sessionId || eventData.session_id || `anon_${Math.random().toString(36).substr(2, 9)}`,
      path: eventData.path || eventData.url || '/',
      referrer: eventData.referrer || 'direct',
      ip: eventData.ip || '127.0.0.1',
      userAgent: eventData.userAgent || eventData.user_agent || '',
      country: eventData.country || 'IN',
      device: eventData.device || 'desktop',
      timestamp: eventData.timestamp || new Date().toISOString()
    };

    db.events.push(newEvent);

    // Keep max 5000 latest events in storage
    if (db.events.length > 5000) {
      db.events = db.events.slice(-5000);
    }

    db.summary.totalTraffic = (db.summary.totalTraffic || 0) + 1;
    writeData(db);
    return newEvent;
  },

  // Get aggregated traffic metrics for God View Analytics
  getTrafficSummary: () => {
    const db = readData();
    const now = new Date();
    const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const events = db.events || [];

    // Active users in last 15 minutes
    const activeSessions = new Set(
      events
        .filter(e => new Date(e.timestamp) >= fifteenMinsAgo)
        .map(e => e.sessionId)
    );

    // Today's total traffic count
    const todayEvents = events.filter(e => new Date(e.timestamp) >= startOfToday);

    // Path breakdown
    const pathCounts = {};
    events.forEach(e => {
      pathCounts[e.path] = (pathCounts[e.path] || 0) + 1;
    });

    // Top channels
    const channelCounts = {};
    events.forEach(e => {
      let channel = 'Direct';
      if (e.referrer && e.referrer.includes('google')) channel = 'Google Organic';
      else if (e.referrer && e.referrer.includes('facebook')) channel = 'Meta Ads';
      else if (e.referrer && e.referrer.includes('instagram')) channel = 'Instagram';
      else if (e.referrer && e.referrer.includes('whatsapp')) channel = 'WhatsApp';
      else if (e.referrer && e.referrer !== 'direct') channel = 'Referral';
      channelCounts[channel] = (channelCounts[channel] || 0) + 1;
    });

    return {
      totalTraffic: events.length,
      todayTraffic: todayEvents.length,
      activeUsersNow: activeSessions.size,
      topPaths: Object.entries(pathCounts).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 5),
      topChannels: Object.entries(channelCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      recentEvents: events.slice(-10).reverse()
    };
  }
};

module.exports = TrafficService;
