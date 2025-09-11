const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createUserAnswer,
  getUserAnswers,
  getUserAnswer,
  updateUserAnswer,
  deleteUserAnswer
} = require('../controllers/userAnswerController.js');

const router = express.Router();

router.route('/')
  .post(protect, createUserAnswer)
  .get(protect, getUserAnswers);

router.route('/:EventId/:userId')
  .get(protect, getUserAnswers)
  .put(protect, updateUserAnswer)
  .delete(protect, deleteUserAnswer);

module.exports = router;