const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { JWT_SECRET } = require('../config/env');
const { errorResponse } = require('../utils/apiResponse');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
         return errorResponse(res, 'Not authorized, user not found', 401);
      }

      next();
    } catch (error) {
      console.error(error);
      if (error.name === 'TokenExpiredError') {
         return errorResponse(res, 'Session expired, please login again', 401);
      }
      return errorResponse(res, 'Not authorized, token failed', 401);
    }
  }

  if (!token) {
    return errorResponse(res, 'Not authorized, no token', 401);
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
        return errorResponse(res, 'Not authorized, user context missing', 401);
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `User role ${req.user.role} is not authorized to access this route`,
        403
      );
    }
    next();
  };
};

// Alias for protect
exports.isAuthenticated = exports.protect;

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  console.log('=== isAdmin middleware ===');
  console.log('req.user:', req.user);
  console.log('req.user.role:', req.user?.role);
  console.log('Role type:', typeof req.user?.role);
  console.log('========================');
  
  if (!req.user) {
    return errorResponse(res, 'Not authorized, user context missing', 401);
  }
  if (req.user.role !== 'Admin') {
    return errorResponse(res, 'Access denied. Admin privileges required.', 403);
  }
  next();
};
