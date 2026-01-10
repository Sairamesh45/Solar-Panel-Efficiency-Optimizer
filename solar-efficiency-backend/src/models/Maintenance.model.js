const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'SolarPanel', required: true },
  scheduledDate: { type: Date, required: true },
  type: { type: String, enum: ['cleaning', 'inspection', 'repair'], required: true },
  notes: String,
  completed: { type: Boolean, default: false },
  requested: { type: Boolean, default: false }, // true if requested by customer
  handled: { type: Boolean, default: false }, // true if installer has accepted/handled
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
