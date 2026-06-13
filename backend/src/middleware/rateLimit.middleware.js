const rateLimit = require('express-rate-limit');

/**
 * Rate limiter middleware for authentication routes (login / register).
 * Restricts an IP address to 20 requests per 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  skip: (req) => {
    const email = req.body?.email;
    if (email && typeof email === 'string' && email.trim().toLowerCase() === 'admin@lifed.com') {
      return true; // Bypass rate limit for admin login
    }
    return false;
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = {
  authLimiter,
};
