const { z } = require('zod');
const { optionalEmail, optionalPhone, optionalString } = require('./common.schema');

const MESSAGE_TYPES = ['EMAIL', 'WHATSAPP'];

// `payload` carries optional per-send overrides — kept narrow and strict so
// a caller can't smuggle arbitrary fields through to the outbound provider.
const payloadSchema = z.object({
  to: optionalEmail(),
  subject: optionalString(300),
  body: optionalString(20000),
  phone: optionalPhone(),
  template: optionalString(200),
  variables: z.array(z.union([z.string().max(2000), z.number(), z.boolean()])).max(50).optional(),
}).strict();

const triggerMessageSchema = z.object({
  // Accepted case-insensitively downstream; validated as one of the two known types here.
  type: z.string().trim().refine((v) => MESSAGE_TYPES.includes(v.toUpperCase()), {
    message: `type must be one of: ${MESSAGE_TYPES.join(', ')}.`,
  }),
  payload: payloadSchema.optional(),
}).strict();

module.exports = { triggerMessageSchema };
