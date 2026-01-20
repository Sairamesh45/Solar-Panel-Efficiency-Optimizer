const weatherService = require('../services/weatherForecast.service');
const Panel = require('../models/SolarPanel.model');
const logger = require('../utils/logger');

/**
 * Get 7-day weather forecast with solar predictions for user's panels
 */
exports.getWeatherForecast = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { panelId } = req.query;

    // Find user's panel to get location data
    let panel;
    if (panelId) {
      panel = await Panel.findOne({ _id: panelId, user: userId });
    } else {
      // Get the first active panel if no panelId provided
      panel = await Panel.findOne({ user: userId }).sort({ createdAt: -1 });
    }

    if (!panel) {
      return res.status(404).json({
        success: false,
        message: 'No solar panel found. Please add a panel first.'
      });
    }

    // Try to extract latitude/longitude from different possible locations
    let latitude, longitude;
    
    // Debug logging
    logger.info('Panel object keys:', Object.keys(panel.toObject ? panel.toObject() : panel));
    logger.info('Panel latitude:', panel.latitude);
    logger.info('Panel longitude:', panel.longitude);
    
    // Check nested location object
    if (panel.location?.latitude && panel.location?.longitude) {
      latitude = panel.location.latitude;
      longitude = panel.location.longitude;
    }
    // Check root level
    else if (panel.latitude && panel.longitude) {
      latitude = panel.latitude;
      longitude = panel.longitude;
    }
    // Check installationDetails
    else if (panel.installationDetails?.latitude && panel.installationDetails?.longitude) {
      latitude = panel.installationDetails.latitude;
      longitude = panel.installationDetails.longitude;
    }
    // Check coordinates array [lat, lng]
    else if (panel.coordinates && Array.isArray(panel.coordinates) && panel.coordinates.length === 2) {
      latitude = panel.coordinates[0];
      longitude = panel.coordinates[1];
    }

    const systemCapacity = panel.capacity || panel.systemCapacity || 5; // Default 5 kW if not specified

    if (!latitude || !longitude) {
      logger.error('Missing location data for panel:', {
        panelId: panel._id,
        availableFields: Object.keys(panel.toObject ? panel.toObject() : panel)
      });
      
      return res.status(400).json({
        success: false,
        message: 'Panel location data is incomplete. Please update your panel information with latitude and longitude.',
        hint: 'Make sure to provide latitude and longitude when adding/updating panels.'
      });
    }

    const forecast = await weatherService.getWeatherForecast(latitude, longitude, systemCapacity);

    res.json({
      success: true,
      data: {
        panel: {
          id: panel._id,
          name: panel.name,
          capacity: systemCapacity,
          location: { latitude, longitude }
        },
        forecast: forecast.forecast,
        summary: forecast.summary,
        recommendations: forecast.recommendations
      }
    });

  } catch (error) {
    logger.error('Weather forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather forecast',
      error: error.message
    });
  }
};
