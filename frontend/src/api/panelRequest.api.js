import axiosInstance from './axiosInstance';

export const createPanelRequest = (data) => axiosInstance.post('/panel-request', data);
export const getPanelRequests = () => axiosInstance.get('/panel-request');
export const updatePanelRequestStatus = (id, status) => axiosInstance.post('/panel-request/status', { id, status });
