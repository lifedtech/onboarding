const { z } = require('zod');
const { requiredString, optionalString, optionalEmail, optionalIsoDate, boundedInt } = require('./common.schema');

const CLIENT_TYPES = ['SERVICE_USER', 'HEALTH_PARTNER'];
const HEALTHMATE_TYPES = ['PRACTITIONER', 'CENTRE', 'ORGANIZER'];

const score = () => boundedInt(0, 5).optional();

// Shared scalar fields across create/update — kept separate so update can
// mark every one of them optional without repeating each definition twice.
const scoreFields = {
  scoreRelevance: score(),
  scoreSafety: score(),
  scoreExperience: score(),
  scoreCredibility: score(),
  scoreLocation: score(),
  scoreVisual: score(),
  scoreBooking: score(),
  scoreUniqueness: score(),
  scoreCorporate: score(),
  scoreRepeatability: score(),
};

const enquiryFields = {
  name: requiredString(200),
  email: optionalEmail(),
  contact: requiredString(50),
  alternateContact: optionalString(50),
  remarks: optionalString(5000),
  clientType: z.enum(CLIENT_TYPES),
  callbackLater: z.boolean().optional(),
  reminderDate: optionalIsoDate('reminderDate'),
  contacted: z.boolean().optional(),
  city: optionalString(100),
  state: optionalString(100),
  country: optionalString(100),
  subcategory: optionalString(100),
  platformFound: optionalString(200),
  programPossibility: optionalString(200),
  format: optionalString(100),
  priceRange: optionalString(100),
  capacity: optionalString(100),
  ...scoreFields,
};

const createEnquirySchema = z.object(enquiryFields).strict();

const updateEnquirySchema = z.object(
  Object.fromEntries(Object.entries(enquiryFields).map(([k, v]) => [k, v.optional()]))
).strict();

const promoteToPartnerSchema = z.object({
  category: optionalString(100),
  type: z.enum(HEALTHMATE_TYPES).optional(),
}).strict();

const promoteToServiceUserSchema = z.object({
  tier: z.enum(['SILVER', 'GOLD', 'PLATINUM']).optional(),
}).strict();

module.exports = {
  createEnquirySchema,
  updateEnquirySchema,
  promoteToPartnerSchema,
  promoteToServiceUserSchema,
};
