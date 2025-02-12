const mongoose = require('mongoose');
const BCTLicense = require('../models/BCTLicense');
const BCTQuestionType = require('../models/BCTSubjects');
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await BCTLicense.find({})
      .select('_id questionType subTopic questionText options correctAnswers explanation') // Select only necessary fields
      .populate('questionType', 'name'); // Populate the 'name' of questionType instead of _id

    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



exports.getQuizById = async (req, res) => {
  try {
    const quiz = await BCTLicense.findById(req.params.id);
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
    const { questionType, subTopic, questionText, options, correctAnswers, explanation } = req.body;

    if (!mongoose.Types.ObjectId.isValid(questionType)) {
      return res.status(400).json({ message: 'Invalid question type ID' });
    }

    // Verify the question type exists
    const questionTypeExists = await BCTQuestionType.findById(questionType);
    if (!questionTypeExists) {
      return res.status(404).json({ message: 'Question type not found' });
    }

    if (!Array.isArray(options) || options.some(opt => !opt.text)) {
      return res.status(400).json({ message: 'Options must be an array of objects with text properties' });
    }

    if (!Array.isArray(correctAnswers) || correctAnswers.length === 0) {
      return res.status(400).json({ message: 'Correct answers must be an array with at least one value' });
    }

    const newQuiz = new BCTLicense({
      questionType,
      subTopic,
      questionText,
      options,
      correctAnswers,
      explanation
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
    const { questionType, subTopic, questionText, options, correctAnswers, explanation } = req.body;

    // If questionType is provided as a name (like 'Electronics')
    if (questionType) {
      const questionTypeExists = await BCTQuestionType.findOne({ name: questionType });
      if (!questionTypeExists) {
        return res.status(404).json({ message: 'Question type not found' });
      }
      
      // Update the questionType to the ObjectId from the found document
      req.body.questionType = questionTypeExists._id;
    }

    const quiz = await BCTLicense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json(quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(400).json({
      message: 'Error updating quiz',
      error: error.message,
      details: error.errors
    });
  }
};


exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await BCTLicense.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.createMultipleQuizzes = async (req, res) => {
  try {
    const quizzes = req.body;
    
    if (!Array.isArray(quizzes)) {
      return res.status(400).json({ message: 'Request body should be an array of quizzes' });
    }

    // Validate all quizzes before saving any
    for (const quiz of quizzes) {
      const { questionType, options, correctAnswers } = quiz;
      
      // Validate questionType
      if (!mongoose.Types.ObjectId.isValid(questionType)) {
        return res.status(400).json({ 
          message: 'Invalid question type ID', 
          questionType: questionType 
        });
      }

      // Validate question type exists
      const questionTypeExists = await BCTQuestionType.findById(questionType);
      if (!questionTypeExists) {
        return res.status(400).json({ 
          message: 'Question type not found',
          questionType: questionType
        });
      }

      // Validate options
      if (!Array.isArray(options) || options.some(opt => !opt.text)) {
        return res.status(400).json({ 
          message: 'Options must be an array of objects with text properties',
          quiz: quiz
        });
      }

      // Validate correctAnswers
      if (!Array.isArray(correctAnswers) || correctAnswers.length === 0) {
        return res.status(400).json({ 
          message: 'Correct answers must be an array with at least one value',
          quiz: quiz
        });
      }
    }

    // If all validations pass, create the quizzes
    const createdQuizzes = await BCTLicense.insertMany(quizzes);
    res.status(201).json(createdQuizzes);
    
  } catch (error) {
    console.error('Error creating multiple quizzes:', error);
    res.status(400).json({
      message: 'Error creating quizzes',
      error: error.message,
      details: error.errors
    });
  }
};
exports.getQuizzesByType = async (req, res) => {
  try {
    const { questionType: questionTypeName, subTopic } = req.query;

    // Step 1: Find the questionType document by name to get its ObjectId
    const questionTypeDoc = await BCTQuestionType.findOne({ name: questionTypeName });
    if (!questionTypeDoc) {
      return res.status(404).json({ message: 'Question type not found' });
    }

    // Step 2: Build the filter using the ObjectId
    const filter = { questionType: questionTypeDoc._id };
    if (subTopic) filter.subTopic = subTopic;

    // Step 3: Aggregate quizzes with the correct filter
    const quizzes = await BCTLicense.aggregate([
      { $match: filter },
      { $sample: { size: 10 } },
    ]);

    // Shuffle options for each quiz
    const quizzesWithRandomizedOptions = quizzes.map((quiz) => ({
      ...quiz,
      options: shuffleArray(quiz.options),
    }));

    res.status(200).json(quizzesWithRandomizedOptions);
  } catch (error) {
    console.error('Error in getQuizzesByType:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
    const quizzes = await BCTLicense.find({}).select('questionText'); // Only fetch questionText
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQuizAnswers = async (req, res) => {
  try {
    const quizzes = await BCTLicense.find({}).select('questionText correctAnswers');
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQuizCounts = async (req, res) => {
  try {
    const { questionType, subTopic } = req.query;

    const counts = {
      total: 0,
      byType: {},
      byTypeAndSubTopic: {}
    };

    // Get total count
    counts.total = await BCTLicense.countDocuments();

    // Get question types
    const types = questionType 
      ? [questionType] 
      : await BCTLicense.distinct('questionType');

    // Populate counts for each type
    await Promise.all(types.map(async (type) => {
      // Get count for this type
      counts.byType[type] = await BCTLicense.countDocuments({ questionType: type });

      // Get subTopics for this type
      const subTopics = subTopic 
        ? [subTopic] 
        : await BCTLicense.distinct('subTopic', { questionType: type });

      // Get counts for each subTopic
      await Promise.all(subTopics.map(async (sub) => {
        if (sub) { // Only count if subTopic exists
          const key = `${type}_${sub}`;
          counts.byTypeAndSubTopic[key] = await BCTLicense.countDocuments({
            questionType: type,
            subTopic: sub
          });
        }
      }));
    }));

    res.status(200).json(counts);
  } catch (error) {
    console.error('Error getting quiz counts:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};