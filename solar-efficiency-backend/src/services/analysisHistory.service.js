const AnalysisHistory = require('../models/AnalysisHistory.model');
const SolarRequest = require('../models/SolarRequest.model');

// Save analysis to history
exports.saveToHistory = async (analysisData) => {
  const history = new AnalysisHistory(analysisData);
  await history.save();
  return history;
};

// Get user's analysis history
exports.getByUser = async (userId, limit = 20) => {
  return AnalysisHistory.find({ userId })
    .populate('panelId', 'name location')
    .sort({ analysisDate: -1 })
    .limit(limit);
};

// Get analysis history for a panel
exports.getByPanel = async (panelId, limit = 20) => {
  return AnalysisHistory.find({ panelId })
    .sort({ analysisDate: -1 })
    .limit(limit);
};

// Get analysis by ID
exports.getById = async (id) => {
  return AnalysisHistory.findById(id)
    .populate('panelId', 'name location');
};

// Compare two analyses
exports.compare = async (id1, id2) => {
  const [analysis1, analysis2] = await Promise.all([
    AnalysisHistory.findById(id1).populate('panelId', 'name location'),
    AnalysisHistory.findById(id2).populate('panelId', 'name location')
  ]);
  
  if (!analysis1 || !analysis2) {
    return null;
  }
  
  // Calculate differences
  const comparison = {
    analysis1,
    analysis2,
    differences: {}
  };
  
  const metrics = ['efficiency', 'powerOutput', 'temperatureCoefficient', 'degradationRate', 'performanceRatio', 'systemHealthScore', 'energyYield'];
  
  metrics.forEach(metric => {
    const val1 = analysis1.metrics?.[metric] || 0;
    const val2 = analysis2.metrics?.[metric] || 0;
    const diff = val2 - val1;
    const percentChange = val1 !== 0 ? ((diff / val1) * 100) : 0;
    
    comparison.differences[metric] = {
      value1: val1,
      value2: val2,
      difference: diff,
      percentChange: percentChange.toFixed(2),
      improved: metric === 'degradationRate' ? diff < 0 : diff > 0
    };
  });
  
  return comparison;
};

// Get trend data for a user (last N analyses)
exports.getTrend = async (userId, metric = 'efficiency', limit = 10) => {
  const analyses = await AnalysisHistory.find({ userId })
    .sort({ analysisDate: -1 })
    .limit(limit)
    .select(`analysisDate metrics.${metric} location.name`);
  
  return analyses.reverse().map(a => ({
    date: a.analysisDate,
    value: a.metrics?.[metric] || 0,
    location: a.location?.name || 'Unknown'
  }));
};

// Get all analyses from SolarRequest for a user (fallback if no AnalysisHistory)
exports.getFromSolarRequests = async (userId, limit = 20) => {
  const requests = await SolarRequest.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
  
  return requests.map(req => ({
    _id: req._id,
    userId: req.userId,
    analysisDate: req.createdAt,
    location: {
      lat: req.location?.lat,
      lon: req.location?.lon,
      name: req.location?.name || `${req.location?.lat}, ${req.location?.lon}`
    },
    metrics: {
      efficiency: req.result?.efficiency_analysis?.current_efficiency,
      powerOutput: req.result?.efficiency_analysis?.power_output_watts,
      temperatureCoefficient: req.result?.efficiency_analysis?.temperature_coefficient,
      degradationRate: req.result?.efficiency_analysis?.degradation_rate,
      performanceRatio: req.result?.performance_analysis?.performance_ratio,
      systemHealthScore: req.result?.performance_analysis?.system_health_score,
      energyYield: req.result?.production_forecast?.daily_average_kwh
    },
    weatherConditions: {
      temperature: req.result?.weather_analysis?.current_conditions?.temperature,
      humidity: req.result?.weather_analysis?.current_conditions?.humidity,
      cloudCover: req.result?.weather_analysis?.current_conditions?.cloud_coverage
    },
    recommendations: req.result?.maintenance_recommendations?.recommended_actions?.map(a => a.action) || [],
    rawAnalysisId: req._id
  }));
};

// Delete analysis from history
exports.delete = async (id) => {
  return AnalysisHistory.findByIdAndDelete(id);
};
