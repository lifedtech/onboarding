const { Router } = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

const { register, login }                          = require('../controllers/auth.controller');
const {
  getAllHealthmates, createHealthmate,
  updateHealthmate, updateHealthmatePhase,
  updateNotes, deleteHealthmate, updateHealthmateDetails,
  uploadRegistrationDocument, deleteRegistrationDocument,
  rndVerifyCredentials
} = require('../controllers/healthmate.controller');
const { toggleTask, createTask, getPendingTasks, updateTask }                   = require('../controllers/task.controller');
const { triggerMessage }                           = require('../controllers/message.controller');
const { getDashboardSummary }                      = require('../controllers/analytics.controller');
const { getTeamMembers, createTeamMember, deleteTeamMember, heartbeat }         = require('../controllers/user.controller');

const verifyRdSignature = require('../middleware/verifyRdSignature');
const {
  handleRegistrationSubmission,
  handleVerificationCompletion,
  handleProgramSubmission,
  handleProgramStatus
} = require('../controllers/webhook.controller');

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.post('/auth/register', register);
router.post('/auth/login',    login);
router.post('/rnd/verify-credentials', rndVerifyCredentials);

// Webhooks (Signature Protected)
router.post('/webhooks/registration-submitted', verifyRdSignature, handleRegistrationSubmission);
router.post('/webhooks/verification-completed', verifyRdSignature, handleVerificationCompletion);
router.post('/webhooks/program-submitted',      verifyRdSignature, handleProgramSubmission);
router.post('/webhooks/program-status',         verifyRdSignature, handleProgramStatus);

// ─── Protected ────────────────────────────────────────────────────────────────
router.use(authenticate);

// Analytics
router.get('/analytics/summary',            getDashboardSummary);

// Healthmates
router.get('/healthmates',                  getAllHealthmates);
router.post('/healthmates',                 createHealthmate);
router.post('/healthmates/:id/upload',      upload.single('document'), uploadRegistrationDocument);
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
router.post('/healthmates/:id/messages',    triggerMessage);

// Takeover Requests
router.post('/takeover/request',            requestTakeover);
router.get('/takeover/pending',             getPendingTakeovers);
router.post('/takeover/decision',           decideTakeover);

// Team Settings (Admin Access Gated)
router.post('/users/heartbeat',             heartbeat);
router.get('/users',                        getTeamMembers);
router.post('/users',                       requireAdmin, createTeamMember);
router.delete('/users/:id',                 requireAdmin, deleteTeamMember);

module.exports = router;
