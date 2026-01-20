const express = require('express');
const router = express.Router();
const controller = require('../controllers/maintenance.controller');



router.post('/schedule', controller.scheduleMaintenance);
router.get('/history', controller.getMaintenanceHistory);
router.get('/my-requests', controller.getMyMaintenanceRequests);
router.get('/pending', controller.getPendingRequests);
router.get('/assigned', controller.getAssignedRequests); // Added route
router.post('/handle', controller.handleRequest);
// Assign installer to a maintenance request
router.post('/assign', controller.assignInstaller);
// Schedule appointment with specific date/time
router.post('/schedule-appointment', controller.scheduleAppointment);
// Add cost estimation
router.post('/cost-estimate', controller.addCostEstimate);
// Update maintenance status (for installers)
router.post('/update', controller.updateMaintenanceStatus);

module.exports = router;
