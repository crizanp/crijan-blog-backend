const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Skip authentication for GET requests
  if (req.method === 'GET') {
    return next();
  }

  // For other requests, require authentication
  const token = req.header('Authorization')?.split(' ')[1]; // Extract 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify the token with the JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded user to the request object
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};
