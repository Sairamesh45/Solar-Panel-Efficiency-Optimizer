const express = require('express');
const router = express.Router();
const controller = require('../controllers/ml.controller');

// Get ML model metrics and evaluation report
router.get('/metrics', controller.getModelMetrics);

// Predict solar power output (future implementation)
router.post('/predict', controller.predict);

module.exports = router;
