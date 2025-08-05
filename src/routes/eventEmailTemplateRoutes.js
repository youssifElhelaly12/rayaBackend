const express = require('express');
const router = express.Router();
const eventEmailTemplateController = require('../controllers/eventEmailTemplateController');

// Create a new event email template
router.post('/', eventEmailTemplateController.createEventEmailTemplate);

// Get all event email templates
router.get('/', eventEmailTemplateController.getAllEventEmailTemplates);

// Get a single event email template by ID
router.get('/:id', eventEmailTemplateController.getEventEmailTemplateById);

// Update an event email template by ID
router.put('/:id', eventEmailTemplateController.updateEventEmailTemplate);

// Delete an event email template by ID
router.delete('/:id', eventEmailTemplateController.deleteEventEmailTemplate);

module.exports = router;