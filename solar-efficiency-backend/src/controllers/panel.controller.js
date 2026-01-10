const Panel = require('../models/SolarPanel.model');
const SensorData = require('../models/SensorData.model');

exports.getPanels = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const query = userId ? { userId } : {};
    const panels = await Panel.find(query);
    res.status(200).json({ success: true, data: panels });
  } catch (err) {
    next(err);
  }
};


exports.createPanel = async (req, res, next) => {
  try {
    const { userId, name, location, wattage, brand, installationDate } = req.body;
    const panel = new Panel({
      userId,
      name,
      location,
      installationDate: installationDate || new Date(),
      specifications: { wattage, brand }
    });
    await panel.save();
    res.status(201).json({ success: true, data: panel });
  } catch (err) {
    next(err);
  }
};

// Delete a panel by ID
exports.deletePanel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Panel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Panel not found' });
    }
    res.status(200).json({ success: true, message: 'Panel deleted' });
  } catch (err) {
    next(err);
  }
};

// Assign installer to panel creation request
exports.assignInstaller = async (req, res, next) => {
  try {
    const { panelId, installerId } = req.body;
    // You may want to update the panel or a related request with installerId
    const panel = await Panel.findByIdAndUpdate(panelId, { installerId }, { new: true });
    if (!panel) {
      return res.status(404).json({ success: false, message: 'Panel not found' });
    }
    res.status(200).json({ success: true, data: panel });
  } catch (err) {
    next(err);
  }
};

// Compare multiple panels with metrics
exports.comparePanels = async (req, res, next) => {
  try {
    const { panelIds } = req.query; // comma-separated IDs
    
    if (!panelIds) {
      return res.status(400).json({ success: false, message: 'Panel IDs are required' });
    }
    
    const ids = panelIds.split(',');
    const panels = await Panel.find({ _id: { $in: ids } });
    
    if (!panels.length) {
      return res.status(404).json({ success: false, message: 'No panels found' });
    }
    
    // Fetch sensor data and calculate metrics for each panel
    const comparisonData = await Promise.all(
      panels.map(async (panel) => {
        const sensorData = await SensorData.find({ panelId: panel._id }).sort({ timestamp: -1 }).limit(100);
        
        // Calculate metrics
        const avgTemperature = sensorData.length ? sensorData.reduce((sum, s) => sum + (s.temperature || 0), 0) / sensorData.length : 0;
        const avgDust = sensorData.length ? sensorData.reduce((sum, s) => sum + (s.dust || 0), 0) / sensorData.length : 0;
        const avgShading = sensorData.length ? sensorData.reduce((sum, s) => sum + (s.shading || 0), 0) / sensorData.length : 0;
        const avgVoltage = sensorData.length ? sensorData.reduce((sum, s) => sum + (s.voltage || 0), 0) / sensorData.length : 0;
        const avgCurrent = sensorData.length ? sensorData.reduce((sum, s) => sum + (s.current || 0), 0) / sensorData.length : 0;
        
        // Calculate power output (P = V * I)
        const avgPowerOutput = avgVoltage * avgCurrent;
        
        // Calculate efficiency score (0-100) based on ideal conditions
        const tempEfficiency = Math.max(0, 100 - Math.abs(25 - avgTemperature) * 2); // Ideal: 25°C
        const dustEfficiency = Math.max(0, 100 - avgDust); // Ideal: 0 dust
        const shadingEfficiency = Math.max(0, 100 - avgShading); // Ideal: 0% shading
        const overallEfficiency = (tempEfficiency + dustEfficiency + shadingEfficiency) / 3;
        
        // Calculate downtime (sensors with critical issues)
        const criticalReadings = sensorData.filter(s => 
          s.temperature > 65 || s.dust > 100 || s.shading > 50
        ).length;
        const downtimePercentage = sensorData.length ? (criticalReadings / sensorData.length) * 100 : 0;
        
        return {
          panel: {
            _id: panel._id,
            name: panel.name,
            location: panel.location,
            wattage: panel.specifications?.wattage,
            brand: panel.specifications?.brand,
            installationDate: panel.installationDate
          },
          metrics: {
            avgTemperature: Math.round(avgTemperature * 100) / 100,
            avgDust: Math.round(avgDust * 100) / 100,
            avgShading: Math.round(avgShading * 100) / 100,
            avgPowerOutput: Math.round(avgPowerOutput * 100) / 100,
            overallEfficiency: Math.round(overallEfficiency * 100) / 100,
            downtimePercentage: Math.round(downtimePercentage * 100) / 100,
            totalReadings: sensorData.length,
            criticalReadings
          },
          latestReading: sensorData[0] || null
        };
      })
    );
    
    res.status(200).json({ success: true, data: comparisonData });
  } catch (err) {
    next(err);
  }
};
