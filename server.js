const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors({
  origin: ['https://crijan-personal.vercel.app', 'https://www.srijanpokhrel.com.np', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://crijanblog.vercel.app'],
}));
app.use(express.json()); // Uses the default limit of 100kb
app.use(express.urlencoded({ extended: true })); // Uses the default limit of 100kb for URL-encoded data
const quizRoutes = require('./routes/quizRoutes');
const BCTquizRoutes = require('./routes/BCTquizRoutes');

// Import routes
const categoryRoutes = require('./routes/category');
const postRoutes = require('./routes/post');
const adminRoutes = require('./routes/admin');
const auth = require('./middleware/auth');
const semesterRoutes = require('./routes/semesterRoutes');
const questionTypeRoutes = require('./routes/questionTypeRoutes');
const BCTquestionTypeRoutes = require('./routes/BCTquestionTypeRoutes');

// Use routes
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/bct-quizzes', BCTquizRoutes);

app.use('/api/question-types', questionTypeRoutes);
app.use('/api/bct-question-types', BCTquestionTypeRoutes);

// Protect only POST, PUT, DELETE routes with auth middleware
app.post('/api/categories', auth, categoryRoutes);
app.put('/api/categories/:id', auth, categoryRoutes);
app.delete('/api/categories/:id', auth, categoryRoutes);

app.post('/api/posts', auth, postRoutes);
app.put('/api/posts/:id', auth, postRoutes);
app.delete('/api/posts/:id', auth, postRoutes);
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled Error:", err.stack); // This should log the error in VS Code
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});
// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('MongoDB connection string is missing!');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
