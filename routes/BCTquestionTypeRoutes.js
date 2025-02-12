const express = require('express');
const router = express.Router();
const {
  getQuestionTypes,
  createQuestionType,
  updateQuestionType,
  deleteQuestionType,
  getQuestionTypeByName 
} = require('../controllers/BCTquestionTypeController');

router.get('/', getQuestionTypes);
router.get('/:name', getQuestionTypeByName);
router.post('/', createQuestionType);
router.put('/:id', updateQuestionType);
router.delete('/:id', deleteQuestionType);

module.exports = router;