import axiosInstance from './axiosInstance';

export const getPanels = (userId) => {
	if (userId) {
		return axiosInstance.get(`/panel?userId=${userId}`);
	}
	return axiosInstance.get('/panel');
};
