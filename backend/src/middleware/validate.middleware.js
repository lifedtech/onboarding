const { ZodError } = require('zod');

/**
 * Builds an Express middleware that validates `req[target]` against a Zod
 * schema and rejects the request (400) if it doesn't match — unknown fields,
 * wrong types, and out-of-range values all fail closed rather than being
 * silently stripped or coerced. On success, `req[target]` is replaced with
 * the parsed value so downstream code sees clean, typed data.
 *
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'params' | 'query'} [target]
 */
const validateTarget = (schema, target) => (req, res, next) => {
  try {
    const parsed = schema.parse(req[target]);
    if (target === 'query') {
      // Express 5's req.query is a getter with no setter — assigning to it
      // silently no-ops instead of throwing (non-strict-mode semantics), so
      // the coerced/defaulted value is exposed separately instead.
      req.validatedQuery = parsed;
    } else {
      req[target] = parsed;
    }
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

/** Validates req.body (default, matches prior behavior). */
const validate = (schema) => validateTarget(schema, 'body');

/** Validates req.params (route placeholders like :id). */
const validateParams = (schema) => validateTarget(schema, 'params');

/** Validates req.query (querystring). */
const validateQuery = (schema) => validateTarget(schema, 'query');

module.exports = {
  validate,
  validateParams,
  validateQuery,
};
