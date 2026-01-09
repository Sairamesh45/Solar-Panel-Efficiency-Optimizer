const mongoose = require('mongoose');

const solarAnalysisResultSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SolarRequest',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  analysis: {
    // System Recommendation
    systemRecommendation: {
      size_kw: Number,
      annual_generation: Number,
      optimal_efficiency: Number,
      peak_power_watts: Number
    },
    
    // Performance Analysis
    performanceAnalysis: {
      efficiency_loss: Number,
      major_issues: [String],
      loss_breakdown: {
        dust: Number,
        shading: Number,
        age: Number,
        temperature: Number
      },
      system_health_score: Number
    },
    
    // Maintenance Info
    maintenance: {
      alert: String,
      priority: String,
      recommended_actions: [{
        action: String,
        impact: String,
        urgency: String
      }]
    },
    
    // Financial Analysis
    financials: {
      yearly_savings: Number,
      monthly_savings: Number,
      payback_years: Number,
      lifetime_savings: Number
    },
    
    // Location (for reference)
    location: {
      city: String,
      state: String,
      coordinates: {
        lat: Number,
        lon: Number
      }
    },
    
    // Metadata
    metadata: {
      analyzed_at: String,
      model_version: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SolarAnalysisResult', solarAnalysisResultSchema);
