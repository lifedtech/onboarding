const { z } = require('zod');

const participantSchema = z.object({
  userId: z.string().trim().uuid(),
  // Symmetric group/session key, encrypted client-side for this participant.
  encryptedKey: z.string().max(20000).optional(),
}).strict();

const createConversationSchema = z.object({
  type: z.enum(['DIRECT', 'GROUP']),
  name: z.string().trim().max(200).optional(),
  participants: z.array(participantSchema).min(1, 'At least one participant is required.').max(500),
}).strict();

const sendMessageSchema = z.object({
  // End-to-end-encrypted ciphertext blob — opaque to the server.
  encryptedText: z.string().min(1, 'Encrypted message text is required.').max(50000),
}).strict();

module.exports = { createConversationSchema, sendMessageSchema };
