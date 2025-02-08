const QuestionType = require('../models/QuestionType');

exports.getQuestionTypes = async (req, res) => {
  try {
    const types = await QuestionType.find({});
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createQuestionType = async (req, res) => {
  try {
    const { name } = req.body;
    const existingType = await QuestionType.findOne({ name });
    
    if (existingType) {
      return res.status(400).json({ message: 'Question type already exists' });
    }

    const newType = new QuestionType({ name });
    await newType.save();
    res.status(201).json(newType);
  } catch (error) {
    res.status(400).json({ message: 'Error creating question type' });
  }
};

exports.updateQuestionType = async (req, res) => {
  try {
    const type = await QuestionType.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true, runValidators: true }
    );

    if (!type) {
      return res.status(404).json({ message: 'Question type not found' });
    }
    res.status(200).json(type);
  } catch (error) {
    res.status(400).json({ message: 'Error updating question type' });
  }
};

exports.deleteQuestionType = async (req, res) => {
  try {
    const type = await QuestionType.findByIdAndDelete(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Question type not found' });
    }
    res.status(200).json({ message: 'Question type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};