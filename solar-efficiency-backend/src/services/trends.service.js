const SensorData = require('../models/SensorData.model');
const Maintenance = require('../models/SolarRequest.model'); // For maintenance impact analysis

/**
 * Get time-series sensor data aggregated by hour or day
 * @param {String} panelId - Panel ID
 * @param {String} interval - 'hour' or 'day'
 * @param {Number} limit - Number of data points to return
 */
const getTimeSeriesData = async (panelId, interval = 'hour', limit = 48) => {
  const groupBy = interval === 'day' 
    ? {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
        day: { $dayOfMonth: '$timestamp' }
      }
    : {
        year: { $year: '$timestamp' },
        month: { $month: '$timestamp' },
        day: { $dayOfMonth: '$timestamp' },
        hour: { $hour: '$timestamp' }
      };

  const data = await SensorData.aggregate([
    { $match: { panelId: panelId } },
    { $sort: { timestamp: -1 } },
    { $limit: limit * 10 }, // Get more raw data for aggregation
    {
      $group: {
        _id: groupBy,
        avgTemperature: { $avg: '$temperature' },
        avgPower: { $avg: '$power' },
        avgEfficiency: { $avg: '$efficiency' },
        avgDust: { $avg: '$dust' },
        avgShading: { $avg: '$shading' },
        avgIrradiance: { $avg: '$irradiance' },
        maxPower: { $max: '$power' },
        minPower: { $min: '$power' },
        count: { $sum: 1 },
        timestamp: { $first: '$timestamp' }
      }
    },
    { $sort: { timestamp: -1 } },
    { $limit: limit }
  ]);

  return data.map(d => ({
    timestamp: d.timestamp,
    temperature: Math.round(d.avgTemperature * 100) / 100,
    power: Math.round(d.avgPower * 100) / 100,
    efficiency: Math.round(d.avgEfficiency * 100) / 100,
    dust: Math.round(d.avgDust * 100) / 100,
    shading: Math.round(d.avgShading * 100) / 100,
    irradiance: Math.round(d.avgIrradiance * 100) / 100,
    maxPower: Math.round(d.maxPower * 100) / 100,
    minPower: Math.round(d.minPower * 100) / 100
  })).reverse();
};

/**
 * Analyze efficiency decay over time
 * @param {String} panelId - Panel ID
 * @param {Number} days - Number of days to analyze
 */
const analyzeEfficiencyDecay = async (panelId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const data = await SensorData.find({
    panelId,
    timestamp: { $gte: startDate }
  }).sort({ timestamp: 1 });

  if (data.length < 2) {
    return {
      trend: 'insufficient_data',
      decayRate: 0,
      currentEfficiency: 0,
      initialEfficiency: 0
    };
  }

  // Calculate average efficiency for first 20% and last 20% of data
  const firstChunk = data.slice(0, Math.floor(data.length * 0.2));
  const lastChunk = data.slice(-Math.floor(data.length * 0.2));

  const initialEfficiency = firstChunk.reduce((sum, d) => sum + d.efficiency, 0) / firstChunk.length;
  const currentEfficiency = lastChunk.reduce((sum, d) => sum + d.efficiency, 0) / lastChunk.length;

  const decayRate = ((initialEfficiency - currentEfficiency) / initialEfficiency) * 100;
  
  let trend = 'stable';
  if (decayRate > 5) trend = 'declining';
  else if (decayRate < -2) trend = 'improving';

  return {
    trend,
    decayRate: Math.round(decayRate * 100) / 100,
    currentEfficiency: Math.round(currentEfficiency * 100) / 100,
    initialEfficiency: Math.round(initialEfficiency * 100) / 100,
    dataPoints: data.length,
    periodDays: days
  };
};

/**
 * Analyze dust accumulation pattern
 * @param {String} panelId - Panel ID
 * @param {Number} days - Number of days to analyze
 */
const analyzeDustPattern = async (panelId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const data = await SensorData.aggregate([
    {
      $match: {
        panelId,
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        avgDust: { $avg: '$dust' },
        timestamp: { $first: '$timestamp' }
      }
    },
    { $sort: { timestamp: 1 } }
  ]);

  if (data.length < 2) {
    return {
      pattern: 'insufficient_data',
      accumulationRate: 0,
      currentLevel: 0,
      averageLevel: 0
    };
  }

  const dailyDust = data.map(d => d.avgDust);
  const currentLevel = dailyDust[dailyDust.length - 1];
  const initialLevel = dailyDust[0];
  const averageLevel = dailyDust.reduce((sum, val) => sum + val, 0) / dailyDust.length;

  // Calculate accumulation rate per day
  const accumulationRate = (currentLevel - initialLevel) / days;

  let pattern = 'stable';
  if (accumulationRate > 1) pattern = 'increasing';
  else if (accumulationRate < -0.5) pattern = 'decreasing';

  // Check for maintenance events (sudden drops in dust level)
  const maintenanceEvents = [];
  for (let i = 1; i < dailyDust.length; i++) {
    if (dailyDust[i - 1] - dailyDust[i] > 20) {
      maintenanceEvents.push({
        date: data[i].timestamp,
        dustBefore: Math.round(dailyDust[i - 1] * 100) / 100,
        dustAfter: Math.round(dailyDust[i] * 100) / 100
      });
    }
  }

  return {
    pattern,
    accumulationRate: Math.round(accumulationRate * 100) / 100,
    currentLevel: Math.round(currentLevel * 100) / 100,
    averageLevel: Math.round(averageLevel * 100) / 100,
    maintenanceEvents,
    dataPoints: data.length,
    periodDays: days
  };
};

/**
 * Analyze temperature-efficiency correlation
 * @param {String} panelId - Panel ID
 * @param {Number} days - Number of days to analyze
 */
const analyzeTemperatureCorrelation = async (panelId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const data = await SensorData.find({
    panelId,
    timestamp: { $gte: startDate }
  }).select('temperature efficiency power').sort({ timestamp: 1 });

  if (data.length < 10) {
    return {
      correlation: 'insufficient_data',
      coefficient: 0,
      temperatureRange: { min: 0, max: 0 },
      efficiencyRange: { min: 0, max: 0 }
    };
  }

  // Calculate correlation coefficient between temperature and efficiency
  const temps = data.map(d => d.temperature);
  const efficiencies = data.map(d => d.efficiency);

  const avgTemp = temps.reduce((sum, val) => sum + val, 0) / temps.length;
  const avgEff = efficiencies.reduce((sum, val) => sum + val, 0) / efficiencies.length;

  let numerator = 0;
  let denomTemp = 0;
  let denomEff = 0;

  for (let i = 0; i < temps.length; i++) {
    const tempDiff = temps[i] - avgTemp;
    const effDiff = efficiencies[i] - avgEff;
    numerator += tempDiff * effDiff;
    denomTemp += tempDiff * tempDiff;
    denomEff += effDiff * effDiff;
  }

  const coefficient = numerator / Math.sqrt(denomTemp * denomEff);

  let correlation = 'weak';
  if (Math.abs(coefficient) > 0.7) correlation = 'strong';
  else if (Math.abs(coefficient) > 0.4) correlation = 'moderate';

  const correlationType = coefficient < 0 ? 'negative' : 'positive';

  return {
    correlation,
    correlationType,
    coefficient: Math.round(coefficient * 1000) / 1000,
    temperatureRange: {
      min: Math.round(Math.min(...temps) * 100) / 100,
      max: Math.round(Math.max(...temps) * 100) / 100,
      avg: Math.round(avgTemp * 100) / 100
    },
    efficiencyRange: {
      min: Math.round(Math.min(...efficiencies) * 100) / 100,
      max: Math.round(Math.max(...efficiencies) * 100) / 100,
      avg: Math.round(avgEff * 100) / 100
    },
    dataPoints: data.length,
    periodDays: days
  };
};

/**
 * Get maintenance impact analysis (before/after comparison)
 * @param {String} panelId - Panel ID
 * @param {Date} maintenanceDate - Date of maintenance
 * @param {Number} daysBefore - Days to analyze before maintenance
 * @param {Number} daysAfter - Days to analyze after maintenance
 */
const getMaintenanceImpact = async (panelId, maintenanceDate, daysBefore = 7, daysAfter = 7) => {
  const maintenanceTime = new Date(maintenanceDate);
  
  const beforeStart = new Date(maintenanceTime);
  beforeStart.setDate(beforeStart.getDate() - daysBefore);
  
  const afterEnd = new Date(maintenanceTime);
  afterEnd.setDate(afterEnd.getDate() + daysAfter);

  const beforeData = await SensorData.find({
    panelId,
    timestamp: { $gte: beforeStart, $lt: maintenanceTime }
  }).sort({ timestamp: 1 });

  const afterData = await SensorData.find({
    panelId,
    timestamp: { $gte: maintenanceTime, $lte: afterEnd }
  }).sort({ timestamp: 1 });

  if (beforeData.length === 0 || afterData.length === 0) {
    return {
      status: 'insufficient_data',
      improvement: {}
    };
  }

  const calcAvg = (data, field) => {
    const sum = data.reduce((acc, d) => acc + (d[field] || 0), 0);
    return Math.round((sum / data.length) * 100) / 100;
  };

  const beforeAvg = {
    power: calcAvg(beforeData, 'power'),
    efficiency: calcAvg(beforeData, 'efficiency'),
    dust: calcAvg(beforeData, 'dust'),
    temperature: calcAvg(beforeData, 'temperature')
  };

  const afterAvg = {
    power: calcAvg(afterData, 'power'),
    efficiency: calcAvg(afterData, 'efficiency'),
    dust: calcAvg(afterData, 'dust'),
    temperature: calcAvg(afterData, 'temperature')
  };

  const improvement = {
    power: Math.round(((afterAvg.power - beforeAvg.power) / beforeAvg.power) * 100 * 100) / 100,
    efficiency: Math.round(((afterAvg.efficiency - beforeAvg.efficiency) / beforeAvg.efficiency) * 100 * 100) / 100,
    dust: Math.round(((beforeAvg.dust - afterAvg.dust) / beforeAvg.dust) * 100 * 100) / 100
  };

  return {
    status: 'analyzed',
    maintenanceDate: maintenanceTime,
    before: beforeAvg,
    after: afterAvg,
    improvement,
    beforeDataPoints: beforeData.length,
    afterDataPoints: afterData.length
  };
};

module.exports = {
  getTimeSeriesData,
  analyzeEfficiencyDecay,
  analyzeDustPattern,
  analyzeTemperatureCorrelation,
  getMaintenanceImpact
};
