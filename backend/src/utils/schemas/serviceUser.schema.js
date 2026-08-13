const { z } = require('zod');
const { requiredString, optionalString, email, optionalPhone } = require('./common.schema');

/**
 * ServiceUserService (services/serviceUser.service.js) merges update payloads
 * directly onto the stored record with an object spread — `{...record,
 * ...updates}` — so an unvalidated PATCH could overwrite ANY field,
 * including `id`, `createdAt`, or the `bookings`/`payments`/`supportTickets`
 * arrays themselves. Every update schema below is `.strict()` specifically
 * so that mass-assignment is rejected at the door: only the fields listed
 * here can ever reach that spread.
 */

const SERVICE_USER_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
const SERVICE_USER_TIERS = ['SILVER', 'GOLD', 'PLATINUM'];
const BOOKING_STATUSES = ['CONFIRMED', 'COMPLETED', 'CANCELLED'];
const BOOKING_PAYMENT_STATUSES = ['UNPAID', 'PAID', 'PENDING'];
const PAYMENT_STATUSES = ['PAID', 'PENDING', 'FAILED', 'REFUNDED'];
const PAYMENT_METHODS = ['CREDIT_CARD', 'UPI', 'BANK_TRANSFER', 'PAYPAL'];
const TICKET_CATEGORIES = ['GENERAL', 'BOOKING', 'BILLING', 'TECH', 'HEALTH_PLAN'];
const TICKET_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

const money = () => z.coerce.number().finite().min(0).max(100_000_000);

// ─── Service User ───────────────────────────────────────────────────────────

const createServiceUserSchema = z.object({
  name: requiredString(200),
  email: email(),
  phone: optionalPhone(),
  status: z.enum(SERVICE_USER_STATUSES).optional(),
  tier: z.enum(SERVICE_USER_TIERS).optional(),
  notes: optionalString(5000),
}).strict();

const updateServiceUserSchema = z.object({
  name: requiredString(200).optional(),
  email: email().optional(),
  phone: optionalPhone(),
  status: z.enum(SERVICE_USER_STATUSES).optional(),
  tier: z.enum(SERVICE_USER_TIERS).optional(),
  notes: optionalString(5000),
}).strict();

// ─── Bookings ────────────────────────────────────────────────────────────────

const createBookingSchema = z.object({
  serviceName: requiredString(200),
  providerName: requiredString(200),
  bookingDate: z.string().trim().min(1).refine((v) => !Number.isNaN(Date.parse(v)), 'bookingDate must be a valid date.'),
  status: z.enum(BOOKING_STATUSES).optional(),
  amount: money().optional(),
  paymentStatus: z.enum(BOOKING_PAYMENT_STATUSES).optional(),
}).strict();

const updateBookingSchema = z.object({
  serviceName: requiredString(200).optional(),
  providerName: requiredString(200).optional(),
  bookingDate: z.string().trim().min(1).refine((v) => !Number.isNaN(Date.parse(v)), 'bookingDate must be a valid date.').optional(),
  status: z.enum(BOOKING_STATUSES).optional(),
  amount: money().optional(),
  paymentStatus: z.enum(BOOKING_PAYMENT_STATUSES).optional(),
}).strict();

// ─── Payments ────────────────────────────────────────────────────────────────

const createPaymentSchema = z.object({
  amount: money(),
  status: z.enum(PAYMENT_STATUSES).optional(),
  method: z.enum(PAYMENT_METHODS).optional(),
  transactionId: optionalString(200),
  description: optionalString(1000),
  billingDate: z.string().trim().min(1).refine((v) => !Number.isNaN(Date.parse(v)), 'billingDate must be a valid date.').optional(),
}).strict();

const updatePaymentSchema = z.object({
  amount: money().optional(),
  status: z.enum(PAYMENT_STATUSES).optional(),
  method: z.enum(PAYMENT_METHODS).optional(),
  transactionId: optionalString(200),
  description: optionalString(1000),
  billingDate: z.string().trim().min(1).refine((v) => !Number.isNaN(Date.parse(v)), 'billingDate must be a valid date.').optional(),
}).strict();

// ─── Support Tickets (service-user-scoped) ───────────────────────────────────

const createSupportTicketSchema = z.object({
  title: requiredString(300),
  description: optionalString(5000),
  category: z.enum(TICKET_CATEGORIES).optional(),
  severity: z.enum(TICKET_SEVERITIES).optional(),
  status: z.enum(TICKET_STATUSES).optional(),
}).strict();

const updateSupportTicketSchema = z.object({
  title: requiredString(300).optional(),
  description: optionalString(5000),
  category: z.enum(TICKET_CATEGORIES).optional(),
  severity: z.enum(TICKET_SEVERITIES).optional(),
  status: z.enum(TICKET_STATUSES).optional(),
}).strict();

module.exports = {
  createServiceUserSchema,
  updateServiceUserSchema,
  createBookingSchema,
  updateBookingSchema,
  createPaymentSchema,
  updatePaymentSchema,
  createSupportTicketSchema,
  updateSupportTicketSchema,
};
