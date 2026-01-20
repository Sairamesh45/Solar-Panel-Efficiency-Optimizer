const mongoose = require('mongoose');

const PartsCatalogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { 
    type: String, 
    enum: ['panel', 'inverter', 'wiring', 'mounting', 'cleaning', 'tools', 'safety', 'other'],
    default: 'other'
  },
  partNumber: { type: String, unique: true, sparse: true },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  unit: { type: String, default: 'piece' }, // piece, meter, kg, liter, etc.
  stockQuantity: { type: Number, default: 0 },
  minStockLevel: { type: Number, default: 5 },
  supplier: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for search
PartsCatalogSchema.index({ name: 'text', description: 'text', partNumber: 'text' });

module.exports = mongoose.model('PartsCatalog', PartsCatalogSchema);
