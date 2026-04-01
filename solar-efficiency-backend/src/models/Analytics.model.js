const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  panelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SolarPanel' 
  },
  period: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  
  // Energy Production Data
  energyProduced: {
    total: { type: Number, default: 0 }, // kWh
    daily: [{ date: Date, value: Number }]
  },
  
  // Financial Data
  financialMetrics: {
    totalSavings: { type: Number, default: 0 }, // Currency
    electricityTariff: { type: Number, default: 6.5 }, // Currency per kWh
    systemCost: { type: Number, default: 0 },
    maintenanceCosts: { type: Number, default: 0 },
    roi: { type: Number, default: 0 }, // Percentage
    paybackPeriod: { type: Number, default: 0 }, // Months
    netSavings: { type: Number, default: 0 }
  },
  
  // Carbon Footprint Data
  carbonFootprint: {
    co2Avoided: { type: Number, default: 0 }, // kg CO2
    treesEquivalent: { type: Number, default: 0 },
    carsOffRoad: { type: Number, default: 0 }, // Days
    coalAvoided: { type: Number, default: 0 }, // kg
    gridEmissionFactor: { type: Number, default: 0.82 } // kg CO2 per kWh (India average)
  },
  
  // Performance Metrics
  performanceMetrics: {
    averageEfficiency: { type: Number, default: 0 },
    peakPowerOutput: { type: Number, default: 0 },
    systemUptime: { type: Number, default: 100 }, // Percentage
    capacityFactor: { type: Number, default: 0 } // Percentage
  }
}, { 
  timestamps: true 
});

// Index for faster queries
AnalyticsSchema.index({ userId: 1, 'period.startDate': 1, 'period.endDate': 1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
