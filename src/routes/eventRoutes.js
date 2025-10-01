const router = require('express').Router();
const eventController = require('../controllers/eventController');
try {

    // Create event
    router.post('/', eventController.upload.single('eventBannerImage'), eventController.createEvent);
    
    // Get all events (with pagination & limit)
    router.get('/', eventController.getAllEvents);
    
    // Search events by name
    router.get('/search', eventController.searchEventsByName);
    
    // Edit event
    router.put('/:id', eventController.upload.single('eventBannerImage'), eventController.editEvent);
    
    // Delete event
    router.delete('/:id', eventController.deleteEvent);
    
    // Get single event by ID
    router.get('/:id', eventController.getEventById);
    
    // Export event data as CSV
    router.get('/:id/export', eventController.exportEventData);
}
catch (e) {
    console.log(e)
}

module.exports = router;
