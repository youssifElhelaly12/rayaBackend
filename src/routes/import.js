const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadCSV } = require('../controllers/importController');

router.use(protect);
router.post('/', uploadCSV);

module.exports = router;