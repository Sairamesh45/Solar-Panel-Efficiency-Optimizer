import axiosInstance from './axiosInstance';

export const getSensorData = (params = {}) => {
  const queryString = params.panelId ? `?panelId=${params.panelId}` : '';
  return axiosInstance.get(`/sensor${queryString}`);
};
// Optionally: export const postSensorData = (data) => axiosInstance.post('/sensor', data);
