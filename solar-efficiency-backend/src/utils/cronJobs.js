const cron = require('node-cron');
const axios = require('axios');
const SensorData = require('../models/SensorData.model');
const SolarPanel = require('../models/SolarPanel.model');
const logger = require('./logger');

// Cache for NASA POWER API data (to avoid excessive API calls)
const nasaDataCache = new Map();
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Fetch real solar irradiance and temperature from Open-Meteo API
const fetchOpenMeteoData = async (latitude, longitude) => {
  const cacheKey = `openmeteo:${latitude},${longitude}`;
  const cached = nasaDataCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }
  try {
    // Open-Meteo API - Solar radiation and temperature (current hour)
    // Docs: https://open-meteo.com/en/docs
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,shortwave_radiation&timezone=auto`;
    const response = await axios.get(url, { timeout: 10000 });
    const { hourly } = response.data;
    if (!hourly || !hourly.time) return null;
    // Find the index for the current hour
    const now = new Date();
    const hourStr = now.toISOString().slice(0, 13); // e.g. '2026-01-09T14'
    const idx = hourly.time.findIndex(t => t.startsWith(hourStr));
    if (idx === -1) return null;
    const data = {
      temperature: Array.isArray(hourly.temperature_2m) ? hourly.temperature_2m[idx] : 25,
      irradiance: Array.isArray(hourly.shortwave_radiation) ? hourly.shortwave_radiation[idx] : 0
    };
    nasaDataCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    logger.error('Error fetching Open-Meteo data:', error.message);
    return null;
  }
};

// Generate realistic sensor data with NASA POWER API integration
const generateSensorData = async (panel, baseEfficiency = 18, panelIndex = 0) => {
  const hour = new Date().getHours();
  // Extract coordinates from panel location or use default (Mumbai coordinates as fallback)
  const latitude = panel.latitude || 19.07;
  const longitude = panel.longitude || 72.87;
  // Panel-specific seed for consistent variation
  const panelSeed = panel._id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  // Deterministic seeded random (no Date.now)
  let randomStep = 0;
  const seededRandom = (min, max) => {
    randomStep += 1;
    const x = Math.sin(panelSeed + panelIndex * 100 + randomStep) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };
  // Get last sensor data for this panel
  let last = null;
  try {
    last = await SensorData.findOne({ panelId: panel._id }).sort({ timestamp: -1 });
  } catch (e) {
    last = null;
  }
  // Fetch real data from Open-Meteo API
  const meteoData = await fetchOpenMeteoData(latitude, longitude);
  // Use previous values as base, or meteo, or defaults
  let prevIrr = last?.irradiance ?? (meteoData?.irradiance ?? 500);
  let prevTemp = last?.temperature ?? (meteoData?.temperature ?? 30);
  // Clamp helpers
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  // Irradiance: allow max ±10% change per reading
  let targetIrr = meteoData?.irradiance ?? prevIrr;
  let deltaIrr = clamp(targetIrr - prevIrr, -prevIrr * 0.1, prevIrr * 0.1);
  let irradiance = clamp(prevIrr + deltaIrr + seededRandom(-10, 10), 0, 1200);
  // Temperature: allow max ±2°C change per reading
  let targetTemp = meteoData?.temperature ?? prevTemp;
  let deltaTemp = clamp(targetTemp - prevTemp, -2, 2);
  let temperature = clamp(prevTemp + deltaTemp + seededRandom(-0.5, 0.5), -20, 80);
  
  // Dust accumulates slowly over time
  let dust = 0;
  if (last && typeof last.dust === 'number') {
    // Only increase dust by 0.1-0.5 per reading, max 100
    const dustIncrease = seededRandom(0.1, 0.5);
    dust = Math.min(100, last.dust + dustIncrease);
  } else {
    dust = seededRandom(20, 30);
  }
  
  // Shading varies by panel position and surroundings, but clamp change
  let prevShading = last?.shading ?? 20;
  let shading = clamp(prevShading + seededRandom(-2, 2), 0, 35);
  // Voltage and current based on irradiance, clamp change
  let prevVoltage = last?.voltage ?? 35;
  let prevCurrent = last?.current ?? 5;
  // Voltage: base on irradiance, allow ±1V change
  let voltage = irradiance > 0 ? clamp(prevVoltage + (irradiance - prevIrr) * 0.01 + seededRandom(-1, 1), 28, 45) : 0;
  // Current: base on irradiance, allow ±0.5A change
  let current = irradiance > 0 ? clamp(prevCurrent + (irradiance - prevIrr) * 0.005 + seededRandom(-0.5, 0.5), 0, 40) : 0;
  
  // Power = Voltage * Current
  const power = voltage * current;
  
  // Efficiency decreases with temperature, dust, and shading
  const tempLoss = (temperature - 25) * 0.4; // 0.4% per degree above 25°C
  const dustLoss = dust * 0.1; // Dust impact
  const shadingLoss = shading * 0.5; // Shading impact
  const efficiency = Math.max(0, baseEfficiency - (tempLoss + dustLoss + shadingLoss) / 10);
  
  // Add time offset for each panel (1 second per panel so it's visible in display)
  const timestamp = new Date(Date.now() + (panelIndex * 1000));
  
  return {
    panelId: panel._id,
    temperature: Math.round(temperature * 100) / 100,
    voltage: Math.round(voltage * 100) / 100,
    current: Math.round(current * 100) / 100,
    power: Math.round(power * 100) / 100,
    efficiency: Math.round(efficiency * 100) / 100,
    irradiance: Math.round(irradiance * 100) / 100,
    dust: Math.round(dust * 100) / 100,
    tilt: panel.tilt || 30,
    shading: Math.round(shading * 100) / 100,
    timestamp
  };
};

// Stream sensor data for all panels
const streamSensorData = async () => {
  try {
    const panels = await SolarPanel.find();
    
    if (panels.length === 0) {
      return;
    }
    
    // Generate sensor data with async NASA API calls, passing index for unique timestamps
    const sensorDataPromises = panels.map((panel, index) => generateSensorData(panel, 18, index));
    const sensorDataBatch = await Promise.all(sensorDataPromises);
    
    await SensorData.insertMany(sensorDataBatch);
    
    logger.info(`Generated sensor data for ${panels.length} panels using NASA POWER API`);
  } catch (error) {
    logger.error('Error streaming sensor data:', error);
  }
};

const initCronJobs = () => {
  // Generate sensor data every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    logger.info('Running sensor data streaming job');
    streamSensorData();
  });
  
  // Daily maintenance check at midnight
  cron.schedule('0 0 * * *', () => {
    logger.info('Running daily maintenance check');
  });
  
  // Initial data generation on startup
  setTimeout(() => {
    logger.info('Generating initial sensor data');
    streamSensorData();
  }, 5000);
};

module.exports = initCronJobs;
