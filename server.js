const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors({
  origin: ['https://crijanpersonalblog.vercel.app', 'http://localhost:3000', 'http://localhost:3001','http://localhost:3002','https://crijanblog.vercel.app'],
}));
app.use(express.json()); // Uses the default limit of 100kb
app.use(express.urlencoded({ extended: true })); // Uses the default limit of 100kb for URL-encoded data

// Import routes
const categoryRoutes = require('./routes/category');
const postRoutes = require('./routes/post');
const adminRoutes = require('./routes/admin');
const auth = require('./middleware/auth');
const semesterRoutes = require('./routes/semesterRoutes');

// Use routes
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/admin', adminRoutes);

// Protect only POST, PUT, DELETE routes with auth middleware
app.post('/api/categories', auth, categoryRoutes);
app.put('/api/categories/:id', auth, categoryRoutes);
app.delete('/api/categories/:id', auth, categoryRoutes);

app.post('/api/posts', auth, postRoutes);
app.put('/api/posts/:id', auth, postRoutes);
app.delete('/api/posts/:id', auth, postRoutes);

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
