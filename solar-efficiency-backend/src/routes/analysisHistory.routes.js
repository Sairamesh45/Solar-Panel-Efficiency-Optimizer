const express = require('express');
const router = express.Router();
const controller = require('../controllers/analysisHistory.controller');

// Get user's analysis history
router.get('/', controller.getHistory);

// Get trend data
router.get('/trend', controller.getTrend);

// Compare two analyses
router.get('/compare', controller.compare);

// Get analysis by panel
router.get('/panel/:panelId', controller.getByPanel);

// Save to history
router.post('/', controller.saveToHistory);

module.exports = router;
