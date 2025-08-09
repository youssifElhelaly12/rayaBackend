const express = require('express');
const router = express.Router();
const { sendBulkEmails, sendSingleEmail, sendBulkEmailForUsers } = require('../controllers/emailController');

router.post('/bulk', sendBulkEmails);
router.post('/:userId/:eventId', sendSingleEmail);
router.post('/bulk-for-users', sendBulkEmailForUsers);


module.exports = router;