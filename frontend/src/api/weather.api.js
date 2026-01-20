import axiosInstance from './axiosInstance';

/**
 * Get 7-day weather forecast with solar predictions
 * @param {string} panelId - Optional panel ID, uses first panel if not provided
 * @returns {Promise} Weather forecast data
 */
export const getWeatherForecast = async (panelId = null) => {
  try {
    const params = panelId ? { panelId } : {};
    const response = await axiosInstance.get('/weather/forecast', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};
