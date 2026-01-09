import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { resettoken } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    setError('');

    try {
      await axiosInstance.put(`/auth/resetpassword/${resettoken}`, { password });
      alert('Password reset successful! Please login with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '450px', 
      margin: '100px auto', 
      padding: '40px', 
      boxShadow: '0 6px 20px rgba(0,0,0,0.1)', 
      borderRadius: '12px', 
      background: 'white' 
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#2c3e50' }}>
        Reset Your Password
      </h2>
      <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '30px', fontSize: '0.9rem' }}>
        Enter your new password below
      </p>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#34495e' }}>
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
            minLength="6"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#34495e' }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            required
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => !loading && (e.target.style.background = '#229954')}
          onMouseLeave={(e) => !loading && (e.target.style.background = '#27ae60')}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '25px', color: '#7f8c8d' }}>
        <Link to="/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: '500' }}>
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
