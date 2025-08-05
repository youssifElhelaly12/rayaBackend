const { EventEmailTemplate, Event } = require('../models/associations');


// Create a new EventEmailTemplate
/**
 * @swagger
 * /api/eventEmailTemplates:
 *   post:
 *     summary: Create a new event email template
 *     tags:
 *       - Event Email Templates
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - EventId
 *               - eventEmailTemplate
 *             properties:
 *               EventId:
 *                 type: integer
 *                 description: The ID of the event this template belongs to.
 *               eventEmailTemplate:
 *                 type: string
 *                 description: The HTML content of the email template.
 *     responses:
 *       201:
 *         description: Successfully created a new event email template.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventEmailTemplate'
 *       409:
 *         description: An email template already exists for this event.
 *       500:
 *         description: Internal server error.
 */
exports.createEventEmailTemplate = async (req, res) => {
  try {
    const { EventId, eventEmailTemplate } = req.body;

    if (!EventId || typeof EventId !== 'number') {
      return res.status(400).json({ message: 'EventId is required and must be a number.' });
    }

    // Check if the EventId corresponds to an existing Event
    const eventExists = await Event.findByPk(EventId);
    if (!eventExists) {
      return res.status(404).json({ message: 'Event not found for the given EventId.' });
    }

    // Check if an EventEmailTemplate already exists for the given EventId
    const existingTemplate = await EventEmailTemplate.findOne({ where: { EventId } });

    if (existingTemplate) {
      return res.status(409).json({ message: 'An email template already exists for this event.' });
    }

    const newTemplate = await EventEmailTemplate.create({ EventId, eventEmailTemplate });
    return res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Error creating event email template:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all EventEmailTemplates
/**
 * @swagger
 * /api/eventEmailTemplates:
 *   get:
 *     summary: Retrieve a list of all event email templates
 *     tags:
 *       - Event Email Templates
 *     responses:
 *       200:
 *         description: A list of event email templates.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EventEmailTemplate'
 *       500:
 *         description: Internal server error.
 */
exports.getAllEventEmailTemplates = async (req, res) => {
  try {
    const templates = await EventEmailTemplate.findAll({
      include: [{
        model: Event,
        attributes: ['id', 'eventName']
      }]
    });
    return res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching event email templates:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get a single EventEmailTemplate by ID
/**
 * @swagger
 * /api/eventEmailTemplates/{id}:
 *   get:
 *     summary: Retrieve a single event email template by ID
 *     tags:
 *       - Event Email Templates
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the event email template to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single event email template.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventEmailTemplate'
 *       404:
 *         description: Event email template not found.
 *       500:
 *         description: Internal server error.
 */
exports.getEventEmailTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await EventEmailTemplate.findByPk(id, {
      include: [{
        model: Event,
        attributes: ['id', 'eventName']
      }]
    });
    if (!template) {
      return res.status(404).json({ message: 'Event email template not found.' });
    }
    return res.status(200).json(template);
  } catch (error) {
    console.error('Error fetching event email template by ID:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * @swagger
 * /api/eventEmailTemplates/{id}:
 *   put:
 *     summary: Update an existing event email template
 *     tags:
 *       - Event Email Templates
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the event email template to update.
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
 *               eventEmailTemplate:
 *                 type: string
 *                 description: The HTML content of the email template.
 *     responses:
 *       200:
 *         description: Event email template updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventEmailTemplate'
 *       404:
 *         description: Event email template not found.
 *       409:
 *         description: An email template already exists for this event.
 *       500:
 *         description: Internal server error.
 */
exports.updateEventEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { EventId, eventEmailTemplate } = req.body;

    const template = await EventEmailTemplate.findByPk(id);
    if (!template) {
      return res.status(404).json({ message: 'Event email template not found.' });
    }

    // If EventId is provided, check for conflicts with other templates
    if (EventId && EventId !== template.EventId) {
      const existingTemplate = await EventEmailTemplate.findOne({ where: { EventId } });
      if (existingTemplate) {
        return res.status(409).json({ message: 'An email template already exists for this event.' });
      }
    }

    await template.update({ EventId, eventEmailTemplate });
    return res.status(200).json(template);
  } catch (error) {
    console.error('Error updating event email template:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

/**
 * @swagger
 * /api/eventEmailTemplates/{id}:
 *   delete:
 *     summary: Delete an event email template by ID
 *     tags:
 *       - Event Email Templates
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the event email template to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Event email template deleted successfully.
 *       404:
 *         description: Event email template not found.
 *       500:
 *         description: Internal server error.
 */
exports.deleteEventEmailTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await EventEmailTemplate.destroy({
      where: { id }
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Event email template not found.' });
    }
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting event email template:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};