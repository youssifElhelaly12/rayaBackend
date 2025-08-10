const { VerifiedEmailTemplate, Event } = require('../models/associations');

// Create a new VerifiedEmailTemplate
/**
 * @swagger
 * /api/verifiedEmailTemplates:
 *   post:
 *     summary: Create a new verified email template
 *     tags:
 *       - Verified Email Templates
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - EventId
 *               - eventVerifiedEmailTemplate
 *             properties:
 *               EventId:
 *                 type: integer
 *                 description: The ID of the event this template belongs to.
 *               eventVerifiedEmailTemplate:
 *                 type: string
 *                 description: The HTML content of the email template.
 *     responses:
 *       201:
 *         description: Successfully created a new verified email template.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifiedEmailTemplate'
 *       409:
 *         description: An email template already exists for this user.
 *       500:
 *         description: Internal server error.
 */
exports.createVerifiedEmailTemplate = async (req, res) => {
  try {
    const { EventId, eventVerifiedEmailTemplate, designTemplate } = req.body;

    if (!EventId || typeof EventId !== 'number') {
      return res.status(400).json({ message: 'EventId is required and must be a number.' });
    }

    // Check if the EventId corresponds to an existing Event
    const eventExists = await Event.findByPk(EventId);
    if (!eventExists) {
      return res.status(404).json({ message: 'Event not found for the given EventId.' });
    }

    // Check if a VerifiedEmailTemplate already exists for the given EventId
    const existingTemplate = await VerifiedEmailTemplate.findOne({ where: { EventId } });

    if (existingTemplate) {
      return res.status(409).json({ message: 'An email template already exists for this event.' });
    }

    const newTemplate = await VerifiedEmailTemplate.create({ EventId, eventVerifiedEmailTemplate, designTemplate });
    return res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Error creating verified email template:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all VerifiedEmailTemplates
/**
 * @swagger
 * /api/verifiedEmailTemplates:
 *   get:
 *     summary: Retrieve a list of all verified email templates
 *     tags:
 *       - Verified Email Templates
 *     responses:
 *       200:
 *         description: A list of verified email templates.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VerifiedEmailTemplate'
 *       500:
 *         description: Internal server error.
 */
exports.getAllVerifiedEmailTemplates = async (req, res) => {
  try {
    const templates = await VerifiedEmailTemplate.findAll({
      include: [{
        model: Event,
        attributes: ['id', 'eventName']
      }]
    });
    return res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching verified email templates:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get a single VerifiedEmailTemplate by ID
/**
 * @swagger
 * /api/verifiedEmailTemplates/{id}:
 *   get:
 *     summary: Retrieve a single verified email template by ID
 *     tags:
 *       - Verified Email Templates
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the verified email template to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single verified email template.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifiedEmailTemplate'
 *       404:
 *         description: Verified email template not found.
 *       500:
 *         description: Internal server error.
 */
exports.getVerifiedEmailTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await VerifiedEmailTemplate.findByPk(id, {
      include: [{
        model: Event,
        attributes: ['id', 'eventName']
      }]
    });
    if (!template) {
      return res.status(404).json({ message: 'Verified email template not found.' });
    }
    return res.status(200).json(template);
  } catch (error) {
    console.error('Error fetching verified email template by ID:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * @swagger
 * /api/verifiedEmailTemplates/{id}:
 *   put:
 *     summary: Update an existing verified email template
 *     tags:
 *       - Verified Email Templates
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the verified email template to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               EventId:
 *                 type: integer
 *                 description: The ID of the event this template belongs to.
 *               eventVerifiedEmailTemplate:
 *                 type: string
 *                 description: The HTML content of the email template.
 *     responses:
 *       200:
 *         description: Verified email template updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifiedEmailTemplate'
 *       404:
 *         description: Verified email template not found.
 *       409:
 *         description: An email template already exists for this user.
 *       500:
 *         description: Internal server error.
 */
exports.updateVerifiedEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { EventId, eventVerifiedEmailTemplate, designTemplate } = req.body;

    const template = await VerifiedEmailTemplate.findByPk(id);
    if (!template) {
      return res.status(404).json({ message: 'Verified email template not found.' });
    }

    // Check if the EventId corresponds to an existing Event, if EventId is provided for update
    if (EventId) {
      const eventExists = await Event.findByPk(EventId);
      if (!eventExists) {
        return res.status(404).json({ message: 'Event not found for the given EventId.' });
      }
      // If EventId is being changed, check for existing template for the new EventId
      if (EventId !== template.EventId) {
        const existingTemplate = await VerifiedEmailTemplate.findOne({ where: { EventId } });
        if (existingTemplate) {
          return res.status(409).json({ message: 'An email template already exists for this event.' });
        }
      }
    }

    await template.update({ EventId, eventVerifiedEmailTemplate, designTemplate });
    return res.status(200).json(template);
  } catch (error) {
    console.error('Error updating verified email template:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * @swagger
 * /api/verifiedEmailTemplates/{id}:
 *   delete:
 *     summary: Delete a verified email template by ID
 *     tags:
 *       - Verified Email Templates
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the verified email template to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Verified email template deleted successfully.
 *       404:
 *         description: Verified email template not found.
 *       500:
 *         description: Internal server error.
 */
exports.deleteVerifiedEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await VerifiedEmailTemplate.findByPk(id);
    if (!template) {
      return res.status(404).json({ message: 'Verified email template not found.' });
    }
    await template.destroy();
    return res.status(204).send(); // No content to send back
  } catch (error) {
    console.error('Error deleting verified email template:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};