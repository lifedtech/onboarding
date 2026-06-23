const ServiceUserService = require('../services/serviceUser.service');

// Users
const getAllServiceUsers = async (req, res) => {
  try {
    const list = ServiceUserService.getAll();
    return res.status(200).json(list);
  } catch (error) {
    console.error('[getAllServiceUsers]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const getServiceUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = ServiceUserService.getById(id);
    if (!user) {
      return res.status(404).json({ message: 'Service user not found.' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('[getServiceUserById]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const createServiceUser = async (req, res) => {
  const { name, email, phone, status, tier, notes } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }

  try {
    const newUser = ServiceUserService.create({ name, email, phone, status, tier, notes });
    return res.status(201).json(newUser);
  } catch (error) {
    console.error('[createServiceUser]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const updateServiceUser = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = ServiceUserService.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Service user not found.' });
    }
    return res.status(200).json(updated);
  } catch (error) {
    console.error('[updateServiceUser]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const deleteServiceUser = async (req, res) => {
  const { id } = req.params;
  try {
    const success = ServiceUserService.delete(id);
    if (!success) {
      return res.status(404).json({ message: 'Service user not found.' });
    }
    return res.status(204).send();
  } catch (error) {
    console.error('[deleteServiceUser]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Bookings
const createBooking = async (req, res) => {
  const { id } = req.params;
  const { serviceName, providerName, bookingDate, status, amount, paymentStatus } = req.body;

  if (!serviceName || !providerName || !bookingDate) {
    return res.status(400).json({ message: 'serviceName, providerName, and bookingDate are required.' });
  }

  try {
    const result = ServiceUserService.createBooking(id, {
      serviceName,
      providerName,
      bookingDate,
      status,
      amount,
      paymentStatus
    });

    if (!result) {
      return res.status(404).json({ message: 'Service user not found.' });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('[createBooking]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const updateBooking = async (req, res) => {
  const { id, bookingId } = req.params;
  try {
    const result = ServiceUserService.updateBooking(id, bookingId, req.body);
    if (!result) {
      return res.status(404).json({ message: 'Service user or booking not found.' });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('[updateBooking]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const deleteBooking = async (req, res) => {
  const { id, bookingId } = req.params;
  try {
    const result = ServiceUserService.deleteBooking(id, bookingId);
    if (!result) {
      return res.status(404).json({ message: 'Service user not found.' });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('[deleteBooking]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Payments
const createPayment = async (req, res) => {
  const { id } = req.params;
  const { amount, status, method, transactionId, description, billingDate } = req.body;

  if (amount === undefined) {
    return res.status(400).json({ message: 'amount is required.' });
  }

  try {
    const result = ServiceUserService.createPayment(id, {
      amount,
      status,
      method,
      transactionId,
      description,
      billingDate
    });

    if (!result) {
      return res.status(404).json({ message: 'Service user not found.' });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('[createPayment]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const updatePayment = async (req, res) => {
  const { id, paymentId } = req.params;
  try {
    const result = ServiceUserService.updatePayment(id, paymentId, req.body);
    if (!result) {
      return res.status(404).json({ message: 'Service user or payment not found.' });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('[updatePayment]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const deletePayment = async (req, res) => {
  const { id, paymentId } = req.params;
  try {
    const result = ServiceUserService.deletePayment(id, paymentId);
    if (!result) {
      return res.status(404).json({ message: 'Service user not found.' });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('[deletePayment]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Support Tickets
const createSupportTicket = async (req, res) => {
  const { id } = req.params;
  const { title, description, category, severity, status } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'title is required.' });
  }

  try {
    const result = ServiceUserService.createSupportTicket(id, {
      title,
      description,
      category,
      severity,
      status
    });

    if (!result) {
      return res.status(404).json({ message: 'Service user not found.' });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('[createSupportTicket]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const updateSupportTicket = async (req, res) => {
  const { id, ticketId } = req.params;
  try {
    const result = ServiceUserService.updateSupportTicket(id, ticketId, req.body);
    if (!result) {
      return res.status(404).json({ message: 'Service user or ticket not found.' });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('[updateSupportTicket]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

const deleteSupportTicket = async (req, res) => {
  const { id, ticketId } = req.params;
  try {
    const result = ServiceUserService.deleteSupportTicket(id, ticketId);
    if (!result) {
      return res.status(404).json({ message: 'Service user not found.' });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('[deleteSupportTicket]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  getAllServiceUsers,
  getServiceUserById,
  createServiceUser,
  updateServiceUser,
  deleteServiceUser,
  createBooking,
  updateBooking,
  deleteBooking,
  createPayment,
  updatePayment,
  deletePayment,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket
};
