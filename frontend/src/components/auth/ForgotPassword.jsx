import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axiosInstance.post('/auth/forgotpassword', { email });
      setMessage(res.data.message || 'Password reset email sent! Check your inbox.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email');
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
        Forgot Password?
      </h2>
      <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '30px', fontSize: '0.9rem' }}>
        Enter your email and we'll send you a reset link
      </p>

      {message && (
        <div style={{
          padding: '12px',
          backgroundColor: '#d4edda',
          color: '#155724',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

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
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#34495e' }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
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
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => !loading && (e.target.style.background = '#2980b9')}
          onMouseLeave={(e) => !loading && (e.target.style.background = '#3498db')}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '25px', color: '#7f8c8d' }}>
        Remember your password? <Link to="/login" style={{ color: '#3498db', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
