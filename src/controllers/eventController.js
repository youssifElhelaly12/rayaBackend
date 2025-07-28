const Event = require('../models/Event');
const multer = require('multer');
const path = require('path');

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
  createEvent: async (req, res) => {
    try {
        const { eventName, eventPage } = req.body;
        let eventBannerImage = null;
        if (req.file) {
            eventBannerImage = `/uploads/${req.file.filename}`;
        }

        const event = await Event.create({
            eventName,
            eventPage,
            eventBannerImage
        });
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
      const events = await Event.findAll();
      const baseUrl = 'http://localhost:3000/'; // Assuming your server runs on this base URL
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
      const { eventName, eventPage, eventBannerImage } = req.body;

      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }

      event.eventName = eventName || event.eventName;
      event.eventPage = eventPage || event.eventPage;
      event.eventBannerImage = eventBannerImage || event.eventBannerImage;

      await event.save();
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
      const event = await Event.findByPk(id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.status(200).json(event);
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  upload
};