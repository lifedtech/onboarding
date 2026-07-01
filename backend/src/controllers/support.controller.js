const prisma = require('../lib/prisma');
const { broadcastToAll } = require('./chat.controller');

// Create a new support ticket
const createTicket = async (req, res) => {
  try {
    const { title, description, type, priority, healthmateId, serviceUserEmail, assignedToId } = req.body;

    const ticketData = {
      title,
      description,
      type,
      priority: priority || 'MEDIUM',
      raisedByOpsId: req.user.id,
    };

    if (type === 'HEALTHMATE' && healthmateId) {
      ticketData.healthmateId = healthmateId;
    }
    
    if (type === 'SERVICE_USER' && serviceUserEmail) {
      ticketData.serviceUserEmail = serviceUserEmail;
    }

    if (assignedToId) {
      ticketData.assignedToId = assignedToId;
    } else if (type === 'HEALTHMATE' && healthmateId) {
      // Auto-assign to the healthmate's ops user
      const healthmate = await prisma.healthmate.findUnique({ where: { id: healthmateId } });
      if (healthmate) {
        ticketData.assignedToId = healthmate.opsUserId;
      }
    }

    const ticket = await prisma.ticket.create({
      data: ticketData,
      include: {
        raisedByOps: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        healthmate: { select: { id: true, name: true } }
      }
    });

    // Broadcast real-time ticket creation event
    broadcastToAll('ticket_created', ticket);

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Failed to create ticket', error: error.message });
  }
};

// Get tickets based on user role and scope
const getTickets = async (req, res) => {
  try {
    const isSuperAdmin = req.user.email === 'admin@lifed.com' || req.user.role === 'SUPER_ADMIN';
    const isAdmin = isSuperAdmin || req.user.role?.toLowerCase() === 'admin';

    // Build the query where clause
    let where = {};
    
    if (isSuperAdmin) {
      // Super admin sees all tickets
      where = {};
    } else if (isAdmin) {
      // Regular admin sees Healthmate & Service User tickets, and System tickets they raised/assigned
      where = {
        OR: [
          { type: 'HEALTHMATE' },
          { type: 'SERVICE_USER' },
          { raisedByOpsId: req.user.id },
          { assignedToId: req.user.id }
        ]
      };
    } else {
      // Ops sees tickets they raised or are assigned to
      where = {
        OR: [
          { raisedByOpsId: req.user.id },
          { assignedToId: req.user.id }
        ]
      };
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        raisedByOps: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        healthmate: { select: { id: true, name: true } }
      }
    });

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Failed to fetch tickets' });
  }
};

// Update ticket status or assignment
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedToId } = req.body;

    const data = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (assignedToId !== undefined) data.assignedToId = assignedToId;

    const ticket = await prisma.ticket.update({
      where: { id },
      data,
      include: {
        raisedByOps: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        healthmate: { select: { id: true, name: true } }
      }
    });

    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Failed to update ticket' });
  }
};

// Delete ticket
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    
    const isSuperAdmin = req.user.email === 'admin@lifed.com' || req.user.role === 'SUPER_ADMIN';
    if (!isSuperAdmin) {
      return res.status(403).json({ message: 'Only Super Admins can delete tickets' });
    }

    await prisma.ticket.delete({
      where: { id }
    });

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Failed to delete ticket' });
  }
};

module.exports = {
  createTicket,
  getTickets,
  updateTicket,
  deleteTicket
};
