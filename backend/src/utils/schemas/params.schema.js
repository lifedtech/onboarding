const { z } = require('zod');
const { uuid, shortId } = require('./common.schema');

// Reusable :param validators, split by which id scheme the underlying
// resource uses (Prisma/Postgres uuid() vs. the JSON-file-backed
// service-user store's short `prefix-number` ids).

const idParamSchema = z.object({ id: uuid('id') }).strict();
const taskIdParamSchema = z.object({ taskId: uuid('taskId') }).strict();
const conversationIdParamSchema = z.object({ conversationId: uuid('conversationId') }).strict();

const serviceUserIdParamSchema = z.object({ id: shortId('su', 'id') }).strict();

const serviceUserBookingParamSchema = z.object({
  id: shortId('su', 'id'),
  bookingId: shortId('b', 'bookingId'),
}).strict();

const serviceUserPaymentParamSchema = z.object({
  id: shortId('su', 'id'),
  paymentId: shortId('p', 'paymentId'),
}).strict();

const serviceUserTicketParamSchema = z.object({
  id: shortId('su', 'id'),
  ticketId: shortId('t', 'ticketId'),
}).strict();

module.exports = {
  idParamSchema,
  taskIdParamSchema,
  conversationIdParamSchema,
  serviceUserIdParamSchema,
  serviceUserBookingParamSchema,
  serviceUserPaymentParamSchema,
  serviceUserTicketParamSchema,
};
