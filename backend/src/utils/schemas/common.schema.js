const { z } = require('zod');

/**
 * Shared primitives for building strict Zod schemas across the API.
 *
 * Every mutating route is expected to validate its body/params/query against
 * a `.strict()` object schema — unknown fields are REJECTED (400), not
 * silently stripped, and out-of-range/mistyped values are REJECTED, not
 * coerced to a default. See middleware/validate.middleware.js.
 */

// A Prisma-generated primary key (all first-party models use uuid()).
const uuid = (label = 'id') => z.string().trim().uuid(`${label} must be a valid UUID.`);

// JSON-file-backed resources (service users, bookings, payments, support
// tickets — see services/serviceUser.service.js) use a short `prefix-number`
// id scheme instead of a UUID, e.g. "su-1234".
const shortId = (prefix, label = 'id') =>
  z.string().trim().regex(new RegExp(`^${prefix}-[0-9]{1,12}$`), `${label} is not a valid id.`);

const requiredString = (max, min = 1) =>
  z.string().trim().min(min, `Must be at least ${min} character(s).`).max(max, `Must be at most ${max} characters.`);

// Optional free-text field; empty string is treated the same as "not provided".
const optionalString = (max) =>
  z.string().trim().max(max, `Must be at most ${max} characters.`).optional().nullable();

const email = () => z.string().trim().min(1).max(254).email('Must be a valid email address.');
const optionalEmail = () => email().optional().nullable();

// Permissive but bounded phone format — digits, spaces, +, -, ()
const phone = () =>
  z.string().trim().min(6, 'Phone number is too short.').max(20, 'Phone number is too long.')
    .regex(/^[0-9+\-()\s]+$/, 'Phone number contains invalid characters.');
const optionalPhone = () => phone().optional().nullable();

const isoDate = (label = 'date') =>
  z.string().trim().min(1).refine((v) => !Number.isNaN(Date.parse(v)), `${label} must be a valid date.`);
const optionalIsoDate = (label) => isoDate(label).optional().nullable();

const boundedInt = (min, max) => z.coerce.number().int().min(min).max(max);

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).max(1_000_000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(100),
}).strict();

module.exports = {
  uuid,
  shortId,
  requiredString,
  optionalString,
  email,
  optionalEmail,
  phone,
  optionalPhone,
  isoDate,
  optionalIsoDate,
  boundedInt,
  paginationQuery,
};
