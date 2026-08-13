const { Router } = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { uploadDocument: uploadDocumentMiddleware, uploadAvatar: uploadAvatarMiddleware } = require('../middleware/upload');

const { login, logout }                          = require('../controllers/auth.controller');
const { authLimiter, globalLimiter, strictLimiter, webhookLimiter } = require('../middleware/rateLimit.middleware');
const { validate, validateParams, validateQuery } = require('../middleware/validate.middleware');
const { loginSchema }              = require('../utils/auth.schema');
const { paginationQuery }          = require('../utils/schemas/common.schema');
const {
  idParamSchema, taskIdParamSchema, conversationIdParamSchema,
  serviceUserIdParamSchema, serviceUserBookingParamSchema,
  serviceUserPaymentParamSchema, serviceUserTicketParamSchema,
} = require('../utils/schemas/params.schema');
const {
  createHealthmateSchema, replaceHealthmateSchema, updateHealthmateSchema,
  updateHealthmatePhaseSchema, updateNotesSchema, updateHealthmateQualificationSchema,
  rndVerifyCredentialsSchema,
} = require('../utils/schemas/healthmate.schema');
const { toggleTaskSchema, createTaskSchema, updateTaskSchema } = require('../utils/schemas/task.schema');
const { triggerMessageSchema } = require('../utils/schemas/message.schema');
const {
  createTeamMemberSchema, updateTeamMemberSchema, updateProfileSchema, updatePublicKeySchema,
} = require('../utils/schemas/user.schema');
const { createConversationSchema, sendMessageSchema } = require('../utils/schemas/chat.schema');
const {
  invitePlayerSchema, acceptInviteSchema, rejectInviteSchema, cancelGameSchema, syncGameSchema,
} = require('../utils/schemas/game.schema');
const {
  createEnquirySchema, updateEnquirySchema, promoteToPartnerSchema, promoteToServiceUserSchema,
} = require('../utils/schemas/enquiry.schema');
const {
  createServiceUserSchema, updateServiceUserSchema,
  createBookingSchema, updateBookingSchema,
  createPaymentSchema, updatePaymentSchema,
  createSupportTicketSchema, updateSupportTicketSchema,
} = require('../utils/schemas/serviceUser.schema');
const {
  registrationSubmittedSchema, verificationCompletedSchema, programSubmittedSchema, programStatusSchema,
} = require('../utils/schemas/webhook.schema');
const { trafficPingSchema } = require('../utils/schemas/traffic.schema');
const { requestTakeoverSchema, decideTakeoverSchema } = require('../utils/schemas/takeover.schema');

const {
  getAllHealthmates, createHealthmate,
  updateHealthmate, updateHealthmatePhase,
  updateNotes, deleteHealthmate, updateHealthmateDetails, updateHealthmateQualification,
  uploadRegistrationDocument, deleteRegistrationDocument,
  rndVerifyCredentials
} = require('../controllers/healthmate.controller');
const { toggleTask, createTask, getPendingTasks, updateTask }                   = require('../controllers/task.controller');
const { triggerMessage }                           = require('../controllers/message.controller');
const { getDashboardSummary, getAdminSummary } = require('../controllers/analytics.controller');
const { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, heartbeat, updatePublicKey, getMe, updateProfile, uploadAvatar, getSessionLogs } = require('../controllers/user.controller');
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
const { handleRegistrationSubmission,
  handleVerificationCompletion,
  handleProgramSubmission,
  handleProgramStatus
} = require('../controllers/webhook.controller');
const { handleTrafficPing, getLiveTraffic } = require('../controllers/traffic.controller');

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.post('/auth/login',    authLimiter, validate(loginSchema), login);

// Webhooks
router.post('/webhooks/traffic/ping',           webhookLimiter, validate(trafficPingSchema), handleTrafficPing);
router.post('/webhooks/registration-submitted', webhookLimiter, verifyRdSignature, validate(registrationSubmittedSchema), handleRegistrationSubmission);
router.post('/webhooks/verification-completed', webhookLimiter, verifyRdSignature, validate(verificationCompletedSchema), handleVerificationCompletion);
router.post('/webhooks/program-submitted',      webhookLimiter, verifyRdSignature, validate(programSubmittedSchema), handleProgramSubmission);
router.post('/webhooks/program-status',         webhookLimiter, verifyRdSignature, validate(programStatusSchema), handleProgramStatus);

router.use(authenticate);
router.use(globalLimiter);

router.post('/rnd/verify-credentials', requireAdmin, validate(rndVerifyCredentialsSchema), rndVerifyCredentials);

// Enquiries
router.get('/enquiries',                  validateQuery(paginationQuery), getAllEnquiries);
router.post('/enquiries',                 validate(createEnquirySchema), createEnquiry);
router.patch('/enquiries/:id',            validateParams(idParamSchema), validate(updateEnquirySchema), updateEnquiry);
router.delete('/enquiries/:id',           validateParams(idParamSchema), deleteEnquiry);
router.post('/enquiries/:id/promote',     validateParams(idParamSchema), validate(promoteToPartnerSchema), promoteToPartner);
router.post('/enquiries/:id/promote-user', validateParams(idParamSchema), validate(promoteToServiceUserSchema), promoteToServiceUser);

// Service Users
router.get('/service-users',                              getAllServiceUsers);
router.post('/service-users',                             validate(createServiceUserSchema), createServiceUser);
router.get('/service-users/:id',                          validateParams(serviceUserIdParamSchema), getServiceUserById);
router.patch('/service-users/:id',                        validateParams(serviceUserIdParamSchema), validate(updateServiceUserSchema), updateServiceUser);
router.delete('/service-users/:id',                       validateParams(serviceUserIdParamSchema), deleteServiceUser);

// Service User Bookings
router.post('/service-users/:id/bookings',                validateParams(serviceUserIdParamSchema), validate(createBookingSchema), createBooking);
router.patch('/service-users/:id/bookings/:bookingId',    validateParams(serviceUserBookingParamSchema), validate(updateBookingSchema), updateBooking);
router.delete('/service-users/:id/bookings/:bookingId',   validateParams(serviceUserBookingParamSchema), deleteBooking);

// Service User Payments
router.post('/service-users/:id/payments',                validateParams(serviceUserIdParamSchema), validate(createPaymentSchema), createPayment);
router.patch('/service-users/:id/payments/:paymentId',    validateParams(serviceUserPaymentParamSchema), validate(updatePaymentSchema), updatePayment);
router.delete('/service-users/:id/payments/:paymentId',   validateParams(serviceUserPaymentParamSchema), deletePayment);

// Service User Support Tickets
router.post('/service-users/:id/support',                 validateParams(serviceUserIdParamSchema), validate(createSupportTicketSchema), createSupportTicket);
router.patch('/service-users/:id/support/:ticketId',      validateParams(serviceUserTicketParamSchema), validate(updateSupportTicketSchema), updateSupportTicket);
router.delete('/service-users/:id/support/:ticketId',     validateParams(serviceUserTicketParamSchema), deleteSupportTicket);


// Auth logout
router.post('/auth/logout', logout);

// Analytics
router.get('/analytics/summary',            getDashboardSummary);
router.get('/analytics/admin-summary',      requireAdmin, getAdminSummary);
router.get('/analytics/traffic',            getLiveTraffic);

// Healthmates
router.get('/healthmates',                  validateQuery(paginationQuery), getAllHealthmates);
router.post('/healthmates',                 validate(createHealthmateSchema), createHealthmate);
router.post('/healthmates/:id/upload',      strictLimiter, validateParams(idParamSchema), uploadDocumentMiddleware, uploadRegistrationDocument);
router.delete('/healthmates/:id/upload',    validateParams(idParamSchema), deleteRegistrationDocument);
router.put('/healthmates/:id',              validateParams(idParamSchema), validate(replaceHealthmateSchema), updateHealthmateDetails);
router.patch('/healthmates/:id/qualification', validateParams(idParamSchema), validate(updateHealthmateQualificationSchema), updateHealthmateQualification);
router.patch('/healthmates/:id',            validateParams(idParamSchema), validate(updateHealthmateSchema), updateHealthmate);
router.patch('/healthmates/:id/phase',      validateParams(idParamSchema), validate(updateHealthmatePhaseSchema), updateHealthmatePhase);
router.patch('/healthmates/:id/notes',      validateParams(idParamSchema), validate(updateNotesSchema), updateNotes);
router.delete('/healthmates/:id',           validateParams(idParamSchema), deleteHealthmate);

// Tasks
router.post('/healthmates/:id/tasks',       validateParams(idParamSchema), validate(createTaskSchema), createTask);
router.patch('/tasks/:taskId/toggle',       validateParams(taskIdParamSchema), validate(toggleTaskSchema), toggleTask);
router.patch('/tasks/:taskId',              validateParams(taskIdParamSchema), validate(updateTaskSchema), updateTask);
router.get('/tasks/pending',                getPendingTasks);

const { requestTakeover, getPendingTakeovers, decideTakeover } = require('../controllers/takeover.controller');

// Messaging
router.post('/healthmates/:id/messages',    strictLimiter, validateParams(idParamSchema), validate(triggerMessageSchema), triggerMessage);

// Takeover Requests
router.post('/takeover/request',            validate(requestTakeoverSchema), requestTakeover);
router.get('/takeover/pending',             getPendingTakeovers);
router.post('/takeover/decision',           validate(decideTakeoverSchema), decideTakeover);

// Team Settings (Admin Access Gated)
router.post('/users/heartbeat',             heartbeat);
router.get('/users/me',                     getMe);
router.patch('/users/me',                   validate(updateProfileSchema), updateProfile);
router.post('/users/me/avatar',             strictLimiter, uploadAvatarMiddleware, uploadAvatar);
router.get('/users',                        getTeamMembers);
router.get('/users/logs',                   requireAdmin, getSessionLogs);
router.post('/users',                       requireAdmin, validate(createTeamMemberSchema), createTeamMember);
router.patch('/users/:id',                  requireAdmin, validateParams(idParamSchema), validate(updateTeamMemberSchema), updateTeamMember);
router.delete('/users/:id',                 requireAdmin, validateParams(idParamSchema), deleteTeamMember);
router.put('/users/public-key',             validate(updatePublicKeySchema), updatePublicKey);

// Secure Chat
router.get('/chat/stream',                  stream);
router.get('/chat/conversations',           getConversations);
router.post('/chat/conversations',          validate(createConversationSchema), createConversation);
router.post('/chat/conversations/:conversationId/messages', validateParams(conversationIdParamSchema), validate(sendMessageSchema), sendMessage);

// Multiplayer Game
router.post('/game/invite',                 validate(invitePlayerSchema), invitePlayer);
router.post('/game/accept',                 validate(acceptInviteSchema), acceptInvite);
router.post('/game/reject',                 validate(rejectInviteSchema), rejectInvite);
router.post('/game/cancel',                 validate(cancelGameSchema), cancelGame);
router.post('/game/sync',                   validate(syncGameSchema), syncGame);

// Support System
router.use('/support', require('./support.routes'));

module.exports = router;
