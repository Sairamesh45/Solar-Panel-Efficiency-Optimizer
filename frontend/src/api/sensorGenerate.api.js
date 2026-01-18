import axiosInstance from './axiosInstance';

export const generateSensorDataNow = () => axiosInstance.post('/sensor/generate');
