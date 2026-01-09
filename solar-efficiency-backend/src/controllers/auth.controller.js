const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { JWT_SECRET } = require('../config/env');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate email format
    if (!validator.isEmail(email)) {
      return errorResponse(res, 'Please provide a valid email address', 400);
    }

    // Validate password strength
    if (!validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })) {
      return errorResponse(
        res,
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol',
        400
      );
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return errorResponse(res, 'User already exists', 400);
    }

    // Role validation (optional, ensures only valid roles are passed)
    if (role && !['Admin', 'Installer', 'Customer'].includes(role)) {
       return errorResponse(res, 'Invalid role', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Customer'
    });

    if (user) {
      const token = generateToken(user._id);
      successResponse(res, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }, 'User registered successfully');
    } else {
      errorResponse(res, 'Invalid user data', 400);
    }
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return errorResponse(res, 'Please provide an email and password', 400);
    }

    // Check for user
    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = generateToken(user._id);

    successResponse(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // Since we are using stateless JWTs, "logout" is mostly a client-side action (deleting the token).
    // However, we can clear cookies if we were using them.
    // Ideally, we would add the token to a blacklist in Redis or DB here.
    
    successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    successResponse(res, user, 'User details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return errorResponse(res, 'There is no user with that email', 404);
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    // Pointing to the frontend file with a query parameter for testing purposes
    // IN PRODUCTION: This should be your actual frontend URL, e.g., https://my-solar-app.com/reset-password/${resetToken}
    const resetUrl = `http://localhost:5000/index.html?resettoken=${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below to reset your password:\n\n${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message
      });

      successResponse(res, null, 'Email sent');
    } catch (error) {
      console.log(error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return errorResponse(res, 'Email could not be sent', 500);
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, 'Invalid token', 400);
    }

    // Validate new password strength
    if (!validator.isStrongPassword(req.body.password, {
      minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
    })) {
        return errorResponse(res, 'Password must be strong (8+ chars, upper, lower, num, symbol)', 400);
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    const token = generateToken(user._id);

    successResponse(res, {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }, 'Password updated success');
  } catch (error) {
    next(error);
  }
};
