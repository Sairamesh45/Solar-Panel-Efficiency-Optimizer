const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'SolarPanel' },
  type: { type: String, enum: ['info', 'warning', 'critical'] },
  message: String,
  isResolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);
