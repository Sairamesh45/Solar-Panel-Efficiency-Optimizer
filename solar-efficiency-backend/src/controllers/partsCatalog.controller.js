const partsService = require('../services/partsCatalog.service');

// Create a new part
exports.create = async (req, res, next) => {
  try {
    const { name, price } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and price are required' 
      });
    }
    
    const part = await partsService.create(req.body);
    res.status(201).json({ 
      success: true, 
      data: part,
      message: 'Part created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all parts
exports.getAll = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const parts = await partsService.getAll({ category, search });
    res.status(200).json({ success: true, data: parts });
  } catch (error) {
    next(error);
  }
};

// Get part by ID
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const part = await partsService.getById(id);
    
    if (!part) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }
    
    res.status(200).json({ success: true, data: part });
  } catch (error) {
    next(error);
  }
};

// Update part
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await partsService.update(id, req.body);
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      data: updated,
      message: 'Part updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete part
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await partsService.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }
    
    res.status(200).json({ success: true, message: 'Part deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Update stock
exports.updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body;
    
    if (quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Quantity is required' });
    }
    
    const updated = await partsService.updateStock(id, quantity, operation);
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Part not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      data: updated,
      message: 'Stock updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get low stock parts
exports.getLowStock = async (req, res, next) => {
  try {
    const parts = await partsService.getLowStock();
    res.status(200).json({ success: true, data: parts });
  } catch (error) {
    next(error);
  }
};

// Get categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await partsService.getCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// Search parts
exports.search = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    
    const parts = await partsService.search(q);
    res.status(200).json({ success: true, data: parts });
  } catch (error) {
    next(error);
  }
};
