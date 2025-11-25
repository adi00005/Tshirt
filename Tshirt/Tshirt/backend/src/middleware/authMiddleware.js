import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// Protect routes - user must be authenticated
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies first, then in Authorization header
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    // Get token from Authorization header
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from the database
    req.user = await User.findById(decoded.id).select('-password');
    
    // Optional: uncomment for debug
    // console.log(`[auth] user ${req.user?._id} -> ${req.method} ${req.originalUrl}`);
    
    next();
  } catch (error) {
    console.error('JWT Error:', error);
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};
