const BCTQuestionType = require('../models/BCTSubjects');

exports.getQuestionTypes = async (req, res) => {
  try {
    const types = await BCTQuestionType.find({});
    res.status(200).json(types);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
// In your BCTquestionTypeController.js
exports.getQuestionTypeByName = async (req, res) => {
  try {
    const typeName = req.params.name;
    const type = await BCTQuestionType.findOne({ name: typeName });

    if (!type) {
      return res.status(404).json({ message: 'Question type not found' });
    }

    res.status(200).json(type);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createQuestionType = async (req, res) => {
  try {
    const { name, subtopics  } = req.body;
    const existingType = await BCTQuestionType.findOne({ name });

    if (existingType) {
      return res.status(400).json({ message: 'Question type already exists' });
    }

    const newType = new BCTQuestionType({ 
      name, 
      subTopics: (subtopics || []).map(st => ({ name: st })) // Convert strings to objects
    });

    await newType.save();
    res.status(201).json(newType);
  } catch (error) {
    res.status(400).json({ message: 'Error creating question type' });
  }
};

exports.updateQuestionType = async (req, res) => {
  try {
    const { name, subtopics  } = req.body;

    const type = await BCTQuestionType.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        subTopics: (subtopics || []).map(st => ({ name: st })) // Convert strings to objects
      },
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
    const type = await BCTQuestionType.findByIdAndDelete(req.params.id);
    if (!type) {
      return res.status(404).json({ message: 'Question type not found' });
    }
    res.status(200).json({ message: 'Question type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
