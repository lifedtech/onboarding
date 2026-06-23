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
  const now = new Date();
  const d = (daysOffset) => new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000).toISOString();

  return [
    {
      id: 'su-1',
      name: 'Emily Thompson',
      email: 'emily.t@gmail.com',
      phone: '+61 488 123 456',
      status: 'ACTIVE',
      tier: 'VIP',
      notes: 'Needs special attention to physical therapy slot coordination. Prefers evening sessions.',
      createdAt: d(-30),
      updatedAt: d(-30),
      bookings: [
        {
          id: 'b-101',
          serviceName: 'Yoga Therapy Session',
          providerName: 'Harmony Wellbeing Centre',
          bookingDate: d(2),
          status: 'CONFIRMED',
          amount: 150.0,
          paymentStatus: 'PAID',
          createdAt: d(-3)
        },
        {
          id: 'b-102',
          serviceName: 'Physiotherapy Consult',
          providerName: 'Dr. Sarah Jenkins',
          bookingDate: d(-5),
          status: 'COMPLETED',
          amount: 120.0,
          paymentStatus: 'PAID',
          createdAt: d(-7)
        }
      ],
      payments: [
        {
          id: 'p-201',
          amount: 150.0,
          status: 'PAID',
          method: 'CREDIT_CARD',
          transactionId: 'txn_98124801',
          description: 'Payment for Yoga Therapy booking b-101',
          billingDate: d(-3),
          createdAt: d(-3)
        },
        {
          id: 'p-202',
          amount: 120.0,
          status: 'PAID',
          method: 'UPI',
          transactionId: 'txn_87123910',
          description: 'Physiotherapy Consult fee',
          billingDate: d(-7),
          createdAt: d(-7)
        }
      ],
      supportTickets: [
        {
          id: 't-301',
          title: 'Vite dev server didn\'t load active slot',
          description: 'Unable to view upcoming sessions on the client portal. Received an blank white page screen.',
          category: 'TECH',
          severity: 'MEDIUM',
          status: 'RESOLVED',
          createdAt: d(-4),
          updatedAt: d(-3)
        }
      ]
    },
    {
      id: 'su-2',
      name: 'Jacob Miller',
      email: 'jacob.m@outlook.com',
      phone: '+61 499 765 432',
      status: 'ACTIVE',
      tier: 'PREMIUM',
      notes: 'Prefers online consultations over in-person if available.',
      createdAt: d(-20),
      updatedAt: d(-20),
      bookings: [
        {
          id: 'b-103',
          serviceName: 'Ayurveda Consultation',
          providerName: 'Dr. Amit Patel',
          bookingDate: d(3),
          status: 'CONFIRMED',
          amount: 100.0,
          paymentStatus: 'PENDING',
          createdAt: d(-1)
        }
      ],
      payments: [
        {
          id: 'p-203',
          amount: 100.0,
          status: 'PENDING',
          method: 'BANK_TRANSFER',
          transactionId: 'txn_90219481',
          description: 'Invoice #2026-9021',
          billingDate: d(-1),
          createdAt: d(-1)
        }
      ],
      supportTickets: [
        {
          id: 't-302',
          title: 'Bank transfer pending verification',
          description: 'Transferred funds via net banking but status is still marked as pending in the portal.',
          category: 'BILLING',
          severity: 'LOW',
          status: 'OPEN',
          createdAt: d(-1),
          updatedAt: d(-1)
        }
      ]
    },
    {
      id: 'su-3',
      name: 'Sophia Martinez',
      email: 'sophia.m@yahoo.com',
      phone: '+61 411 987 654',
      status: 'ACTIVE',
      tier: 'BASIC',
      notes: 'Just getting started with the mindfulness framework.',
      createdAt: d(-15),
      updatedAt: d(-15),
      bookings: [
        {
          id: 'b-104',
          serviceName: 'Mindfulness Session',
          providerName: 'Holistic Retreats Organizer',
          bookingDate: d(-4),
          status: 'COMPLETED',
          amount: 80.0,
          paymentStatus: 'PAID',
          createdAt: d(-5)
        }
      ],
      payments: [
        {
          id: 'p-204',
          amount: 80.0,
          status: 'PAID',
          method: 'CREDIT_CARD',
          transactionId: 'txn_71829402',
          description: 'Introductory mindfulness class fee',
          billingDate: d(-5),
          createdAt: d(-5)
        }
      ],
      supportTickets: []
    },
    {
      id: 'su-4',
      name: 'William Davies',
      email: 'william.d@gmail.com',
      phone: '+61 422 345 678',
      status: 'INACTIVE',
      tier: 'BASIC',
      notes: 'On hold due to travel plans. Will resume in winter.',
      createdAt: d(-45),
      updatedAt: d(-45),
      bookings: [],
      payments: [],
      supportTickets: []
    },
    {
      id: 'su-5',
      name: 'Chloe Wilson',
      email: 'chloe.w@outlook.com',
      phone: '+61 433 456 789',
      status: 'SUSPENDED',
      tier: 'VIP',
      notes: 'Account suspended due to billing dispute. Awaiting bank review.',
      createdAt: d(-60),
      updatedAt: d(-60),
      bookings: [
        {
          id: 'b-105',
          serviceName: 'Sports Rehabilitation',
          providerName: 'Elite Sports Rehabilitation',
          bookingDate: d(-11),
          status: 'CANCELLED',
          amount: 200.0,
          paymentStatus: 'FAILED',
          createdAt: d(-14)
        }
      ],
      payments: [
        {
          id: 'p-205',
          amount: 200.0,
          status: 'FAILED',
          method: 'CREDIT_CARD',
          transactionId: 'txn_12948192',
          description: 'Sports Rehab booking b-105',
          billingDate: d(-14),
          createdAt: d(-14)
        }
      ],
      supportTickets: [
        {
          id: 't-303',
          title: 'Charged twice for cancelled sports rehab session',
          description: 'I cancelled the session on time, but my credit card statement shows two holds of $200 each.',
          category: 'BILLING',
          severity: 'HIGH',
          status: 'IN_PROGRESS',
          createdAt: d(-12),
          updatedAt: d(-11)
        }
      ]
    }
  ];
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
      tier: userData.tier || 'BASIC',
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
