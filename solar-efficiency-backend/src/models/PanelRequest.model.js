const mongoose = require('mongoose');

const PanelRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: String,
  wattage: String,
  brand: String,
  notes: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  installerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'SolarPanel' },
  timeline: [{
    status: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PanelRequest', PanelRequestSchema);
