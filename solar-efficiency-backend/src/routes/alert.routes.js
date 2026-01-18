const express = require('express');
const router = express.Router();
const controller = require('../controllers/alert.controller');

router.get('/', controller.getAlerts);
router.post('/', controller.createAlert);

module.exports = router;
