const express = require('express');
const router = express.Router();
const { register, login, invalidateToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, upload.array('idImage', 5), invalidateToken); // ✅ multer here

module.exports = router;
