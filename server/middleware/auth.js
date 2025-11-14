const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Check if database is available
const mongoose = require('mongoose');
const isDatabaseAvailable = () => mongoose.connection.readyState === 1;

const getUser = () => {
  if (!isDatabaseAvailable()) return null;
  return require('../models/User');
};

const auth = async (req, res, next) => {
  try {
    const User = getUser();
    if (!User) {
      return res.status(503).json({ 
        error: 'Authentication requires database connection. Please configure MONGODB_URI.',
        requiresSetup: true
      });
    }

    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const User = getUser();
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token && User) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
        req.token = token;
      }
    }
    next();
  } catch (error) {
    // Continue without auth
    next();
  }
};

module.exports = { auth, optionalAuth, JWT_SECRET };
