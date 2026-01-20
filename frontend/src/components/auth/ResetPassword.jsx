import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { validatePassword, validatePasswordMatch, formatServerError } from '../../utils/authValidation';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const { resettoken } = useParams();

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password && value) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (errors.confirmPassword && value) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleBlur = (fieldName) => {
    let validation = { valid: true, error: '' };
    
    if (fieldName === 'password') {
      validation = validatePassword(password);
    } else if (fieldName === 'confirmPassword') {
      validation = validatePasswordMatch(password, confirmPassword);
    }
    
    setErrors(prev => ({ ...prev, [fieldName]: validation.error }));
  };

  const validateForm = () => {
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validatePasswordMatch(password, confirmPassword);

    setErrors({
      password: passwordValidation.error,
      confirmPassword: confirmPasswordValidation.error
    });

    return passwordValidation.valid && confirmPasswordValidation.valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.put(`/auth/resetpassword/${resettoken}`, { password });
      
      // Show success message
      alert('Password reset successful! Please login with your new password.');
      navigate('/login');
    } catch (err) {
      setServerError(formatServerError(err) || 'Password reset failed. Token may be invalid or expired.');
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
          <h1>Set New Password</h1>
          <p>Enter your new password below</p>
        </div>

        {serverError && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span>⚠</span>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Password Field */}
          <div className="auth-form-group">
            <label htmlFor="password">New Password</label>
            <div className="auth-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`auth-input has-icon ${errors.password ? 'error' : ''}`}
                value={password}
                onChange={handlePasswordChange}
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
                Minimum 8 characters with uppercase, lowercase, number, and special character
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
                className={`auth-input has-icon ${errors.confirmPassword ? 'error' : ''}`}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
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
                <span>Resetting...</span>
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <Link to="/login" className="auth-secondary-link">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
