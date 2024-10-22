const mongoose = require('mongoose');

// Post Schema
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  slug: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Automatically generate slug from title before saving the post
PostSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  }
  next();
});

// Subject Schema
const SubjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  posts: [PostSchema]
}, { timestamps: true });

// Semester Schema
const SemesterSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., '1st Sem'
  subjects: [SubjectSchema]
}, { timestamps: true });

module.exports = mongoose.model('Semester', SemesterSchema);
