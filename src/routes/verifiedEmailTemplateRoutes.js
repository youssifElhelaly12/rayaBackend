const express = require('express');
const router = express.Router();
const verifiedEmailTemplateController = require('../controllers/verifiedEmailTemplateController');

// Create a new verified email template
router.post('/', verifiedEmailTemplateController.createVerifiedEmailTemplate);

// Get all verified email templates
router.get('/', verifiedEmailTemplateController.getAllVerifiedEmailTemplates);

// Get a single verified email template by ID
router.get('/:id', verifiedEmailTemplateController.getVerifiedEmailTemplateById);

// Update a verified email template by ID
router.put('/:id', verifiedEmailTemplateController.updateVerifiedEmailTemplate);

// Delete a verified email template by ID
router.delete('/:id', verifiedEmailTemplateController.deleteVerifiedEmailTemplate);

module.exports = router;