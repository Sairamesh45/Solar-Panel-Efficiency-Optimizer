import axiosInstance from './axiosInstance';

/**
 * Generate analytics for a period
 */
export const generateAnalytics = async (data) => {
  const response = await axiosInstance.post('/analytics/generate', data);
  return response.data;
};

/**
 * Get analytics
 */
export const getAnalytics = async (params) => {
  const response = await axiosInstance.get('/analytics', { params });
  return response.data;
};

/**
 * Get cumulative analytics
 */
export const getCumulativeAnalytics = async (panelId = null) => {
  const params = panelId ? { panelId } : {};
  const response = await axiosInstance.get('/analytics/cumulative', { params });
  return response.data;
};

/**
 * Get cost savings
 */
export const getCostSavings = async (params) => {
  const response = await axiosInstance.get('/analytics/cost-savings', { params });
  return response.data;
};

/**
 * Get carbon footprint
 */
export const getCarbonFootprint = async (params) => {
  const response = await axiosInstance.get('/analytics/carbon-footprint', { params });
  return response.data;
};

/**
 * Download PDF report
 */
export const downloadPDFReport = async (params) => {
  const response = await axiosInstance.get('/analytics/report/pdf', {
    params,
    responseType: 'blob'
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `solar-analytics-${Date.now()}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return { success: true };
};

/**
 * Download Excel report
 */
export const downloadExcelReport = async (params) => {
  const response = await axiosInstance.get('/analytics/report/excel', {
    params,
    responseType: 'blob'
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `solar-analytics-${Date.now()}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return { success: true };
};
