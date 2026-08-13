const { z } = require('zod');
const { uuid, optionalString, optionalIsoDate } = require('./common.schema');

const registrationSubmittedSchema = z.object({
  healthmateId: uuid('healthmateId'),
}).strict();

const verificationCompletedSchema = z.object({
  healthmateId: uuid('healthmateId'),
  remark: optionalString(2000),
}).strict();

const programSubmittedSchema = z.object({
  healthmateId: uuid('healthmateId'),
  programTitle: optionalString(300),
  programStartDate: optionalIsoDate('programStartDate'),
  programEndDate: optionalIsoDate('programEndDate'),
}).strict();

const PROGRAM_STATUSES = ['PENDING', 'APPROVED', 'CORRECTION_REQUIRED'];

const programStatusSchema = z.object({
  healthmateId: uuid('healthmateId'),
  status: z.string().trim().refine((v) => PROGRAM_STATUSES.includes(v.toUpperCase()), {
    message: `status must be one of: ${PROGRAM_STATUSES.join(', ')}.`,
  }),
  approvedMessage: optionalString(2000),
}).strict();

module.exports = {
  registrationSubmittedSchema,
  verificationCompletedSchema,
  programSubmittedSchema,
  programStatusSchema,
};
