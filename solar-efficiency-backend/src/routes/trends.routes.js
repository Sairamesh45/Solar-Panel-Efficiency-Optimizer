const express = require('express');
const router = express.Router();
const trendsController = require('../controllers/trends.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

// Time-series data
router.get('/timeseries/:panelId', trendsController.getTimeSeriesData);

// Efficiency decay analysis
router.get('/efficiency-decay/:panelId', trendsController.getEfficiencyDecay);

// Dust accumulation pattern
router.get('/dust-pattern/:panelId', trendsController.getDustPattern);

// Temperature-efficiency correlation
router.get('/temperature-correlation/:panelId', trendsController.getTemperatureCorrelation);

// Maintenance impact analysis
router.get('/maintenance-impact/:panelId', trendsController.getMaintenanceImpact);

// Comprehensive analysis (all trends)
router.get('/comprehensive/:panelId', trendsController.getComprehensiveAnalysis);

module.exports = router;
