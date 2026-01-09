import axiosInstance from './axiosInstance';

// Admin-only endpoints would go here
// For now, we'll use the existing endpoints with admin permissions

export const getAllUsers = () => axiosInstance.get('/admin/users');
export const getAllRequests = () => axiosInstance.get('/admin/requests');
export const getStats = () => axiosInstance.get('/admin/stats');
export const updateUserRole = (userId, role) => axiosInstance.put(`/admin/users/${userId}/role`, { role });
export const deleteUser = (userId) => axiosInstance.delete(`/admin/users/${userId}`);
