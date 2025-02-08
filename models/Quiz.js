const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  questionType: {
    type: String,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    _id: false
  }],
  correctAnswers: { // Updated to store multiple correct answers
    type: [String], 
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', QuizSchema);
