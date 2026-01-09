const express = require('express');
const router = express.Router();
const controller = require('../controllers/panel.controller');

router.get('/', controller.getPanels);
router.post('/', controller.createPanel);

module.exports = router;
