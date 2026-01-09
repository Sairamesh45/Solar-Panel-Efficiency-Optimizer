const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimit.middleware');

router.post('/register', authLimiter, controller.register);
router.post('/login', authLimiter, controller.login);
router.get('/logout', controller.logout);
router.post('/forgotpassword', controller.forgotPassword);
router.put('/resetpassword/:resettoken', controller.resetPassword);
router.get('/me', protect, controller.getMe);

module.exports = router;
