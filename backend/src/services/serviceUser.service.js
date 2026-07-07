const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'service_users.json');

// Helper to ensure data directory and file exist
function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = getMockData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
}

function getMockData() {
  return [];
}

// Read database
function readData() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

// Write database
function writeData(data) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Service Methods ─────────────────────────────────────────────────────────

const ServiceUserService = {
  // Service Users CRUD
  getAll: () => {
    return readData();
  },

  getById: (id) => {
    const list = readData();
    return list.find((u) => u.id === id) || null;
  },

  create: (userData) => {
    const list = readData();
    const newUser = {
      id: `su-${Math.floor(1000 + Math.random() * 9000)}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      status: userData.status || 'ACTIVE',
      tier: userData.tier || 'SILVER',
      notes: userData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookings: [],
      payments: [],
      supportTickets: []
    };
    list.push(newUser);
    writeData(list);
    return newUser;
  },

  update: (id, updates) => {
    const list = readData();
    const idx = list.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    const updated = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    list[idx] = updated;
    writeData(list);
    return updated;
  },

  delete: (id) => {
    const list = readData();
    const filtered = list.filter((u) => u.id !== id);
    if (filtered.length === list.length) return false;
    writeData(filtered);
    return true;
  },

  // Bookings Methods
  createBooking: (userId, bookingData) => {
    const list = readData();
    const idx = list.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    const newBooking = {
      id: `b-${Math.floor(100 + Math.random() * 900)}`,
      serviceName: bookingData.serviceName,
      providerName: bookingData.providerName,
      bookingDate: new Date(bookingData.bookingDate).toISOString(),
      status: bookingData.status || 'CONFIRMED',
      amount: parseFloat(bookingData.amount) || 0.0,
      paymentStatus: bookingData.paymentStatus || 'UNPAID',
      createdAt: new Date().toISOString()
    };

    list[idx].bookings.push(newBooking);
    list[idx].updatedAt = new Date().toISOString();
    writeData(list);
    return { user: list[idx], booking: newBooking };
  },

  updateBooking: (userId, bookingId, updates) => {
    const list = readData();
    const idx = list.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    const bIdx = list[idx].bookings.findIndex((b) => b.id === bookingId);
    if (bIdx === -1) return null;

    list[idx].bookings[bIdx] = {
      ...list[idx].bookings[bIdx],
      ...updates,
      ...(updates.bookingDate && { bookingDate: new Date(updates.bookingDate).toISOString() })
    };
    list[idx].updatedAt = new Date().toISOString();
    writeData(list);
    return { user: list[idx], booking: list[idx].bookings[bIdx] };
  },

  deleteBooking: (userId, bookingId) => {
    const list = readData();
    const idx = list.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    list[idx].bookings = list[idx].bookings.filter((b) => b.id !== bookingId);
    list[idx].updatedAt = new Date().toISOString();
    writeData(list);
    return list[idx];
  },

  // Payments Methods
  createPayment: (userId, paymentData) => {
    const list = readData();
    const idx = list.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    const newPayment = {
      id: `p-${Math.floor(200 + Math.random() * 900)}`,
      amount: parseFloat(paymentData.amount) || 0.0,
      status: paymentData.status || 'PENDING',
      method: paymentData.method || 'CREDIT_CARD',
      transactionId: paymentData.transactionId || `txn_${Math.floor(10000000 + Math.random() * 90000000)}`,
      description: paymentData.description || '',
      billingDate: new Date(paymentData.billingDate || Date.now()).toISOString(),
      createdAt: new Date().toISOString()
    };

    list[idx].payments.push(newPayment);
    list[idx].updatedAt = new Date().toISOString();
    writeData(list);
    return { user: list[idx], payment: newPayment };
  },

  updatePayment: (userId, paymentId, updates) => {
    const list = readData();
    const idx = list.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    const pIdx = list[idx].payments.findIndex((p) => p.id === paymentId);
    if (pIdx === -1) return null;

    list[idx].payments[pIdx] = {
      ...list[idx].payments[pIdx],
      ...updates,
      ...(updates.billingDate && { billingDate: new Date(updates.billingDate).toISOString() })
    };
    list[idx].updatedAt = new Date().toISOString();
    writeData(list);
    return { user: list[idx], payment: list[idx].payments[pIdx] };
  },

  deletePayment: (userId, paymentId) => {
    const list = readData();
    const idx = list.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    list[idx].payments = list[idx].payments.filter((p) => p.id !== paymentId);
    list[idx].updatedAt = new Date().toISOString();
    writeData(list);
    return list[idx];
  },

  // Support Tickets Methods
  createSupportTicket: (userId, ticketData) => {
    const list = readData();
    const idx = list.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    const newTicket = {
      id: `t-${Math.floor(300 + Math.random() * 900)}`,
      title: ticketData.title,
      description: ticketData.description || '',
      category: ticketData.category || 'GENERAL',
      severity: ticketData.severity || 'MEDIUM',
      status: ticketData.status || 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list[idx].supportTickets.push(newTicket);
    list[idx].updatedAt = new Date().toISOString();
    writeData(list);
    return { user: list[idx], ticket: newTicket };
  },

  updateSupportTicket: (userId, ticketId, updates) => {
    const list = readData();
    const idx = list.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    const tIdx = list[idx].supportTickets.findIndex((t) => t.id === ticketId);
    if (tIdx === -1) return null;

    list[idx].supportTickets[tIdx] = {
      ...list[idx].supportTickets[tIdx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    list[idx].updatedAt = new Date().toISOString();
    writeData(list);
    return { user: list[idx], ticket: list[idx].supportTickets[tIdx] };
  },

  deleteSupportTicket: (userId, ticketId) => {
    const list = readData();
    const idx = list.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    list[idx].supportTickets = list[idx].supportTickets.filter((t) => t.id !== ticketId);
    list[idx].updatedAt = new Date().toISOString();
    writeData(list);
    return list[idx];
  }
};

module.exports = ServiceUserService;
