const mongoose = require('mongoose');

// This model stores analysis snapshots for historical comparison
const AnalysisHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  panelId: { type: mongoose.Schema.Types.ObjectId, ref: 'SolarPanel' },
  analysisDate: { type: Date, default: Date.now },
  location: {
    lat: Number,
    lon: Number,
    name: String
  },
  metrics: {
    efficiency: Number,
    powerOutput: Number,
    temperatureCoefficient: Number,
    degradationRate: Number,
    performanceRatio: Number,
    systemHealthScore: Number,
    energyYield: Number
  },
  weatherConditions: {
    temperature: Number,
    humidity: Number,
    cloudCover: Number,
    windSpeed: Number
  },
  recommendations: [String],
  rawAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'SolarRequest' },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying
AnalysisHistorySchema.index({ userId: 1, analysisDate: -1 });
AnalysisHistorySchema.index({ panelId: 1, analysisDate: -1 });

module.exports = mongoose.model('AnalysisHistory', AnalysisHistorySchema);
