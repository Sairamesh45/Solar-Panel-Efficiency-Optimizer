import axiosInstance from './axiosInstance';

export const analyzeSolar = (data) => axiosInstance.post('/solar/analyze', data);
export const getHistory = () => axiosInstance.get('/solar/history');
export const getAnalysisById = (id) => axiosInstance.get(`/solar/analysis/${id}`);
export const deleteAnalysis = (id) => axiosInstance.delete(`/solar/analysis/${id}`);
