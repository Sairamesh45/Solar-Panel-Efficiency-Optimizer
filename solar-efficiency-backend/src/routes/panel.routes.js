const express = require('express');
const router = express.Router();
const controller = require('../controllers/panel.controller');
const Panel = require('../models/SolarPanel.model');


// Get panels (optionally by userId)
router.get('/', controller.getPanels);

router.post('/', controller.createPanel);

module.exports = router;
