const express = require('express');
const router = express.Router();
const controller = require('../controllers/panelRequest.controller');

router.post('/', controller.createPanelRequest);
router.get('/', controller.getPanelRequests);
router.post('/status', controller.updatePanelRequestStatus);

module.exports = router;
