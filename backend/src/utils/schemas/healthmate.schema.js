const { z } = require('zod');
const { requiredString, optionalString, optionalEmail, optionalPhone, optionalIsoDate, boundedInt } = require('./common.schema');

const HEALTHMATE_TYPES = [
  'PRACTITIONER',
  'CENTRE',
  'ORGANIZER',
  'COMMUNITY_GROUP',
  'PROGRAM_ORGANIZER',
  'RETREAT_CENTRE',
  'WELLNESS_CENTRE',
];
const PHASES = ['PRE_QUALIFY', 'PREPARE', 'REGISTER', 'REVIEW', 'LIVE'];
const PROGRAM_STATUSES = ['PENDING', 'APPROVED', 'CORRECTION_REQUIRED'];
const REGISTRATION_STATUSES = ['PENDING', 'VERIFIED', 'ESCALATED'];

const score = () => boundedInt(0, 5).optional();

const createHealthmateSchema = z.object({
  name: requiredString(200),
  type: z.enum(HEALTHMATE_TYPES),
  category: requiredString(100),
  contactName: optionalString(200),
  contactEmail: optionalEmail(),
  contactPhone: optionalPhone(),
  alternatePhone: optionalPhone(),
  website: optionalString(300),
  address: optionalString(2000),
  city: optionalString(100),
  state: optionalString(100),
  country: optionalString(100),
  nearestAirport: optionalString(200),
  yearsOfExperience: optionalString(50),
  professionalBio: optionalString(5000),
  subcategory: optionalString(100),
  platformFound: optionalString(200),
  programPossibility: optionalString(200),
  format: optionalString(100),
  priceRange: optionalString(100),
  capacity: optionalString(100),
}).strict();

// PUT /:id — same required shape as create, plus the internal notes field.
const replaceHealthmateSchema = createHealthmateSchema.extend({
  notes: optionalString(10000),
});

const updateHealthmateSchema = z.object({
  name: requiredString(200).optional(),
  category: requiredString(100).optional(),
  contactName: optionalString(200),
  contactEmail: optionalEmail(),
  contactPhone: optionalPhone(),
  alternatePhone: optionalPhone(),
  website: optionalString(300),
  address: optionalString(2000),
  city: optionalString(100),
  state: optionalString(100),
  country: optionalString(100),
  nearestAirport: optionalString(200),
  yearsOfExperience: optionalString(50),
  professionalBio: optionalString(5000),
  opsUserId: z.string().trim().uuid().optional(),
  screeningRemarks: optionalString(5000),
  screeningQueries: optionalString(5000),
  recallReminder: optionalIsoDate('recallReminder'),
  programTitle: optionalString(300),
  programStartDate: optionalIsoDate('programStartDate'),
  programEndDate: optionalIsoDate('programEndDate'),
  programStatus: z.enum(PROGRAM_STATUSES).optional(),
  programApprovedMsg: optionalString(2000),
  registrationStatus: z.enum(REGISTRATION_STATUSES).optional(),
  registrationRemark: optionalString(2000),
}).strict();

const updateHealthmatePhaseSchema = z.object({
  phase: z.enum(PHASES),
}).strict();

const updateNotesSchema = z.object({
  notes: z.string().max(10000, 'Notes must be at most 10000 characters.'),
}).strict();

const updateHealthmateQualificationSchema = z.object({
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
}).strict();

const rndVerifyCredentialsSchema = z.object({
  healthmateId: z.string().trim().uuid().optional(),
  id: z.string().trim().uuid().optional(),
  remark: optionalString(2000),
  registrationRemark: optionalString(2000),
}).strict().refine((v) => v.healthmateId || v.id, {
  message: 'healthmateId is required.',
  path: ['healthmateId'],
});

module.exports = {
  createHealthmateSchema,
  replaceHealthmateSchema,
  updateHealthmateSchema,
  updateHealthmatePhaseSchema,
  updateNotesSchema,
  updateHealthmateQualificationSchema,
  rndVerifyCredentialsSchema,
};
