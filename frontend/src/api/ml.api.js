import axiosInstance from './axiosInstance';

/**
 * Predict solar power output (future implementation)
 */
export const predictSolarOutput = async (data) => {
  return axiosInstance.post('/ml/predict', data);
};

/**
 * Detect anomalies in sensor data
 * @param {Array} sensorData - Array of sensor readings
 * @returns {Promise} Response with anomaly detection results
 */
export const detectAnomalies = async (sensorData) => {
  return axiosInstance.post('/ml/anomaly-detect', { sensor_data: sensorData });
};

/**
 * Predict maintenance needs for panels
 * @param {Array} panelData - Array of panel condition data
 * @returns {Promise} Response with maintenance predictions
 */
export const predictMaintenance = async (panelData) => {
  return axiosInstance.post('/ml/maintenance-predict', { panel_data: panelData });
};
