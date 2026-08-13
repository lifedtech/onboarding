const { z } = require('zod');
const { requiredString, optionalString, optionalEmail } = require('./common.schema');

const TICKET_TYPES = ['SYSTEM', 'HEALTHMATE', 'SERVICE_USER'];
const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const createTicketSchema = z.object({
  title: requiredString(300),
  description: optionalString(5000),
  type: z.enum(TICKET_TYPES),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  healthmateId: z.string().trim().uuid().optional(),
  serviceUserEmail: optionalEmail(),
  assignedToId: z.string().trim().uuid().optional(),
}).strict();

const updateTicketSchema = z.object({
  status: z.enum(TICKET_STATUSES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  assignedToId: z.string().trim().uuid().nullable().optional(),
  resolutionRemarks: optionalString(5000),
}).strict();

module.exports = { createTicketSchema, updateTicketSchema };
