const { z } = require('zod');
const { requiredString, email } = require('./common.schema');

// Accepted case-insensitively; the controller folds these down to the
// three roles actually stored ('admin' | 'marketing' | 'ops').
const ROLE_INPUTS = ['admin', 'ops', 'ops_agent', 'marketing', 'support'];
const role = () =>
  z.string().trim().min(1).max(50).transform((v) => v.toLowerCase())
    .refine((v) => ROLE_INPUTS.includes(v), { message: `role must be one of: ${ROLE_INPUTS.join(', ')}.` });

const ACCESS_SCOPES = ['FULL_ACCESS', 'HEALTHMATES', 'SERVICE_USERS', 'SALES_MARKETING'];
const accessScopes = () => z.array(z.enum(ACCESS_SCOPES)).max(ACCESS_SCOPES.length).optional();

const password = () =>
  z.string().min(8, 'Password must be at least 8 characters long.').max(200);

const createTeamMemberSchema = z.object({
  name: requiredString(100),
  email: email(),
  password: password(),
  role: role(),
  accessScopes: accessScopes(),
}).strict();

const updateTeamMemberSchema = z.object({
  name: requiredString(100).optional(),
  email: email().optional(),
  password: password().optional(),
  role: role().optional(),
  accessScopes: accessScopes(),
}).strict();

const updateProfileSchema = z.object({
  name: requiredString(100).optional(),
  statusMode: z.enum(['online', 'busy', 'dnd', 'offline']).optional(),
}).strict();

const updatePublicKeySchema = z.object({
  publicKey: z.string().trim().min(1, 'Public key is required.').max(20000, 'Public key is too long.'),
}).strict();

module.exports = {
  createTeamMemberSchema,
  updateTeamMemberSchema,
  updateProfileSchema,
  updatePublicKeySchema,
};
