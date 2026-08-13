const { z } = require('zod');
const { uuid } = require('./common.schema');

const requestTakeoverSchema = z.object({
  healthmateId: uuid('healthmateId'),
}).strict();

const decideTakeoverSchema = z.object({
  requestId: z.string().trim().regex(/^[A-Z0-9]{1,20}$/, 'requestId is not valid.'),
  decision: z.enum(['ACCEPTED', 'REJECTED']),
}).strict();

module.exports = { requestTakeoverSchema, decideTakeoverSchema };
