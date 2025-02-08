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
  getQuizAnswers 
} = require('../controllers/quizController');
// New routes for specific fetches
router.get('/type', getQuizzesByType); // Fetch quizzes by questionType
router.get('/questions', getQuizQuestions); // Fetch only questionText
router.get('/answers', getQuizAnswers); // Fetch questionText and correctAnswer
// Existing routes
router.get('/', getQuizzes);
router.get('/:id', getQuizById);
router.post('/', createQuiz);
router.put('/:id', updateQuiz);
router.delete('/:id', deleteQuiz);


module.exports = router;
