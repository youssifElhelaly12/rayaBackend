const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

router.post('/', tagController.createTag);
router.get('/', tagController.getTags);
router.get('/:id', tagController.getTagDetails);
router.put('/:id', tagController.updateTag);
router.post('/:tagId/users', tagController.addUsersToTag);
router.delete('/:id', tagController.deleteTag);
router.delete('/:tagId/users/:userId', tagController.removeUserFromTag);

module.exports = router;