const mongoose = require('mongoose');

const PerformanceSchema = new mongoose.Schema({
  panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'SolarPanel' },
  efficiency: Number,
  powerOutput: Number,
  predictedEfficiency: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Performance', PerformanceSchema);
