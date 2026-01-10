import axiosInstance from './axiosInstance';

/**
 * Get time-series data for a panel
 */
export const getTimeSeriesData = async (panelId, interval = 'hour', limit = 48) => {
  const response = await axiosInstance.get(`/trends/timeseries/${panelId}`, {
    params: { interval, limit }
  });
  return response.data;
};

/**
 * Get efficiency decay analysis
 */
export const getEfficiencyDecay = async (panelId, days = 30) => {
  const response = await axiosInstance.get(`/trends/efficiency-decay/${panelId}`, {
    params: { days }
  });
  return response.data;
};

/**
 * Get dust accumulation pattern
 */
export const getDustPattern = async (panelId, days = 30) => {
  const response = await axiosInstance.get(`/trends/dust-pattern/${panelId}`, {
    params: { days }
  });
  return response.data;
};

/**
 * Get temperature-efficiency correlation
 */
export const getTemperatureCorrelation = async (panelId, days = 30) => {
  const response = await axiosInstance.get(`/trends/temperature-correlation/${panelId}`, {
    params: { days }
  });
  return response.data;
};

/**
 * Get maintenance impact analysis
 */
export const getMaintenanceImpact = async (panelId, maintenanceDate, daysBefore = 7, daysAfter = 7) => {
  const response = await axiosInstance.get(`/trends/maintenance-impact/${panelId}`, {
    params: { maintenanceDate, daysBefore, daysAfter }
  });
  return response.data;
};

/**
 * Get comprehensive trends analysis
 */
export const getComprehensiveAnalysis = async (panelId, days = 30) => {
  const response = await axiosInstance.get(`/trends/comprehensive/${panelId}`, {
    params: { days }
  });
  return response.data;
};
