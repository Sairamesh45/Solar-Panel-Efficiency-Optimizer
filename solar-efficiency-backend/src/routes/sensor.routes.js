const express = require('express');
const router = express.Router();
const controller = require('../controllers/sensor.controller');

router.get('/', controller.getSensorData);
router.post('/', controller.createSensorData);
router.post('/generate', controller.generateSensorDataNow); // Manual trigger for testing

module.exports = router;
