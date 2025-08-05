const express = require('express');
const router = express.Router();
const { sendBulkEmails, sendSingleEmail } = require('../controllers/emailController');

router.post('/bulk', sendBulkEmails);
router.post('/:userId/:eventId', sendSingleEmail);

module.exports = router;