const express = require('express');
const { default: sendBulkEmails } = require('../controllers/emailController');
const router = express.Router();

router.post('/send-emails', sendBulkEmails);

module.exports = router;