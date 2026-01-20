const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');
const { protect } = require('../middlewares/auth.middleware');

/**
 * @route   GET /api/weather/forecast
 * @desc    Get 7-day weather forecast with solar predictions
 * @access  Private
 */
router.get('/forecast', protect, weatherController.getWeatherForecast);

module.exports = router;
