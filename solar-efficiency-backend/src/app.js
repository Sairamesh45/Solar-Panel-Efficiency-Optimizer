const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { errorHandler } = require('./middlewares/error.middleware');
const { limiter } = require('./middlewares/rateLimit.middleware');

const app = express();

// Middlewares
app.use(express.json({ limit: '10kb' })); // Body limit
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for inline scripts in simple frontend
}));
app.use(morgan('dev'));
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use(xss()); // Data sanitization against XSS
app.use(limiter); // Global rate limiting

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/solar', require('./routes/solar.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/sensor', require('./routes/sensor.routes'));
app.use('/api/alert', require('./routes/alert.routes'));
app.use('/api/maintenance', require('./routes/maintenance.routes'));
app.use('/api/panel', require('./routes/panel.routes'));
app.use('/api/panel-request', require('./routes/panelRequest.routes'));
app.use('/api/trends', require('./routes/trends.routes'));

// Error Handler
app.use(errorHandler);

module.exports = app;
