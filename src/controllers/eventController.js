const multer = require('multer');
const path = require('path');
const {
  Event,
  EventEmailTemplate,
  VerifiedEmailTemplate,
  UserEvents,
  User,
  Question,
  UserAnswer,
} = require('../models/associations');
const { stringify } = require('csv-stringify');
const { Op } = require('sequelize');
function formatResponse(rows, count, page = 1, limit = null) {
  const perPage = limit || count;
  const totalPages = limit ? Math.max(1, Math.ceil(count / limit)) : 1;
  const currentPage = limit ? page : 1;

  return {
    totalItems: count,
    totalPages,
    currentPage,
    perPage,
    data: rows,
  };
}

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Images will be saved in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage: storage });

// 🔥 Helper to always format event with full image URL
const formatEventImage = (event) => {
  const baseUrl = 'https://rayabackend.onrender.com'; // Adjust for your deployment
  return {
    ...event.toJSON(),
    eventBannerImage: event.eventBannerImage
      ? `${baseUrl}${event.eventBannerImage}`
      : null,
  };
};

module.exports = {
  upload,

  createEvent: async (req, res) => {
    try {
      const { eventName, eventPage, apologizeContent, acceptedContent, eventEmailTemplate,
        verifiedEmailTemplate, invitationSubject, verifySubject, idImage } = req.body;

      let eventBannerImage = null;
      if (req.file) eventBannerImage = `/uploads/${req.file.filename}`;

      const event = await Event.create({
        eventName, eventPage, eventBannerImage, apologizeContent,
        acceptedContent, invitationSubject, verifySubject, idImage
      });

      if (eventEmailTemplate) {
        await EventEmailTemplate.create({
          EventId: event.id,
          eventEmailTemplate: eventEmailTemplate.eventEmailTemplate,
          designTemplate: eventEmailTemplate.designTemplate || null,
        });
      }
      if (verifiedEmailTemplate) {
        await VerifiedEmailTemplate.create({
          EventId: event.id,
          eventVerifiedEmailTemplate: verifiedEmailTemplate.eventVerifiedEmailTemplate,
          designTemplate: verifiedEmailTemplate.designTemplate || null,
        });
      }

      res.status(201).json(formatResponse([formatEventImage(event)], 1, 1, 1));
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: error.message });
    }
  },

  getAllEvents: async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = req.query.limit === 'all' ? null : Math.max(parseInt(req.query.limit) || 10, 1);
      const offset = limit ? (page - 1) * limit : null;

      const { count, rows: events } = await Event.findAndCountAll({
        limit: limit || undefined,
        offset: offset || undefined,
        order: [['createdAt', 'DESC']],
        include: [{ model: EventEmailTemplate }, { model: VerifiedEmailTemplate }],
      });

      const eventsWithFullImageUrl = events.map(formatEventImage);
      res.status(200).json(formatResponse(eventsWithFullImageUrl, count, page, limit));
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getEventById: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await Event.findByPk(id, {
        include: [
          { model: EventEmailTemplate },
          { model: VerifiedEmailTemplate },
          { model: Question, as: 'questions' },
        ],
      });
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(200).json(formatResponse([formatEventImage(event)], 1, 1, 1));
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  searchEventsByName: async (req, res) => {
    try {
      const { name } = req.query;
      if (!name) {
        return res.status(400).json({ message: 'Event name query parameter is required' });
      }

      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = req.query.limit === 'all' ? null : Math.max(parseInt(req.query.limit) || 10, 1);
      const offset = limit ? (page - 1) * limit : null;

      const { count, rows: events } = await Event.findAndCountAll({
        where: { eventName: { [Op.like]: `%${name}%` } },
        limit: limit || undefined,
        offset: offset || undefined,
        order: [['createdAt', 'DESC']],
        include: [{ model: EventEmailTemplate }, { model: VerifiedEmailTemplate }],
      });

      const eventsWithFullImageUrl = events.map(formatEventImage);
      res.status(200).json(formatResponse(eventsWithFullImageUrl, count, page, limit));
    } catch (error) {
      console.error('Error searching events by name:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  editEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        eventName,
        eventPage,
        eventBannerImage,
        eventEmailTemplate,
        verifiedEmailTemplate,
        invitationSubject,
        verifySubject,
        idImage,
      } = req.body;

      const event = await Event.findByPk(id, {
        include: [
          { model: EventEmailTemplate },
          { model: VerifiedEmailTemplate },
          { model: Question, as: 'questions' },
        ],
      });

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      event.eventName = eventName || event.eventName;
      event.eventPage = eventPage || event.eventPage;

      // Handle image update
      if (req.file) {
        event.eventBannerImage = `/uploads/${req.file.filename}`;
      } else if (eventBannerImage === null || eventBannerImage === '') {
        event.eventBannerImage = null; // explicit removal
      }
      // else keep old image

      event.invitationSubject = invitationSubject || event.invitationSubject;
      event.verifySubject = verifySubject || event.verifySubject;
      event.idImage = idImage || event.idImage;

      await event.save();

      if (eventEmailTemplate) {
        await EventEmailTemplate.upsert(
          {
            EventId: event.id,
            eventEmailTemplate: eventEmailTemplate.eventEmailTemplate,
            designTemplate: eventEmailTemplate.designTemplate || null,
          },
          { where: { EventId: event.id } }
        );
      }

      if (verifiedEmailTemplate) {
        await VerifiedEmailTemplate.upsert(
          {
            EventId: event.id,
            eventVerifiedEmailTemplate: verifiedEmailTemplate.eventVerifiedEmailTemplate,
            designTemplate: verifiedEmailTemplate.designTemplate || null,
          },
          { where: { EventId: event.id } }
        );
      }

      res.status(200).json(formatEventImage(event));
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map((err) => err.message);
        return res.status(400).json({ message: 'Validation error', errors });
      }
      console.error('Error updating event:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      await UserEvents.destroy({ where: { eventId: id } });
      await event.destroy();
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  

  exportEventData: async (req, res) => {
    try {
      const { id } = req.params;

      const event = await Event.findByPk(id, {
        include: [
          {
            model: UserEvents,
            as: 'eventUserEvents',
            include: [
              {
                model: User,
                include: [
                  {
                    model: UserAnswer,
                    where: { EventId: id },
                    required: false,
                  },
                ],
              },
            ],
          },
          { model: Question, as: 'questions' },
        ],
      });

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const records = [];
      records.push(['Event Name', event.eventName]);
      records.push(['Event Page', event.eventPage]);
      records.push(['Apologize Content', event.apologizeContent]);
      records.push(['Accepted Content', event.acceptedContent]);
      records.push([]);

      const questionHeaders = event.questions.map((q) => q.question);
      const headers = [
        'User ID',
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Invitation Status',
        'Accepted',
        ...questionHeaders,
      ];
      records.push(headers);

      event.eventUserEvents.forEach((userEvent) => {
        const answerMap = {};
        userEvent.User.UserAnswers?.forEach((answer) => {
          answerMap[answer.QuestionId] = answer.answer;
        });
        const answers = event.questions.map((q) => answerMap[q.id] || '');

        records.push([
          userEvent.User.id,
          userEvent.User.firstName,
          userEvent.User.lastName,
          userEvent.User.email,
          userEvent.User.phone,
          userEvent.emailStatus == 1 ? 'Invited' : 'Not Invited',
          userEvent.acceptedInvitationStatus == 1 ? 'Accepted' : 'Not Accepted',
          ...answers,
        ]);
      });

      stringify(records, (err, output) => {
        if (err) {
          console.error('Error stringifying CSV:', err);
          return res.status(500).json({ message: 'Error generating CSV' });
        }
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="event_${event.eventName}_data.csv"`
        );
        res.status(200).send(output);
      });
    } catch (error) {
      console.error('Error exporting event data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};
