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

    // Get random 10 quizzes using aggregation
    const quizzes = await Quiz.aggregate([
      { $match: filter },
      { $sample: { size: 10 } },
    ]);

    // Shuffle the options for each quiz
    const quizzesWithRandomizedOptions = quizzes.map((quiz) => {
      // Shuffle the options array
      const shuffledOptions = shuffleArray(quiz.options);
      return {
        ...quiz,
        options: shuffledOptions, // Replace the original options with shuffled options
      };
    });

    res.status(200).json(quizzesWithRandomizedOptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
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
exports.getQuizCounts = async (req, res) => {
  try {
    const { questionType, difficulty } = req.query;
    
    const counts = {
      total: 0,
      byType: {},
      byTypeAndDifficulty: {}
    };
    
    counts.total = await Quiz.countDocuments();
    
    // Get all types if no specific type requested
    const types = questionType ? [questionType] : await Quiz.distinct('questionType');
    
    // Populate byType counts
    for (const type of types) {
      counts.byType[type] = await Quiz.countDocuments({ questionType: type });
      
      // Get difficulties for this type
      const difficulties = difficulty ? [parseInt(difficulty)] : await Quiz.distinct('difficulty', { questionType: type });
      
      // Populate byTypeAndDifficulty counts
      for (const diff of difficulties) {
        const key = `${type}_${diff}`;
        counts.byTypeAndDifficulty[key] = await Quiz.countDocuments({
          questionType: type,
          difficulty: diff
        });
      }
    }
    
    res.status(200).json(counts);
  } catch (error) {
    console.error('Error getting quiz counts:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};