const express = require('express');
const bcrypt = require('bcrypt');  // new
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  console.log("Registering admin with raw password:", password);  // Log raw password

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    let admin = await Admin.findOne({ username });
    if (admin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // No need to hash the password manually here; the pre-save hook will handle it.
    admin = new Admin({
      username,
      password,  // Store the raw password; it will be hashed by the pre-save hook
    });

    await admin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Server error during registration:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});


// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log("Login attempt with raw password:", password);  // Log raw password

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log("Admin not found in the database.");
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log("Admin fetched from DB:", admin);
    console.log("Hashed password length:", admin.password.length);  // Log hashed password length

    // Compare password with the hashed password in the database
    bcrypt.compare(password, admin.password, (err, isMatch) => {
      console.log("Manual bcrypt comparison result:", isMatch);

      if (err) {
        console.error('Error during bcrypt comparison:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      if (!isMatch) {
        console.log("Password mismatch. Input password:", password, "Hashed password in DB:", admin.password);
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      console.log("Login successful for admin:", username);

      const payload = { user: { id: admin._id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.json({ token });
    });
  } catch (error) {
    console.error('Server error during login:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
