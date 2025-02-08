const express = require('express');
const router = express.Router();
const {
  getQuestionTypes,
  createQuestionType,
  updateQuestionType,
  deleteQuestionType
} = require('../controllers/questionTypeController');

router.get('/', getQuestionTypes);
router.post('/', createQuestionType);
router.put('/:id', updateQuestionType);
router.delete('/:id', deleteQuestionType);

module.exports = router;