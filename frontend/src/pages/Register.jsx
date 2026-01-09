import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuthContext();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');
    
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '8px', background: 'white' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50' }}>Create an Account</h2>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#fdedec', 
          color: '#e74c3c', 
          borderRadius: '5px', 
          marginBottom: '15px', 
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Full Name</label>
          <input 
            type="text" 
            name="name"
            placeholder="John Doe"
            value={formData.name} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email Address</label>
          <input 
            type="email" 
            name="email"
            placeholder="john@example.com"
            value={formData.email} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Role</label>
          <select 
            name="role"
            value={formData.role} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="Customer">Customer</option>
            <option value="Admin">Admin</option>
            <option value="Installer">Installer</option>
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Password</label>
          <input 
            type="password" 
            name="password"
            placeholder="Min 8 chars with A-Z, a-z, 0-9, !@#"
            value={formData.password} 
            onChange={handleChange} 
            required 
            minLength="8"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <small style={{ display: 'block', marginTop: '5px', color: '#7f8c8d', fontSize: '0.8rem' }}>
            Must include uppercase, lowercase, number, and symbol
          </small>
        </div>
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Confirm Password</label>
          <input 
            type="password" 
            name="confirmPassword"
            placeholder="Repeat password"
            value={formData.confirmPassword} 
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: '#27ae60', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600'
          }}
        >
          {loading ? 'Creating Account...' : 'Register Now'}
        </button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '20px', color: '#7f8c8d' }}>
        Already have an account? <Link to="/login" style={{ color: '#2980b9', textDecoration: 'none' }}>Login here</Link>
      </div>
    </div>
  );
};

export default Register;
