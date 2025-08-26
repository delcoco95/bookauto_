const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid - user not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

// Check if user is a professional
const requirePro = (req, res, next) => {
  if (req.user.role !== 'pro') {
    return res.status(403).json({ 
      message: 'Access denied. Professional account required.' 
    });
  }
  next();
};

// Check if user is a client
const requireClient = (req, res, next) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ 
      message: 'Access denied. Client account required.' 
    });
  }
  next();
};

module.exports = {
  verifyToken,
  requirePro,
  requireClient
};
