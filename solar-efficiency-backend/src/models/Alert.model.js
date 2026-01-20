const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'SolarPanel' },
  type: { type: String, enum: ['info', 'warning', 'critical'] },
  message: String,
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);
