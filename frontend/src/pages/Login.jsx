import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { validateEmail, validatePassword, formatServerError } from '../utils/authValidation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuthContext();
  const navigate = useNavigate();

  // Real-time email validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email && value) {
      const validation = validateEmail(value);
      setErrors(prev => ({ ...prev, email: validation.valid ? '' : validation.error }));
    }
  };

  // Real-time password validation
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password && value) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const emailValidation = validateEmail(email);
    const passwordValidation = password ? { valid: true, error: '' } : { valid: false, error: 'Password is required' };

    setErrors({
      email: emailValidation.error,
      password: passwordValidation.error
    });

    return emailValidation.valid && passwordValidation.valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await login({ email, password });
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      
      navigate('/dashboard');
    } catch (err) {
      setServerError(formatServerError(err));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your Solar Panel Efficiency Optimizer account</p>
        </div>
        
        {serverError && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span>⚠</span>
            <span>{serverError}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email Field */}
          <div className="auth-form-group">
            <label htmlFor="email">Email Address</label>
            <div className="auth-input-wrapper">
              <input
                id="email"
                type="email"
                className={`auth-input ${errors.email ? 'error' : ''}`}
                value={email}
                onChange={handleEmailChange}
                onBlur={() => {
                  if (email) {
                    const validation = validateEmail(email);
                    setErrors(prev => ({ ...prev, email: validation.error }));
                  }
                }}
                placeholder="your.email@example.com"
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

          {/* Password Field */}
          <div className="auth-form-group">
            <label htmlFor="password">Password</label>
            <div className="auth-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`auth-input has-icon ${errors.password ? 'error' : ''}`}
                value={password}
                onChange={handlePasswordChange}
                onBlur={() => {
                  if (!password) {
                    setErrors(prev => ({ ...prev, password: 'Password is required' }));
                  }
                }}
                placeholder="Enter your password"
                disabled={loading}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-input-icon"
                onClick={togglePasswordVisibility}
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
            {errors.password && (
              <div id="password-error" className="auth-error-message" role="alert">
                <span>✕</span>
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <div className="auth-checkbox-wrapper">
              <input
                type="checkbox"
                id="rememberMe"
                className="auth-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="rememberMe" className="auth-checkbox-label">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: '13px' }}>
              Forgot password?
            </Link>
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
                <span>Signing in...</span>
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="auth-footer">
          <p className="auth-footer-text">
            Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

