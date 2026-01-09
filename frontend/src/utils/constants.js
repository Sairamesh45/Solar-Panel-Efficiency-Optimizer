export const ROOF_TYPES = [
  { value: 'flat', label: 'Flat' },
  { value: 'sloped', label: 'Sloped' },
];

export const ORIENTATIONS = [
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
];

export const SHADING_LEVELS = [
  { value: 'none', label: 'None' },
  { value: 'partial', label: 'Partial' },
  { value: 'full', label: 'Full' },
];

export const USER_ROLES = {
  CUSTOMER: 'Customer',
  ADMIN: 'Admin',
  INSTALLER: 'Installer',
};

export const PRIORITY_COLORS = {
  High: '#e74c3c',
  Medium: '#f39c12',
  Low: '#27ae60',
};

export const STATUS_COLORS = {
  pending: '#95a5a6',
  processing: '#3498db',
  processed: '#27ae60',
  failed: '#e74c3c',
};

export const CHART_COLORS = {
  dust: '#e67e22',
  shading: '#9b59b6',
  age: '#e74c3c',
  temperature: '#f39c12',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgotpassword',
    RESET_PASSWORD: '/auth/resetpassword',
  },
  SOLAR: {
    ANALYZE: '/solar/analyze',
    HISTORY: '/solar/history',
    ANALYSIS: '/solar/analysis',
  },
};
