const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, validateParams } = require('../middleware/validate.middleware');
const { createTicketSchema, updateTicketSchema } = require('../utils/schemas/support.schema');
const { idParamSchema } = require('../utils/schemas/params.schema');

router.use(authenticate);

router.post('/tickets', validate(createTicketSchema), supportController.createTicket);
router.get('/tickets', supportController.getTickets);
router.patch('/tickets/:id', validateParams(idParamSchema), validate(updateTicketSchema), supportController.updateTicket);
router.delete('/tickets/:id', validateParams(idParamSchema), supportController.deleteTicket);

module.exports = router;
