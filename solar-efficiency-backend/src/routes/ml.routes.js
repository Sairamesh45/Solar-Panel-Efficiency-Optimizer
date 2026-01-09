const express = require('express');
const router = express.Router();
const controller = require('../controllers/ml.controller');

router.post('/predict', controller.predict);

module.exports = router;
