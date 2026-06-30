const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/tickets', supportController.createTicket);
router.get('/tickets', supportController.getTickets);
router.patch('/tickets/:id', supportController.updateTicket);
router.delete('/tickets/:id', supportController.deleteTicket);

module.exports = router;
