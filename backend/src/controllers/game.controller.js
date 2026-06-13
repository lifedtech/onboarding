const { broadcastToParticipants } = require('./chat.controller');

const activeGames = new Map();

// Generate simple unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

/**
 * POST /api/game/invite
 * Invite a teammate to a multiplayer game session
 */
const invitePlayer = async (req, res) => {
  const { guestId, gameType } = req.body;
  const hostId = req.user.id;
  const hostName = req.user.name;

  if (!guestId) {
    return res.status(400).json({ message: 'Teammate guestId is required.' });
  }

  if (guestId === hostId) {
    return res.status(400).json({ message: 'You cannot invite yourself.' });
  }

  try {
    const gameId = generateId();
    const gameSession = {
      id: gameId,
      hostId,
      hostName,
      guestId,
      gameType: gameType || 'deflector',
      status: 'invited',
    };

    activeGames.set(gameId, gameSession);

    // Notify guest of the invite
    broadcastToParticipants([guestId], 'game_invite', {
      gameId,
      hostId,
      hostName,
      gameType: gameSession.gameType,
    });

    return res.status(200).json({ success: true, gameId });
  } catch (error) {
    console.error('[invitePlayer]', error);
    return res.status(500).json({ message: 'Internal server error inviting player.' });
  }
};

/**
 * POST /api/game/accept
 * Accept a multiplayer game invite
 */
const acceptInvite = async (req, res) => {
  const { gameId } = req.body;
  const guestId = req.user.id;
  const guestName = req.user.name;

  if (!gameId) {
    return res.status(400).json({ message: 'gameId is required.' });
  }

  const game = activeGames.get(gameId);
  if (!game) {
    return res.status(404).json({ message: 'Game invitation not found or expired.' });
  }

  if (game.guestId !== guestId) {
    return res.status(403).json({ message: 'You are not authorized to accept this invite.' });
  }

  try {
    game.status = 'active';
    activeGames.set(gameId, game);

    // Notify both players that game has started
    broadcastToParticipants([game.hostId, game.guestId], 'game_start', {
      gameId,
      hostId: game.hostId,
      hostName: game.hostName,
      guestId,
      guestName,
      gameType: game.gameType,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[acceptInvite]', error);
    return res.status(500).json({ message: 'Internal server error accepting invite.' });
  }
};

/**
 * POST /api/game/reject
 * Reject a game invitation
 */
const rejectInvite = async (req, res) => {
  const { gameId } = req.body;
  const guestId = req.user.id;

  if (!gameId) {
    return res.status(400).json({ message: 'gameId is required.' });
  }

  const game = activeGames.get(gameId);
  if (!game) {
    return res.status(404).json({ message: 'Game invitation not found.' });
  }

  try {
    // Notify host that invite was rejected
    broadcastToParticipants([game.hostId], 'game_rejected', { gameId });
    activeGames.delete(gameId);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[rejectInvite]', error);
    return res.status(500).json({ message: 'Internal server error rejecting invite.' });
  }
};

/**
 * POST /api/game/cancel
 * Cancel invitation or leave/abort active game
 */
const cancelGame = async (req, res) => {
  const { gameId } = req.body;
  const userId = req.user.id;

  if (!gameId) {
    return res.status(400).json({ message: 'gameId is required.' });
  }

  const game = activeGames.get(gameId);
  if (!game) {
    return res.status(200).json({ success: true }); // Already cleaned up
  }

  try {
    const targetUserId = game.hostId === userId ? game.guestId : game.hostId;
    broadcastToParticipants([targetUserId], 'game_canceled', { gameId });
    activeGames.delete(gameId);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[cancelGame]', error);
    return res.status(500).json({ message: 'Internal server error canceling game.' });
  }
};

/**
 * POST /api/game/sync
 * Sync paddle Y coordinate or ball coordinates in real-time
 */
const syncGame = async (req, res) => {
  const { gameId, type, paddleY, ball, playerScore, systemScore, winnerMessage } = req.body;
  const userId = req.user.id;

  const game = activeGames.get(gameId);
  if (!game) {
    return res.status(404).json({ message: 'Active game not found.' });
  }

  try {
    const targetUserId = game.hostId === userId ? game.guestId : game.hostId;
    broadcastToParticipants([targetUserId], 'game_sync', {
      type,
      paddleY,
      ball,
      playerScore,
      systemScore,
      winnerMessage,
      senderId: userId,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[syncGame]', error);
    return res.status(500).json({ message: 'Internal server error syncing game.' });
  }
};

module.exports = {
  invitePlayer,
  acceptInvite,
  rejectInvite,
  cancelGame,
  syncGame,
};
