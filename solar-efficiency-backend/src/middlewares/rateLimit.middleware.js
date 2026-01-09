const rateLimit = require('express-rate-limit');

exports.limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Increased for development - was 10
  message: 'Too many login attempts, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});
