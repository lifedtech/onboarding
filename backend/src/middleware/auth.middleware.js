const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Expects a Bearer token in the Authorization header:
 *   Authorization: Bearer <token>
 */
const authenticate = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers['authorization'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    const isChatStream = req.path === '/chat/stream' || (req.originalUrl && req.originalUrl.split('?')[0] === '/api/chat/stream');
    if (isChatStream) {
      token = req.query.token;
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Cross-check tokenVersion for instant revocation
    const prisma = require('../lib/prisma');
    
    const user = await prisma.opsUser.findUnique({
      where: { id: decoded.id },
      select: { tokenVersion: true }
    });
    
    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ message: 'Session expired or invalidated. Please log in again.' });
    }

    req.user = decoded;

    // Track active user presence in background
    try {
      const { updatePresence } = require('../services/presence.service');
      updatePresence(decoded.id);
    } catch (err) {
      // Degrade presence tracking gracefully if imports fail
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token has expired.' });
    }
    return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
  }
};

/**
 * requireAdmin Middleware
 * Verifies that the authenticated user holds an 'ADMIN' role (case-insensitive).
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: Authentication required.' });
  }

  const role = req.user.role?.toUpperCase();
  if (role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }

  next();
};

module.exports = {
  authenticate,
  requireAdmin,
};
