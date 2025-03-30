const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  browser: {
    type: String,
    required: true,
  },
  os: {
    type: String,
    required: true,
  },
  device: {
    type: String,
    required: true,
  },
  firstVisit: {
    type: Date,
    default: Date.now,
  },
  lastVisit: {
    type: Date,
    default: Date.now,
  },
  visitCount: {
    type: Number,
    default: 1,
  }
});

const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);
export default Visitor;