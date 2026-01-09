const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { isAuthenticated, isAdmin } = require('../middlewares/auth.middleware');

// Apply authentication and admin check to all admin routes
router.use(isAuthenticated);
router.use(isAdmin);

// Admin routes
router.get('/users', adminController.getAllUsers);
router.get('/requests', adminController.getAllRequests);
router.get('/stats', adminController.getStats);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

module.exports = router;
