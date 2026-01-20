const express = require('express');
const router = express.Router();
const controller = require('../controllers/alert.controller');

router.get('/', controller.getAlerts);
router.get('/unresolved', controller.getUnresolvedAlerts);
router.get('/user/:userId', controller.getUserAlerts);
router.get('/panel/:panelId', controller.getPanelAlerts);
router.post('/', controller.createAlert);
router.patch('/:id/resolve', controller.resolveAlert);
router.patch('/:id/read', controller.markAlertAsRead);
router.delete('/:id', controller.deleteAlert);

module.exports = router;
