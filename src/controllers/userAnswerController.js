const { UserAnswer, User } = require('../models/associations');

// @desc    Create a user answer
// @route   POST /api/user-answers
// @access  Private
const createUserAnswer = async (req, res) => {
  try {
    const { answer, QuestionId, EventId } = req.body;
    const UserId = req.user.id;

    const userAnswer = await UserAnswer.create({
      answer,
      QuestionId,
      EventId,
      UserId
    });

    res.status(201).json(userAnswer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all user answers
// @route   GET /api/user-answers
// @access  Private
const getUserAnswers = async (req, res) => {
  try {
    const whereClause = { UserId: req.params.userId };
    if (req.params.EventId) {
      whereClause.EventId = req.params.EventId;
    }
    
    const userAnswers = await UserAnswer.findAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email'] // Include desired user fields
      }]
    });
    
    const formattedResponse = {
      user: userAnswers[0]?.User ? {
        id: userAnswers[0].User.id,
        name: `${userAnswers[0].User.firstName} ${userAnswers[0].User.lastName}`,
        email: userAnswers[0].User.email
      } : null, // Get user data from first answer
      answers: userAnswers.map(answer => ({
        question: answer.QuestionId,
        answer: answer.answer
      }))
    };
    
    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get single user answer
// @route   GET /api/user-answers/:EventId/:userId
// @access  Private
const getUserAnswer = async (req, res) => {
  try {
    const userAnswer = await UserAnswer.findOne({
      where: {
        EventId: req.params.EventId,
        UserId: req.params.userId
      }
    });

    if (!userAnswer) {
      return res.status(404).json({ error: 'User answer not found' });
    }

    res.status(200).json(userAnswer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update user answer
// @route   PUT /api/user-answers/:id
// @access  Private
const updateUserAnswer = async (req, res) => {
  try {
    const { answer } = req.body;

    const userAnswer = await UserAnswer.findOne({
      where: {
        id: req.params.id,
        UserId: req.user.id
      }
    });

    if (!userAnswer) {
      return res.status(404).json({ error: 'User answer not found' });
    }

    userAnswer.answer = answer;
    await userAnswer.save();

    res.status(200).json(userAnswer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete user answer
// @route   DELETE /api/user-answers/:id
// @access  Private
const deleteUserAnswer = async (req, res) => {
  try {
    const userAnswer = await UserAnswer.findOne({
      where: {
        id: req.params.id,
        UserId: req.user.id
      }
    });

    if (!userAnswer) {
      return res.status(404).json({ error: 'User answer not found' });
    }

    await userAnswer.destroy();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createUserAnswer,
  getUserAnswers,
  getUserAnswer,
  updateUserAnswer,
  deleteUserAnswer
};