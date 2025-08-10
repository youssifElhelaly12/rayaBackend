const router = require('express').Router();
const eventController = require('../controllers/eventController');


router.post('/', eventController.upload.single('eventBannerImage'), eventController.createEvent);

router.get('/', eventController.getAllEvents);
router.put('/:id', eventController.editEvent);
router.delete('/:id', eventController.deleteEvent);
router.get('/:id', eventController.getEventById);
router.get('/:id/export', eventController.exportEventData);

module.exports = router;