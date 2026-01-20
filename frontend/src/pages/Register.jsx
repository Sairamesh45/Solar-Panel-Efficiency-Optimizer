import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { 
  validateEmail, 
  validatePassword, 
  validatePasswordMatch, 
  validateName,
  formatServerError,
  getPasswordStrength
} from '../utils/authValidation';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Customer'
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: '', color: '', percentage: 0 });
  
  const { register } = useAuthContext();
  const navigate = useNavigate();

  // Update password strength indicator
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(getPasswordStrength(formData.password));
    } else {
      setPasswordStrength({ strength: '', color: '', percentage: 0 });
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if user is typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Real-time validation on blur
  const handleBlur = (fieldName) => {
    let validation = { valid: true, error: '' };
    
    switch (fieldName) {
      case 'name':
        validation = validateName(formData.name);
        break;
      case 'email':
        validation = validateEmail(formData.email);
        break;
      case 'password':
        validation = validatePassword(formData.password);
        break;
      case 'confirmPassword':
        validation = validatePasswordMatch(formData.password, formData.confirmPassword);
        break;
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [fieldName]: validation.error }));
  };

  // Validate entire form
  const validateForm = () => {
    const nameValidation = validateName(formData.name);
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = validatePassword(formData.password);
    const confirmPasswordValidation = validatePasswordMatch(formData.password, formData.confirmPassword);

    setErrors({
      name: nameValidation.error,
      email: emailValidation.error,
      password: passwordValidation.error,
      confirmPassword: confirmPasswordValidation.error
    });

    return nameValidation.valid && emailValidation.valid && 
           passwordValidation.valid && confirmPasswordValidation.valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      
      // Show success message briefly
      setSuccessMessage('Account created successfully! Redirecting...');
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setServerError(formatServerError(err));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(prev => !prev);
    } else {
      setShowConfirmPassword(prev => !prev);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join Solar Panel Efficiency Optimizer today</p>
        </div>
        
        {serverError && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span>⚠</span>
            <span>{serverError}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert auth-alert-success" role="alert">
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Name Field */}
          <div className="auth-form-group">
            <label htmlFor="name">Full Name</label>
            <div className="auth-input-wrapper">
              <input
                id="name"
                type="text"
                name="name"
                className={`auth-input ${errors.name ? 'error' : ''}`}
                value={formData.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                placeholder="John Doe"
                disabled={loading}
                aria-invalid={errors.name ? 'true' : 'false'}
                aria-describedby={errors.name ? 'name-error' : undefined}
                autoComplete="name"
              />
            </div>
            {errors.name && (
              <div id="name-error" className="auth-error-message" role="alert">
                <span>✕</span>
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="auth-form-group">
            <label htmlFor="email">Email Address</label>
            <div className="auth-input-wrapper">
              <input
                id="email"
                type="email"
                name="email"
                className={`auth-input ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                placeholder="john@example.com"
                disabled={loading}
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <div id="email-error" className="auth-error-message" role="alert">
                <span>✕</span>
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Role Field */}
          <div className="auth-form-group">
            <label htmlFor="role">Account Type</label>
            <select
              id="role"
              name="role"
              className="auth-select"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Customer">Customer</option>
              <option value="Installer">Installer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Password Field */}
          <div className="auth-form-group">
            <label htmlFor="password">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className={`auth-input has-icon ${errors.password ? 'error' : ''}`}
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                placeholder="Create a strong password"
                disabled={loading}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : 'password-help'}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-input-icon"
                onClick={() => togglePasswordVisibility('password')}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password ? (
              <div id="password-error" className="auth-error-message" role="alert">
                <span>✕</span>
                <span>{errors.password}</span>
              </div>
            ) : (
              <div id="password-help" className="auth-helper-text">
                Must include uppercase, lowercase, number, and special character
              </div>
            )}
            {/* Password Strength Indicator */}
            {passwordStrength.strength && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '6px'
                }}>
                  <span className="auth-helper-text">Password Strength:</span>
                  <span style={{ 
                    color: passwordStrength.color, 
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {passwordStrength.strength}
                  </span>
                </div>
                <div style={{ 
                  height: '4px', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${passwordStrength.percentage}%`,
                    background: passwordStrength.color,
                    transition: 'all 0.3s ease'
                  }} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="auth-form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="auth-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={`auth-input has-icon ${errors.confirmPassword ? 'error' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Repeat your password"
                disabled={loading}
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-input-icon"
                onClick={() => togglePasswordVisibility('confirmPassword')}
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <div id="confirm-password-error" className="auth-error-message" role="alert">
                <span>✕</span>
                <span>{errors.confirmPassword}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-btn-primary"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="auth-spinner" />
                <span>Creating Account...</span>
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
