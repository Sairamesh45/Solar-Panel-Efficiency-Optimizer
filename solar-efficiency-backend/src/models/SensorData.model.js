const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
  panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'SolarPanel', required: true },
  temperature: Number,
  voltage: Number,
  current: Number,
  irradiance: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SensorData', SensorDataSchema);
