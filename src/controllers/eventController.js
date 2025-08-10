const multer = require('multer');
const path = require('path');
const { Event, EventEmailTemplate, VerifiedEmailTemplate, UserEvents, User } = require('../models/associations');
const { stringify } = require('csv-stringify');

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

module.exports = {
  upload,
  createEvent: async (req, res) => {
    try {
        const { eventName, eventPage, apologizeContent, acceptedContent, eventEmailTemplate, verifiedEmailTemplate } = req.body;
        let eventBannerImage = null;
        if (req.file) {
            eventBannerImage = `/uploads/${req.file.filename}`;
        }

        const event = await Event.create({
            eventName,
            eventPage,
            eventBannerImage,
            apologizeContent,
            acceptedContent
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

        res.status(201).json(event);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(err => err.message);
            return res.status(400).json({ message: 'Validation error', errors });
        }
        res.status(500).json({ message: error.message });
    }
  },

  getAllEvents: async (req, res) => {
    try {
      const events = await Event.findAll({
        include: [
          { model: EventEmailTemplate },
          { model: VerifiedEmailTemplate }
        ]
      });
      const baseUrl = 'http://localhost:3000'; // Assuming your server runs on this base URL
      const eventsWithFullImageUrl = events.map(event => ({
        ...event.toJSON(),
        eventBannerImage: event.eventBannerImage ? `${baseUrl}${event.eventBannerImage}` : null
      }));
      res.status(200).json(eventsWithFullImageUrl);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  editEvent: async (req, res) => {
    try {
      const { id } = req.params;
      const { eventName, eventPage, eventBannerImage, eventEmailTemplate, verifiedEmailTemplate } = req.body;

      const event = await Event.findByPk(id, {
        include: [
          { model: EventEmailTemplate },
          { model: VerifiedEmailTemplate }
        ]
      });
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      event.eventName = eventName || event.eventName;
      event.eventPage = eventPage || event.eventPage;
      event.eventBannerImage = eventBannerImage || event.eventBannerImage;

      await event.save();

      if (eventEmailTemplate) {
        await EventEmailTemplate.upsert({
          EventId: event.id,
          eventEmailTemplate: eventEmailTemplate.eventEmailTemplate,
          designTemplate: eventEmailTemplate.designTemplate || null,
        }, {
          where: { EventId: event.id }
        });
      }

      if (verifiedEmailTemplate) {
        await VerifiedEmailTemplate.upsert({
          EventId: event.id,
          eventVerifiedEmailTemplate: verifiedEmailTemplate.eventVerifiedEmailTemplate,
          designTemplate: verifiedEmailTemplate.designTemplate || null,
        }, {
          where: { EventId: event.id }
        });
      }
      const baseUrl = 'http://localhost:3000/'; // Assuming your server runs on this base URL
      const eventWithFullImageUrl = {
        ...event.toJSON(),
        eventBannerImage: event.eventBannerImage ? `${baseUrl}${event.eventBannerImage}` : null
      };
      res.status(200).json(eventWithFullImageUrl);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
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
      // Delete associated UserEvents first
      await UserEvents.destroy({
        where: {
          eventId: id
        }
      });
      await event.destroy();
      res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  getEventById: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await Event.findByPk(id , {
        include: [
          { model: EventEmailTemplate },
          { model: VerifiedEmailTemplate }
        ]
      });
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(200).json(event);
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  exportEventData: async (req, res) => {
    try {
      const { id } = req.params; // Event ID

      const event = await Event.findByPk(id, {
        include: [
          { model: UserEvents, as: 'eventUserEvents', include: [{ model: User }] },
        ],
      });

      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      const records = [];
      // Add event details as the first row
      records.push(['Event Name', event.eventName]);
      records.push(['Event Page', event.eventPage]);
      records.push(['Apologize Content', event.apologizeContent]);
      records.push(['Accepted Content', event.acceptedContent]);
      records.push([]); // Empty row for separation

      // Add headers for user data
      records.push(['User ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Invitation Status', 'Accepted']);

      // Add user data
      event.eventUserEvents.forEach(userEvent => {
        records.push([
          userEvent.User.id,
          userEvent.User.firstName,
          userEvent.User.lastName,
          userEvent.User.email,
          userEvent.User.phone,
          userEvent.emailStatus,
          userEvent.acceptedInvitationStatus,
        ]);
      });

      stringify(records, (err, output) => {
        if (err) {
          console.error('Error stringifying CSV:', err);
          return res.status(500).json({ message: 'Error generating CSV' });
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="event_${event.eventName}_data.csv"`);
        res.status(200).send(output);
      });

    } catch (error) {
      console.error('Error exporting event data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};