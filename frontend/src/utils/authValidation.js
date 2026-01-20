/**
 * Auth Validation Utilities
 * Client-side validation for authentication forms
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {object} { valid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true, error: '' };
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {object} { valid: boolean, error: string }
 */
export const validatePassword = (password) => {
  if (!password || password.length === 0) {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return { 
      valid: false, 
      error: 'Password must include uppercase, lowercase, number, and special character' 
    };
  }
  
  return { valid: true, error: '' };
};

/**
 * Validate password confirmation match
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {object} { valid: boolean, error: string }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.length === 0) {
    return { valid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }
  
  return { valid: true, error: '' };
};

/**
 * Validate name field
 * @param {string} name
 * @returns {object} { valid: boolean, error: string }
 */
export const validateName = (name) => {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  return { valid: true, error: '' };
};

/**
 * Format server error message
 * @param {object} error - Axios error object
 * @returns {string} Formatted error message
 */
export const formatServerError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Check if form has any validation errors
 * @param {object} errors - Object with field errors
 * @returns {boolean}
 */
export const hasErrors = (errors) => {
  return Object.values(errors).some(error => error !== '');
};

/**
 * Get password strength indicator
 * @param {string} password
 * @returns {object} { strength: string, color: string, percentage: number }
 */
export const getPasswordStrength = (password) => {
  if (!password || password.length === 0) {
    return { strength: '', color: '', percentage: 0 };
  }
  
  let score = 0;
  
  // Length
  if (password.length >= 8) score += 25;
  if (password.length >= 12) score += 15;
  
  // Character types
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
  
  if (score < 40) {
    return { strength: 'Weak', color: '#ff6b9d', percentage: score };
  } else if (score < 70) {
    return { strength: 'Fair', color: '#fbbf24', percentage: score };
  } else if (score < 90) {
    return { strength: 'Good', color: '#4ade80', percentage: score };
  } else {
    return { strength: 'Strong', color: '#22c55e', percentage: 100 };
  }
};
