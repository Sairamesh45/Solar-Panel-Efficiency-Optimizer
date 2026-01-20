const analysisService = require('../services/analysisHistory.service');

// Get user's analysis history
exports.getHistory = async (req, res, next) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const limit = parseInt(req.query.limit) || 20;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    // Try AnalysisHistory first, fallback to SolarRequests
    let history = await analysisService.getByUser(userId, limit);
    
    if (history.length === 0) {
      history = await analysisService.getFromSolarRequests(userId, limit);
    }
    
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

// Get analysis by panel
exports.getByPanel = async (req, res, next) => {
  try {
    const { panelId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const history = await analysisService.getByPanel(panelId, limit);
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

// Compare two analyses
exports.compare = async (req, res, next) => {
  try {
    const { id1, id2 } = req.query;
    
    if (!id1 || !id2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Two analysis IDs are required (id1, id2)' 
      });
    }
    
    // Check if comparing SolarRequests or AnalysisHistory
    const comparison = await analysisService.compare(id1, id2);
    
    if (!comparison) {
      // Fallback: compare from SolarRequests directly
      const SolarRequest = require('../models/SolarRequest.model');
      const [req1, req2] = await Promise.all([
        SolarRequest.findById(id1),
        SolarRequest.findById(id2)
      ]);
      
      if (!req1 || !req2) {
        return res.status(404).json({ success: false, message: 'One or both analyses not found' });
      }
      
      // Build comparison from SolarRequests
      const buildMetrics = (req) => ({
        efficiency: req.result?.efficiency_analysis?.current_efficiency || 0,
        powerOutput: req.result?.efficiency_analysis?.power_output_watts || 0,
        temperatureCoefficient: req.result?.efficiency_analysis?.temperature_coefficient || 0,
        degradationRate: req.result?.efficiency_analysis?.degradation_rate || 0,
        performanceRatio: req.result?.performance_analysis?.performance_ratio || 0,
        systemHealthScore: req.result?.performance_analysis?.system_health_score || 0,
        energyYield: req.result?.production_forecast?.daily_average_kwh || 0
      });
      
      const metrics1 = buildMetrics(req1);
      const metrics2 = buildMetrics(req2);
      
      const differences = {};
      Object.keys(metrics1).forEach(metric => {
        const val1 = metrics1[metric];
        const val2 = metrics2[metric];
        const diff = val2 - val1;
        const percentChange = val1 !== 0 ? ((diff / val1) * 100) : 0;
        
        differences[metric] = {
          value1: val1,
          value2: val2,
          difference: diff,
          percentChange: percentChange.toFixed(2),
          improved: metric === 'degradationRate' ? diff < 0 : diff > 0
        };
      });
      
      return res.status(200).json({ 
        success: true, 
        data: {
          analysis1: {
            _id: req1._id,
            analysisDate: req1.createdAt,
            location: req1.location,
            metrics: metrics1
          },
          analysis2: {
            _id: req2._id,
            analysisDate: req2.createdAt,
            location: req2.location,
            metrics: metrics2
          },
          differences
        }
      });
    }
    
    res.status(200).json({ success: true, data: comparison });
  } catch (error) {
    next(error);
  }
};

// Get trend data
exports.getTrend = async (req, res, next) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const metric = req.query.metric || 'efficiency';
    const limit = parseInt(req.query.limit) || 10;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    // Get from SolarRequests for trend
    const history = await analysisService.getFromSolarRequests(userId, limit);
    
    const trendData = history.reverse().map(h => ({
      date: h.analysisDate,
      value: h.metrics?.[metric] || 0,
      location: h.location?.name || 'Unknown'
    }));
    
    res.status(200).json({ success: true, data: trendData });
  } catch (error) {
    next(error);
  }
};

// Save analysis to history
exports.saveToHistory = async (req, res, next) => {
  try {
    const saved = await analysisService.saveToHistory(req.body);
    res.status(201).json({ 
      success: true, 
      data: saved,
      message: 'Analysis saved to history'
    });
  } catch (error) {
    next(error);
  }
};
