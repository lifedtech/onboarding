const { z } = require('zod');

/**
 * Zod schema for validating OpsUser registration inputs.
 */
const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .min(1, 'Email is required.')
    .email('Invalid email address format.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters long.'),
  name: z
    .string({ required_error: 'Name is required.' })
    .min(1, 'Name is required.')
    .max(100, 'Name cannot exceed 100 characters.'),
  role: z.enum(['admin', 'ops', 'support']).optional(),
});

/**
 * Zod schema for validating user login inputs.
 */
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .min(1, 'Email is required.')
    .email('Invalid email address format.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.'),
});

module.exports = {
  registerSchema,
  loginSchema,
};
