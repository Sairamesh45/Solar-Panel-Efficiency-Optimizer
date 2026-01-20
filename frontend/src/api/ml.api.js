import axiosInstance from './axiosInstance';

/**
 * Get ML model metrics and evaluation report
 */
export const getMLModelMetrics = async () => {
  return axiosInstance.get('/ml/metrics');
};

/**
 * Predict solar power output (future implementation)
 */
export const predictSolarOutput = async (data) => {
  return axiosInstance.post('/ml/predict', data);
};
