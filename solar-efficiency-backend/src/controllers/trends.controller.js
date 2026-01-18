const trendsService = require('../services/trends.service');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const mongoose = require('mongoose');

/**
 * Get time-series data for a panel
 * GET /api/trends/timeseries/:panelId
 */
const getTimeSeriesData = async (req, res) => {
  try {
    const { panelId } = req.params;
    const { interval = 'hour', limit = 48 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(panelId)) {
      return sendError(res, 'Invalid panel ID', 400);
    }

    const data = await trendsService.getTimeSeriesData(
      new mongoose.Types.ObjectId(panelId),
      interval,
      parseInt(limit)
    );

    successResponse(res, data, 'Time-series data retrieved successfully');
  } catch (error) {
    console.error('Error fetching time-series data:', error);
    errorResponse(res, 'Failed to fetch time-series data', 500);
  }
};

/**
 * Get efficiency decay analysis
 * GET /api/trends/efficiency-decay/:panelId
 */
const getEfficiencyDecay = async (req, res) => {
  try {
    const { panelId } = req.params;
    const { days = 30 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(panelId)) {
      return sendError(res, 'Invalid panel ID', 400);
    }

    const analysis = await trendsService.analyzeEfficiencyDecay(
      new mongoose.Types.ObjectId(panelId),
      parseInt(days)
    );

    successResponse(res, analysis, 'Efficiency decay analysis completed');
  } catch (error) {
    console.error('Error analyzing efficiency decay:', error);
    errorResponse(res, 'Failed to analyze efficiency decay', 500);
  }
};

/**
 * Get dust accumulation pattern
 * GET /api/trends/dust-pattern/:panelId
 */
const getDustPattern = async (req, res) => {
  try {
    const { panelId } = req.params;
    const { days = 30 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(panelId)) {
      return sendError(res, 'Invalid panel ID', 400);
    }

    const analysis = await trendsService.analyzeDustPattern(
      new mongoose.Types.ObjectId(panelId),
      parseInt(days)
    );

    successResponse(res, analysis, 'Dust pattern analysis completed');
  } catch (error) {
    console.error('Error analyzing dust pattern:', error);
    errorResponse(res, 'Failed to analyze dust pattern', 500);
  }
};

/**
 * Get temperature-efficiency correlation
 * GET /api/trends/temperature-correlation/:panelId
 */
const getTemperatureCorrelation = async (req, res) => {
  try {
    const { panelId } = req.params;
    const { days = 30 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(panelId)) {
      return sendError(res, 'Invalid panel ID', 400);
    }

    const analysis = await trendsService.analyzeTemperatureCorrelation(
      new mongoose.Types.ObjectId(panelId),
      parseInt(days)
    );

    successResponse(res, analysis, 'Temperature correlation analysis completed');
  } catch (error) {
    console.error('Error analyzing temperature correlation:', error);
    errorResponse(res, 'Failed to analyze temperature correlation', 500);
  }
};

/**
 * Get maintenance impact analysis
 * GET /api/trends/maintenance-impact/:panelId
 */
const getMaintenanceImpact = async (req, res) => {
  try {
    const { panelId } = req.params;
    const { maintenanceDate, daysBefore = 7, daysAfter = 7 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(panelId)) {
      return sendError(res, 'Invalid panel ID', 400);
    }

    if (!maintenanceDate) {
      return sendError(res, 'Maintenance date is required', 400);
    }

    const analysis = await trendsService.getMaintenanceImpact(
      new mongoose.Types.ObjectId(panelId),
      new Date(maintenanceDate),
      parseInt(daysBefore),
      parseInt(daysAfter)
    );

    successResponse(res, analysis, 'Maintenance impact analysis completed');
  } catch (error) {
    console.error('Error analyzing maintenance impact:', error);
    errorResponse(res, 'Failed to analyze maintenance impact', 500);
  }
};

/**
 * Get all trends analysis for a panel (comprehensive)
 * GET /api/trends/comprehensive/:panelId
 */
const getComprehensiveAnalysis = async (req, res) => {
  try {
    const { panelId } = req.params;
    const { days = 30 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(panelId)) {
        return errorResponse(res, 'Invalid panel ID', 400);
    }

    const panelObjectId = new mongoose.Types.ObjectId(panelId);
    const daysInt = parseInt(days);

    const [timeSeriesData, efficiencyDecay, dustPattern, temperatureCorr] = await Promise.all([
      trendsService.getTimeSeriesData(panelObjectId, 'day', daysInt),
      trendsService.analyzeEfficiencyDecay(panelObjectId, daysInt),
      trendsService.analyzeDustPattern(panelObjectId, daysInt),
      trendsService.analyzeTemperatureCorrelation(panelObjectId, daysInt)
    ]);

    const analysis = {
      panelId,
      period: { days: daysInt },
      timeSeries: timeSeriesData,
      efficiencyDecay,
      dustPattern,
      temperatureCorrelation: temperatureCorr
    };

      successResponse(res, analysis, 'Comprehensive trends analysis completed');
  } catch (error) {
    console.error('Error in comprehensive analysis:', error);
      errorResponse(res, 'Failed to complete comprehensive analysis', 500);
  }
};

module.exports = {
  getTimeSeriesData,
  getEfficiencyDecay,
  getDustPattern,
  getTemperatureCorrelation,
  getMaintenanceImpact,
  getComprehensiveAnalysis
};
