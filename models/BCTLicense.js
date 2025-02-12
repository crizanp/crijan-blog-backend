const mongoose = require('mongoose');

const BCTLicenseSchema = new mongoose.Schema({
  questionType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BCTQuestionType',
    required: true
  },
  subTopic: {
    type: String,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: [{
    text: {
      type: String,
      required: true
    }
  }],
  correctAnswers: [{
    type: String,
    required: true
  }],
  explanation: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('BCTLicense', BCTLicenseSchema);