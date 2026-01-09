const express = require('express');
const router = express.Router();
const controller = require('../controllers/sensor.controller');

router.get('/', controller.getSensorData);

module.exports = router;
