const express = require('express');
const router = express.Router();
const controller = require('../controllers/maintenance.controller');

router.post('/schedule', controller.scheduleMaintenance);
router.get('/history', controller.getMaintenanceHistory);
router.get('/pending', controller.getPendingRequests);
router.post('/handle', controller.handleRequest);

module.exports = router;
