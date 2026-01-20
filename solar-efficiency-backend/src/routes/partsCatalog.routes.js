const express = require('express');
const router = express.Router();
const controller = require('../controllers/partsCatalog.controller');

// Create part
router.post('/', controller.create);

// Get all parts
router.get('/', controller.getAll);

// Get categories
router.get('/categories', controller.getCategories);

// Get low stock parts
router.get('/low-stock', controller.getLowStock);

// Search parts
router.get('/search', controller.search);

// Get part by ID
router.get('/:id', controller.getById);

// Update part
router.put('/:id', controller.update);

// Update stock
router.patch('/:id/stock', controller.updateStock);

// Delete part
router.delete('/:id', controller.delete);

module.exports = router;
