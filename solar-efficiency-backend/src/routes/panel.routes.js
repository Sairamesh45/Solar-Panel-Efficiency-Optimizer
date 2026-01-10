const express = require('express');
const router = express.Router();
const controller = require('../controllers/panel.controller');


// Get panels (optionally by userId)

router.get('/', controller.getPanels);
router.get('/compare', controller.comparePanels);
router.post('/', controller.createPanel);

// Delete a panel by ID
router.delete('/:id', controller.deletePanel);

// Assign installer to panel creation request
router.post('/assign-installer', controller.assignInstaller);

module.exports = router;
