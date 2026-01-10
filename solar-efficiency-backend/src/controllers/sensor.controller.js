const SensorData = require('../models/SensorData.model');
const SolarPanel = require('../models/SolarPanel.model');
const alertService = require('../services/alert.service');
const axios = require('axios');
const logger = require('../utils/logger');

// Cache for NASA POWER API data
const nasaDataCache = new Map();
const CACHE_DURATION = 3600000; // 1 hour

// Fetch real solar data from NASA POWER API
const fetchNASAPowerData = async (latitude, longitude) => {
  const cacheKey = `${latitude},${longitude}`;
  const cached = nasaDataCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }
  
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const url = `https://power.larc.nasa.gov/api/temporal/hourly/point?parameters=ALLSKY_SFC_SW_DWN,T2M&community=RE&longitude=${longitude}&latitude=${latitude}&start=${dateStr}&end=${dateStr}&format=JSON`;
    
    const response = await axios.get(url, { timeout: 10000 });
    const parameters = response.data.properties.parameter;
    
    const hour = today.getHours().toString().padStart(2, '0');
    const hourKey = `${dateStr}${hour}`;
    
    const data = {
      irradiance: parameters.ALLSKY_SFC_SW_DWN?.[hourKey] || 0,
      temperature: parameters.T2M?.[hourKey] || 25
    };
    
    nasaDataCache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    logger.error('Error fetching NASA POWER data:', error.message);
    return null;
  }
};

// Generate sensor data for a panel
const generateSensorData = async (panel, baseEfficiency = 18, panelIndex = 0) => {
  const hour = new Date().getHours();
  const latitude = panel.latitude || 19.07;
  const longitude = panel.longitude || 72.87;
  
  // Create a panel-specific seed for consistent variation
  const panelSeed = panel._id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRandom = (min, max) => {
    const x = Math.sin(panelSeed + Date.now() + panelIndex) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };
  
  const nasaData = await fetchNASAPowerData(latitude, longitude);
  
  let irradiance, temperature;
  
  if (nasaData) {
    // Check for invalid NASA data values
    const rawIrradiance = nasaData.irradiance;
    const rawTemp = nasaData.temperature;
    
    // NASA returns -999 or other negative values for missing/invalid data
    if (rawIrradiance !== undefined && rawIrradiance !== null && rawIrradiance >= 0 && rawIrradiance < 2000) {
      irradiance = rawIrradiance + seededRandom(-50, 50);
      irradiance = Math.max(0, irradiance);
    } else {
      // Use fallback simulation for invalid irradiance
      irradiance = 0;
      if (hour >= 6 && hour <= 18) {
        const hourFromNoon = Math.abs(hour - 12);
        irradiance = Math.max(0, 1000 - (hourFromNoon * 80)) + seededRandom(-100, 100);
      }
    }
    
    // Check temperature validity
    if (rawTemp !== undefined && rawTemp !== null && rawTemp >= -50 && rawTemp <= 80 && rawTemp !== -999 && rawTemp !== -1000) {
      temperature = rawTemp + seededRandom(-3, 7);
    } else {
      const baseTemp = 25 + (irradiance / 50) + seededRandom(-5, 10);
      temperature = Math.max(15, Math.min(75, baseTemp));
    }
  } else {
    irradiance = 0;
    if (hour >= 6 && hour <= 18) {
      const hourFromNoon = Math.abs(hour - 12);
      irradiance = Math.max(0, 1000 - (hourFromNoon * 80)) + seededRandom(-100, 100);
    }
    const baseTemp = 25 + (irradiance / 50) + seededRandom(-5, 10);
    temperature = Math.max(15, Math.min(75, baseTemp));
  }
  
  // Dust accumulates slowly over time - fetch last value and increment
  let dust = 0;
  try {
    const last = await SensorData.findOne({ panelId: panel._id }).sort({ timestamp: -1 });
    if (last && typeof last.dust === 'number') {
      // Increase dust by 0.1-0.5 per reading, max 100
      dust = Math.min(100, last.dust + (Math.random() * 0.4 + 0.1));
    } else {
      // If no previous data, start with a random value
      dust = Math.random() * 10 + 20;
    }
  } catch (e) {
    dust = Math.random() * 10 + 20;
  }
  const shading = seededRandom(0, 35);
  const voltage = irradiance > 0 ? 30 + seededRandom(-5, 10) : 0;
  const current = irradiance > 0 ? (irradiance / 25) + seededRandom(-1, 3) : 0;
  const power = voltage * current;
  
  const tempLoss = (temperature - 25) * 0.4;
  const dustLoss = dust * 0.1;
  const shadingLoss = shading * 0.5;
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

exports.getSensorData = async (req, res, next) => {
  try {
    const { panelId } = req.query;
    const query = panelId ? { panelId } : {};
    const sensorData = await SensorData.find(query).sort({ timestamp: -1 }).limit(100);
    res.status(200).json({ success: true, data: sensorData });
  } catch (error) {
    next(error);
  }
};

exports.createSensorData = async (req, res, next) => {
  try {
    const { panelId, temperature, voltage, current, irradiance, dust, tilt, shading, timestamp } = req.body;
    const sensorData = new SensorData({
      panelId,
      temperature,
      voltage,
      current,
      irradiance,
      dust,
      tilt,
      shading,
      timestamp
    });
    await sensorData.save();
    // Check for anomalies and create alerts
    await alertService.checkAndCreateAlerts(sensorData);
    res.status(201).json({ message: 'Sensor data created', data: sensorData });
  } catch (error) {
    next(error);
  }
};

// Manual trigger to generate sensor data now (for testing)
exports.generateSensorDataNow = async (req, res, next) => {
  try {
    const panels = await SolarPanel.find();
    
    if (panels.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No panels found to generate data for' 
      });
    }
    
    const sensorDataPromises = panels.map((panel, index) => generateSensorData(panel, 18, index));
    const sensorDataBatch = await Promise.all(sensorDataPromises);
    
    await SensorData.insertMany(sensorDataBatch);
    
    logger.info(`Manually generated sensor data for ${panels.length} panels using NASA POWER API`);
    
    res.status(200).json({ 
      success: true, 
      message: `Generated sensor data for ${panels.length} panels`,
      data: sensorDataBatch
    });
  } catch (error) {
    next(error);
  }
};
