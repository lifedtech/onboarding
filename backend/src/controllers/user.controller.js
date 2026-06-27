const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { isUserOnline } = require('../services/presence.service');

const SALT_ROUNDS = 12;

/**
 * GET /api/users
 * Fetches all OpsUsers, excluding their password hashes.
 */
const getTeamMembers = async (req, res) => {
  try {
    const users = await prisma.opsUser.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        publicKey: true,
        avatar: true,
        statusMode: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    
    // Inject active presence status
    const usersWithPresence = users.map(user => ({
      ...user,
      isOnline: isUserOnline(user.id)
    }));

    return res.status(200).json(usersWithPresence);
  } catch (error) {
    console.error('[getTeamMembers]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/users
 * Creates a new OpsUser with a hashed password.
 */
const createTeamMember = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password, and role are required.' });
  }

  try {
    const existing = await prisma.opsUser.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Standardize role to lowercase for database consistency (e.g. 'admin', 'ops', 'marketing')
    const normalizedRole = role.toLowerCase() === 'admin' ? 'admin' : role.toLowerCase() === 'marketing' ? 'marketing' : 'ops';
    const finalScopes = Array.isArray(req.body.accessScopes) ? req.body.accessScopes : [];

    const user = await prisma.opsUser.create({
      data: {
        name,
        email,
        passwordHash,
        role: normalizedRole,
        accessScopes: finalScopes,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accessScopes: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ message: 'Team member created successfully.', user });
  } catch (error) {
    console.error('[createTeamMember]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * DELETE /api/users/:id
 * Removes a team member. Enforces self-deletion guards and automatically reassigns 
 * any active onboarding partners to the executing administrator.
 */
const deleteTeamMember = async (req, res) => {
  const { id } = req.params;

  if (req.user.id === id) {
    return res.status(400).json({ message: 'Conflict: You cannot delete your own administrative account.' });
  }

  try {
    const userToDelete = await prisma.opsUser.findUnique({ where: { id } });
    if (!userToDelete) {
      return res.status(404).json({ message: 'Team member not found.' });
    }

    // Reassign associated onboarding partners to the deleting administrator
    await prisma.healthmate.updateMany({
      where: { opsUserId: id },
      data: { opsUserId: req.user.id },
    });

    await prisma.opsUser.delete({ where: { id } });

    return res.status(200).json({ message: 'Team member removed successfully.' });
  } catch (error) {
    console.error('[deleteTeamMember]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/users/heartbeat
 * Updates active user's presence.
 */
const heartbeat = async (req, res) => {
  try {
    const { updatePresence } = require('../services/presence.service');
    updatePresence(req.user.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[heartbeat]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * PUT /api/users/public-key
 * Registers/updates a user's E2EE public key.
 */
const updatePublicKey = async (req, res) => {
  const { publicKey } = req.body;
  if (!publicKey) {
    return res.status(400).json({ message: 'Public key is required.' });
  }
  try {
    await prisma.opsUser.update({
      where: { id: req.user.id },
      data: { publicKey },
    });
    return res.status(200).json({ success: true, message: 'Public key registered successfully.' });
  } catch (error) {
    console.error('[updatePublicKey]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * GET /api/users/me
 * Returns the current user's own profile.
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.opsUser.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, accessScopes: true, avatar: true, statusMode: true, createdAt: true },
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error('[getMe]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * PATCH /api/users/me
 * Updates the current user's name and/or statusMode.
 */
const updateProfile = async (req, res) => {
  const { name, statusMode } = req.body;
  const allowed = ['online', 'busy', 'dnd', 'offline'];
  if (statusMode && !allowed.includes(statusMode)) {
    return res.status(400).json({ message: 'Invalid statusMode.' });
  }
  try {
    const data = {};
    if (name?.trim()) data.name = name.trim();
    if (statusMode) data.statusMode = statusMode;
    const user = await prisma.opsUser.update({
      where: { id: req.user.id },
      data,
      select: { id: true, email: true, name: true, role: true, avatar: true, statusMode: true },
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error('[updateProfile]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

/**
 * POST /api/users/me/avatar
 * Uploads and sets the current user's profile picture.
 */
const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  const avatarUrl = `/uploads/${req.file.filename}`;
  try {
    const user = await prisma.opsUser.update({
      where: { id: req.user.id },
      data: { avatar: avatarUrl },
      select: { id: true, email: true, name: true, role: true, avatar: true, statusMode: true },
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error('[uploadAvatar]', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  getTeamMembers,
  createTeamMember,
  deleteTeamMember,
  heartbeat,
  updatePublicKey,
  getMe,
  updateProfile,
  uploadAvatar,
};
