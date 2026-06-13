const { ZodError } = require('zod');

/**
 * Express middleware to validate request body using a Zod schema.
 * @param {import('zod').ZodSchema} schema 
 */
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error.name === 'ZodError' || error instanceof ZodError) {
      const issues = error.issues || [];
      // Concatenate validation error messages to present a friendly text to the frontend
      const errorMsg = issues.map((err) => err.message).join(' ');
      return res.status(400).json({
        message: errorMsg || 'Validation failed.',
        errors: issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    return res.status(400).json({ message: 'Validation failed.' });
  }
};

module.exports = {
  validate,
};
