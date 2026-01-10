const Alert = require('../models/Alert.model');
const sendEmail = require('../utils/sendEmail');

// Thresholds for anomalies
const THRESHOLDS = {
  temperature: { min: 0, max: 65 }, // °C
  dust: { max: 100 }, // Example: g/m^2 or index
  shading: { max: 30 }, // %
};

exports.checkAndCreateAlerts = async (sensorData) => {
  const alerts = [];
  const { panelId, temperature, dust, shading } = sensorData;

  if (temperature > THRESHOLDS.temperature.max) {
    alerts.push({
      panelId,
      type: 'warning',
      message: `High panel temperature detected: ${temperature}°C`,
    });
  }
  if (dust > THRESHOLDS.dust.max) {
    alerts.push({
      panelId,
      type: 'warning',
      message: `Excessive dust accumulation detected: ${dust}`,
    });
  }
  if (shading > THRESHOLDS.shading.max) {
    alerts.push({
      panelId,
      type: 'info',
      message: `Shading above normal: ${shading}%`,
    });
  }

  for (const alertData of alerts) {
    const alert = new Alert(alertData);
    await alert.save();
    // Optionally send email notification (add user email lookup as needed)
    // await sendEmail({ email: 'user@example.com', subject: 'Solar Panel Alert', message: alert.message });
  }
  return alerts;
};
