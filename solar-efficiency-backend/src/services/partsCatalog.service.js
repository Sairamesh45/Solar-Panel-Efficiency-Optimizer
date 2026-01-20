const PartsCatalog = require('../models/PartsCatalog.model');

// Create a new part
exports.create = async (data) => {
  const part = new PartsCatalog(data);
  await part.save();
  return part;
};

// Get all parts
exports.getAll = async (filters = {}) => {
  const query = { isActive: true };
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { partNumber: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  return PartsCatalog.find(query).sort({ category: 1, name: 1 });
};

// Get part by ID
exports.getById = async (id) => {
  return PartsCatalog.findById(id);
};

// Update part
exports.update = async (id, data) => {
  data.updatedAt = new Date();
  return PartsCatalog.findByIdAndUpdate(id, data, { new: true });
};

// Delete part (soft delete)
exports.delete = async (id) => {
  return PartsCatalog.findByIdAndUpdate(id, { isActive: false, updatedAt: new Date() }, { new: true });
};

// Hard delete
exports.hardDelete = async (id) => {
  return PartsCatalog.findByIdAndDelete(id);
};

// Update stock quantity
exports.updateStock = async (id, quantity, operation = 'set') => {
  const part = await PartsCatalog.findById(id);
  if (!part) return null;
  
  switch (operation) {
    case 'add':
      part.stockQuantity += quantity;
      break;
    case 'subtract':
      part.stockQuantity = Math.max(0, part.stockQuantity - quantity);
      break;
    case 'set':
    default:
      part.stockQuantity = quantity;
  }
  
  part.updatedAt = new Date();
  await part.save();
  return part;
};

// Get low stock parts
exports.getLowStock = async () => {
  return PartsCatalog.find({
    isActive: true,
    $expr: { $lte: ['$stockQuantity', '$minStockLevel'] }
  }).sort({ stockQuantity: 1 });
};

// Get parts by category
exports.getByCategory = async (category) => {
  return PartsCatalog.find({ category, isActive: true }).sort({ name: 1 });
};

// Search parts
exports.search = async (searchTerm) => {
  return PartsCatalog.find({
    isActive: true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { partNumber: { $regex: searchTerm, $options: 'i' } }
    ]
  }).sort({ name: 1 });
};

// Get all categories
exports.getCategories = async () => {
  return PartsCatalog.distinct('category', { isActive: true });
};
