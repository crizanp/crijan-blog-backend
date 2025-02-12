const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizzesByType,
  getQuizQuestions,
  getQuizAnswers,
  createMultipleQuizzes,
  getQuizCounts // Add this new controller
} = require('../controllers/BCTquizController');

// Add new count route
router.get('/count', getQuizCounts);

// Existing routes
router.get('/type', getQuizzesByType);
router.get('/questions', getQuizQuestions);
router.get('/answers', getQuizAnswers);
router.get('/', getQuizzes);
router.get('/:id', getQuizById);
router.post('/', createQuiz);
router.put('/:id', updateQuiz);
router.post('/bulk', createMultipleQuizzes);

router.delete('/:id', deleteQuiz);

module.exports = router;