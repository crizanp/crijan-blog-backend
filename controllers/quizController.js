// controllers/quizController.js
const Quiz = require('../models/Quiz');

exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({});
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const { questionType, questionText, options, correctAnswers, explanation, difficulty } = req.body;

    if (!Array.isArray(options) || options.some(opt => !opt.text)) {
      return res.status(400).json({ message: 'Options must be an array of objects with text properties' });
    }

    if (!Array.isArray(correctAnswers) || correctAnswers.length === 0) {
      return res.status(400).json({ message: 'Correct answers must be an array with at least one value' });
    }

    const newQuiz = new Quiz({
      questionType,
      questionText,
      options,
      correctAnswers,
      explanation,
      difficulty
    });

    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(400).json({
      message: 'Error creating quiz',
      error: error.message,
      details: error.errors
    });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json(quiz);
  } catch (error) {
    res.status(400).json({ message: 'Error updating quiz' });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}; exports.getQuizzesByType = async (req, res) => {
  try {
    const { questionType, difficulty } = req.query;
    
    const filter = { questionType };
    if (difficulty) filter.difficulty = parseInt(difficulty);

    const quizzes = await Quiz.find(filter);
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQuizQuestions = async (req, res) => {
  try {
    const quizzes = await Quiz.find({}).select('questionText'); // Only fetch questionText
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQuizAnswers = async (req, res) => {
  try {
    const quizzes = await Quiz.find({}).select('questionText correctAnswers');
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

