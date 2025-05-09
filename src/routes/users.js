const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUsers, getUser, updateUser, deleteUser, createUser, searchUsersByEmail, deleteAllUsers, sendInvitationEmail } = require('../controllers/userController'); // Add searchUsersByEmail
const { register, login, invalidateToken } = require('../controllers/authController');

router.route('/')
    .get(protect, getUsers)
    .post(protect, createUser)
    .delete(protect, deleteAllUsers); // Add delete all users endpoint

// Search users by email endpoint
router.get('/search', protect, searchUsersByEmail);

router.route('/:id')
    .get(getUser)
    .put(protect, updateUser)
    .delete(protect, deleteUser);

router.post('/:id/invite', protect, sendInvitationEmail);

router.post('/logout', invalidateToken);

module.exports = router;