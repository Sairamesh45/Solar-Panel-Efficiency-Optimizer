import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { validateEmail, formatServerError } from '../../utils/authValidation';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError && value) {
      const validation = validateEmail(value);
      setEmailError(validation.valid ? '' : validation.error);
    }
  };

  const handleBlur = () => {
    if (email) {
      const validation = validateEmail(email);
      setEmailError(validation.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate email
    const validation = validateEmail(email);
    if (!validation.valid) {
      setEmailError(validation.error);
      return;
    }

    setLoading(true);

    try {
      const res = await axiosInstance.post('/auth/forgotpassword', { email });
      setMessage(res.data.message || 'Password reset email sent! Check your inbox.');
      setEmail('');
      setEmailError('');
    } catch (err) {
      setError(formatServerError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your email and we'll send you a reset link</p>
        </div>

        {message && (
          <div className="auth-alert auth-alert-success" role="alert">
            <span>✓</span>
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="auth-alert auth-alert-error" role="alert">
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-form-group">
            <label htmlFor="email">Email Address</label>
            <div className="auth-input-wrapper">
              <input
                id="email"
                type="email"
                className={`auth-input ${emailError ? 'error' : ''}`}
                value={email}
                onChange={handleEmailChange}
                onBlur={handleBlur}
                placeholder="your.email@example.com"
                disabled={loading}
                aria-invalid={emailError ? 'true' : 'false'}
                aria-describedby={emailError ? 'email-error' : undefined}
                autoComplete="email"
              />
            </div>
            {emailError && (
              <div id="email-error" className="auth-error-message" role="alert">
                <span>✕</span>
                <span>{emailError}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="auth-spinner" />
                <span>Sending...</span>
              </span>
            ) : (
              'Send Reset Link'
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

export default ForgotPassword;
