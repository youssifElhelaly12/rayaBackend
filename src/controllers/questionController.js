const { Question, Event, sequelize } = require('../models/associations');

// Create a new question for an event
exports.createQuestion = async (req, res) => {
  try {
    const { EventId } = req.params;
    const questionsData = req.body;

    // Handle single question case (backward compatibility)
    const questionsArray = Array.isArray(questionsData) ? questionsData : [questionsData];

    // Validate all questions
    for (const q of questionsArray) {
      if (!q.question || !q.answers || !q.answerType) {
        return res.status(400).json({ message: 'Each question must have question, answers and answerType fields' });
      }
    }

    const event = await Event.findByPk(EventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Create all questions in a transaction
    const newQuestions = await sequelize.transaction(async (t) => {
      return await Promise.all(
        questionsArray.map(q => 
          Question.create({
            question: q.question,
            answers: q.answers,
            answerType: q.answerType,
            EventId
          }, { transaction: t })
        )
      );
    });

    return res.status(201).json(newQuestions);
  } catch (error) {
    console.error('Error creating question:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get all questions for an event
exports.getQuestionsByEvent = async (req, res) => {
  try {
    const { EventId } = req.params;
    
    const event = await Event.findByPk(EventId, {
      include: [{ model: Question, as: 'questions' }],
      attributes: ['id', 'eventName', 'eventPage', 'eventBannerImage']
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    return res.status(200).json({
      event: {
        id: event.id,
        eventName: event.eventName,
        eventPage: event.eventPage,
        eventBannerImage: event.eventBannerImage,
    
      },
      questions: event.questions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update a question
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answers, answerType } = req.body;
    
    const questionToUpdate = await Question.findByPk(id);
    if (!questionToUpdate) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    questionToUpdate.question = question || questionToUpdate.question;
    questionToUpdate.answers = answers || questionToUpdate.answers;
    questionToUpdate.answerType = answerType || questionToUpdate.answerType;
    
    await questionToUpdate.save();
    
    return res.status(200).json(questionToUpdate);
  } catch (error) {
    console.error('Error updating question:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Question.destroy({ where: { id } });
    if (!deleted) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting question:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getEventsWithQuestions = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [{
        model: Question,
        as: 'questions',
        required: true
      }],
      attributes: ['id', 'eventName', 'eventPage', 'eventBannerImage'],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events with questions:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get a question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    return res.status(200).json(question);
  } catch (error) {
    console.error('Error fetching question by ID:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};