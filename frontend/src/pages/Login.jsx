import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('judge@demo.com');
  const [password, setPassword] = useState('Password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Login to Optimizer</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', marginTop: '5px' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: '10px' }}>
        <Link to="/forgot-password" style={{ color: '#3498db', textDecoration: 'none' }}>Forgot Password?</Link>
      </p>
    </div>
  );
};

export default Login;
