const express = require('express');
const router = express.Router();
const controller = require('../controllers/ml.controller');

// Get ML model metrics and evaluation report
router.get('/metrics', controller.getModelMetrics);

// Predict solar power output (future implementation)
router.post('/predict', controller.predict);

// Detect anomalies in sensor data
router.post('/anomaly-detect', controller.detectAnomalies);

// Predict maintenance needs
router.post('/maintenance-predict', controller.predictMaintenance);

module.exports = router;
