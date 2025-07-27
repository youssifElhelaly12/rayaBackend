const express = require('express');
const router = express.Router();
const { sendBulkEmails, sendSingleEmail } = require('../controllers/emailController');

router.post('/bulk', sendBulkEmails);
router.post('/:userId', sendSingleEmail);

module.exports = router;