const { Router } = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

const { login, logout }                          = require('../controllers/auth.controller');
const { authLimiter, globalLimiter, strictLimiter, webhookLimiter } = require('../middleware/rateLimit.middleware');
const { validate }                                 = require('../middleware/validate.middleware');
const { loginSchema }              = require('../utils/auth.schema');
const {
  getAllHealthmates, createHealthmate,
  updateHealthmate, updateHealthmatePhase,
  updateNotes, deleteHealthmate, updateHealthmateDetails,
  uploadRegistrationDocument, deleteRegistrationDocument,
  rndVerifyCredentials
} = require('../controllers/healthmate.controller');
const { toggleTask, createTask, getPendingTasks, updateTask }                   = require('../controllers/task.controller');
const { triggerMessage }                           = require('../controllers/message.controller');
const { getDashboardSummary, getAdminSummary } = require('../controllers/analytics.controller');
const { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, heartbeat, updatePublicKey, getMe, updateProfile, uploadAvatar } = require('../controllers/user.controller');
const { stream, getConversations, createConversation, sendMessage } = require('../controllers/chat.controller');
const { invitePlayer, acceptInvite, rejectInvite, cancelGame, syncGame } = require('../controllers/game.controller');
const {
  getAllEnquiries, createEnquiry,
  updateEnquiry, deleteEnquiry, promoteToPartner, promoteToServiceUser
} = require('../controllers/enquiry.controller');

const {
  getAllServiceUsers, getServiceUserById,
  createServiceUser, updateServiceUser, deleteServiceUser,
  createBooking, updateBooking, deleteBooking,
  createPayment, updatePayment, deletePayment,
  createSupportTicket, updateSupportTicket, deleteSupportTicket
} = require('../controllers/serviceUser.controller');


const verifyRdSignature = require('../middleware/verifyRdSignature');
const {
  handleRegistrationSubmission,
  handleVerificationCompletion,
  handleProgramSubmission,
  handleProgramStatus
} = require('../controllers/webhook.controller');

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.post('/auth/login',    authLimiter, validate(loginSchema), login);

// Webhooks (Signature Protected)
router.post('/webhooks/registration-submitted', webhookLimiter, verifyRdSignature, handleRegistrationSubmission);
router.post('/webhooks/verification-completed', webhookLimiter, verifyRdSignature, handleVerificationCompletion);
router.post('/webhooks/program-submitted',      webhookLimiter, verifyRdSignature, handleProgramSubmission);
router.post('/webhooks/program-status',         webhookLimiter, verifyRdSignature, handleProgramStatus);

router.use(authenticate);
router.use(globalLimiter);

router.post('/rnd/verify-credentials', rndVerifyCredentials);

// Enquiries
router.get('/enquiries',                  getAllEnquiries);
router.post('/enquiries',                 createEnquiry);
router.patch('/enquiries/:id',            updateEnquiry);
router.delete('/enquiries/:id',           deleteEnquiry);
router.post('/enquiries/:id/promote',     promoteToPartner);
router.post('/enquiries/:id/promote-user', promoteToServiceUser);

// Service Users
router.get('/service-users',                              getAllServiceUsers);
router.post('/service-users',                             createServiceUser);
router.get('/service-users/:id',                          getServiceUserById);
router.patch('/service-users/:id',                        updateServiceUser);
router.delete('/service-users/:id',                       deleteServiceUser);

// Service User Bookings
router.post('/service-users/:id/bookings',                createBooking);
router.patch('/service-users/:id/bookings/:bookingId',    updateBooking);
router.delete('/service-users/:id/bookings/:bookingId',   deleteBooking);

// Service User Payments
router.post('/service-users/:id/payments',                createPayment);
router.patch('/service-users/:id/payments/:paymentId',    updatePayment);
router.delete('/service-users/:id/payments/:paymentId',   deletePayment);

// Service User Support Tickets
router.post('/service-users/:id/support',                 createSupportTicket);
router.patch('/service-users/:id/support/:ticketId',      updateSupportTicket);
router.delete('/service-users/:id/support/:ticketId',     deleteSupportTicket);


// Auth logout
router.post('/auth/logout', logout);

// Analytics
router.get('/analytics/summary',            getDashboardSummary);
router.get('/analytics/admin-summary',      getAdminSummary);

// Healthmates
router.get('/healthmates',                  getAllHealthmates);
router.post('/healthmates',                 createHealthmate);
router.post('/healthmates/:id/upload',      strictLimiter, upload.single('document'), uploadRegistrationDocument);
router.delete('/healthmates/:id/upload',    deleteRegistrationDocument);
router.put('/healthmates/:id',              updateHealthmateDetails);
router.patch('/healthmates/:id',            updateHealthmate);
router.patch('/healthmates/:id/phase',      updateHealthmatePhase);
router.patch('/healthmates/:id/notes',      updateNotes);
router.delete('/healthmates/:id',           deleteHealthmate);

// Tasks
router.post('/healthmates/:id/tasks',       createTask);
router.patch('/tasks/:taskId/toggle',       toggleTask);
router.patch('/tasks/:taskId',              updateTask);
router.get('/tasks/pending',                getPendingTasks);

const { requestTakeover, getPendingTakeovers, decideTakeover } = require('../controllers/takeover.controller');

// Messaging
router.post('/healthmates/:id/messages',    strictLimiter, triggerMessage);

// Takeover Requests
router.post('/takeover/request',            requestTakeover);
router.get('/takeover/pending',             getPendingTakeovers);
router.post('/takeover/decision',           decideTakeover);

// Team Settings (Admin Access Gated)
router.post('/users/heartbeat',             heartbeat);
router.get('/users/me',                     getMe);
router.patch('/users/me',                   updateProfile);
router.post('/users/me/avatar',             strictLimiter, upload.single('avatar'), uploadAvatar);
router.get('/users',                        getTeamMembers);
router.post('/users',                       requireAdmin, createTeamMember);
router.patch('/users/:id',                  requireAdmin, updateTeamMember);
router.delete('/users/:id',                 requireAdmin, deleteTeamMember);
router.put('/users/public-key',             updatePublicKey);

// Secure Chat
router.get('/chat/stream',                  stream);
router.get('/chat/conversations',           getConversations);
router.post('/chat/conversations',          createConversation);
router.post('/chat/conversations/:conversationId/messages', sendMessage);

// Multiplayer Game
router.post('/game/invite',                 invitePlayer);
router.post('/game/accept',                 acceptInvite);
router.post('/game/reject',                 rejectInvite);
router.post('/game/cancel',                 cancelGame);
router.post('/game/sync',                   syncGame);

module.exports = router;
