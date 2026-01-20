const express = require('express');
const router = express.Router();
const controller = require('../controllers/recurringMaintenance.controller');

// Create recurring schedule
router.post('/', controller.create);

// Get all schedules
router.get('/', controller.getAll);

// Get upcoming schedules
router.get('/upcoming', controller.getUpcoming);

// Generate due maintenance requests
router.post('/generate', controller.generateDue);

// Get schedules by panel
router.get('/panel/:panelId', controller.getByPanel);

// Update schedule
router.put('/:id', controller.update);

// Toggle active status
router.patch('/:id/toggle', controller.toggleActive);

// Delete schedule
router.delete('/:id', controller.delete);

module.exports = router;
