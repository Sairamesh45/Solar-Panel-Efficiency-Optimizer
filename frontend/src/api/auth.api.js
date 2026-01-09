import axiosInstance from './axiosInstance';

export const login = (data) => axiosInstance.post('/auth/login', data);
export const register = (data) => axiosInstance.post('/auth/register', data);
export const getMe = () => axiosInstance.get('/auth/me');
export const logout = () => axiosInstance.get('/auth/logout');
