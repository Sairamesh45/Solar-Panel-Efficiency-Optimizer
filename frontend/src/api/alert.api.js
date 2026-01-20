import axiosInstance from './axiosInstance';

export const getUserAlerts = async (userId, params = {}) => {
  return await axiosInstance.get(`/alert/user/${userId}`, { params });
};

export const getPanelAlerts = async (panelId) => {
  return await axiosInstance.get(`/alert/panel/${panelId}`);
};

export const getUnresolvedAlerts = async () => {
  return await axiosInstance.get('/alert/unresolved');
};

export const createAlert = async (alertData) => {
  return await axiosInstance.post('/alert', alertData);
};

export const resolveAlert = async (alertId) => {
  return await axiosInstance.patch(`/alert/${alertId}/resolve`);
};

export const markAlertAsRead = async (alertId) => {
  return await axiosInstance.patch(`/alert/${alertId}/read`);
};

export const deleteAlert = async (alertId) => {
  return await axiosInstance.delete(`/alert/${alertId}`);
};
