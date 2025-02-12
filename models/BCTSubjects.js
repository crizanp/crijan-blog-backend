const mongoose = require('mongoose');

const SubTopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const BCTQuestionTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  subTopics: [SubTopicSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BCTQuestionType', BCTQuestionTypeSchema);
