const { z } = require('zod');

const GAME_TYPES = ['deflector', 'tug_of_war'];
const SYNC_TYPES = ['ball_and_paddle', 'paddle', 'gameover', 'pull', 'state'];

const gameId = () => z.string().trim().min(1).max(64);
const userId = () => z.string().trim().uuid();
const coord = () => z.number().finite().min(-100000).max(100000);

const invitePlayerSchema = z.object({
  guestId: userId(),
  gameType: z.enum(GAME_TYPES).optional(),
}).strict();

const acceptInviteSchema = z.object({
  gameId: gameId(),
}).strict();

const rejectInviteSchema = z.object({
  gameId: gameId(),
}).strict();

const cancelGameSchema = z.object({
  gameId: gameId(),
}).strict();

// The Stress Buster mini-games poll this endpoint at up to ~25/s per client
// with different fields depending on `type`; every field any variant sends
// is listed here (all optional) so the strict schema doesn't reject a
// legitimate frame, while still rejecting wrong types / oversized payloads.
const ballSchema = z.object({
  x: coord(),
  y: coord(),
  vx: coord().optional(),
  vy: coord().optional(),
  speed: coord().optional(),
}).strict();

const syncGameSchema = z.object({
  gameId: gameId(),
  type: z.enum(SYNC_TYPES).optional(),
  paddleY: coord().optional(),
  ball: ballSchema.optional(),
  playerScore: z.number().finite().min(0).max(1_000_000).optional(),
  systemScore: z.number().finite().min(0).max(1_000_000).optional(),
  winnerMessage: z.string().max(200).optional(),
  health: z.number().finite().min(-1000).max(1000).optional(),
  timeLeft: z.number().finite().min(-1000).max(100_000).optional(),
  isPlaying: z.boolean().optional(),
  isGameOver: z.boolean().optional(),
  gameResult: z.string().max(30).optional(),
}).strict();

module.exports = {
  invitePlayerSchema,
  acceptInviteSchema,
  rejectInviteSchema,
  cancelGameSchema,
  syncGameSchema,
};
