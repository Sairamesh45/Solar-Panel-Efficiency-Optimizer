const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
  panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'SolarPanel', required: true },
  temperature: Number,
  voltage: Number,
  current: Number,
  power: Number, // Calculated power output in watts
  efficiency: Number, // Panel efficiency percentage
  irradiance: Number,
  dust: Number, // Dust accumulation level (e.g., g/m^2 or index)
  tilt: Number, // Tilt angle in degrees
  shading: Number, // Shading percentage or index
  timestamp: { type: Date, default: Date.now }
});

// Indexes for efficient time-series queries
SensorDataSchema.index({ panelId: 1, timestamp: -1 });
SensorDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model('SensorData', SensorDataSchema);
