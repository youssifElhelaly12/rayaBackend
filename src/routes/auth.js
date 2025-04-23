const express = require('express');
const router = express.Router();
const { register, login, invalidateToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, invalidateToken);

module.exports = router;