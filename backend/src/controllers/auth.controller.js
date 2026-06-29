const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '8h';

/**
 * POST /api/auth/register
 * Creates a new OpsUser. In production this should be admin-gated.
 */
const register = async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'email, password, and name are required.' });
  }

  try {
    const existing = await prisma.opsUser.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.opsUser.create({
      data: {
        email,
        passwordHash,
        name,
        role: role || 'ops',
      },
      // Never return the hash to the client
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return res.status(201).json({ message: 'User created successfully.', user });
  } catch (error) {
    console.error('[register]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/auth/login
 * Verifies credentials and returns a signed JWT.
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required.' });
  }

  try {
    const user = await prisma.opsUser.findUnique({ where: { email } });

    // Use a constant-time comparison path to avoid user enumeration
    if (!user) {
      await bcrypt.compare(password, '$2b$12$invalidhashpadding000000000000000000000000000000000000');
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Single active session enforcement: check if the user is already online
    const { isUserOnline } = require('../services/presence.service');
    if (isUserOnline(user.id)) {
      return res.status(403).json({
        message: 'This account is already logged in on another device. Concurrent logins are not permitted.'
      });
    }

    const payload = { id: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    return res.status(200).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, accessScopes: user.accessScopes, tokenVersion: user.tokenVersion },
    });
  } catch (error) {
    console.error('[login]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/auth/logout
 * Clears active user's presence.
 */
const logout = async (req, res) => {
  try {
    const { removePresence } = require('../services/presence.service');
    removePresence(req.user.id);
    
    // Instantly invalidate the current JWT and all other active sessions for this user
    await prisma.opsUser.update({
      where: { id: req.user.id },
      data: { tokenVersion: { increment: 1 } },
    });
    
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('[logout]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = { register, login, logout };
