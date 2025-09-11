const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createQuestion,
  getQuestionsByEvent,
  updateQuestion,
  deleteQuestion,
  getEventsWithQuestions,
  getQuestionById
} = require('../controllers/questionController');

// Create a question for an event
router.post('/:EventId', protect, createQuestion);

// Get all questions for an event
router.get('/:EventId', protect, getQuestionsByEvent);

router.get('/single/:id', protect, getQuestionById);
router.put('/:id', protect, updateQuestion);

// Delete a question
router.delete('/:id', protect, deleteQuestion);

// Get all events that have questions
router.get('/events/with-questions', protect, getEventsWithQuestions);

module.exports = router;