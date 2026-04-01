const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(protect);

// Generate analytics for a period
router.post('/generate', analyticsController.generateAnalytics);

// Get analytics
router.get('/', analyticsController.getAnalytics);

// Get cumulative analytics
router.get('/cumulative', analyticsController.getCumulativeAnalytics);

// Get cost savings
router.get('/cost-savings', analyticsController.getCostSavings);

// Get carbon footprint
router.get('/carbon-footprint', analyticsController.getCarbonFootprint);

// Download reports
router.get('/report/excel', analyticsController.downloadExcelReport);

module.exports = router;
