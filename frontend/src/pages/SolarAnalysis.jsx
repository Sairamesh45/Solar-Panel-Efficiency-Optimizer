import React, { useState } from 'react';
import SolarInputForm from '../components/solar/SolarInputForm';
import SolarResultCard from '../components/solar/SolarResultCard';
import { analyzeSolar } from '../api/solar.api';

const SolarAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalysis = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await analyzeSolar(formData);
      if (res.data.success) {
        setResult(res.data.data.result);
      } else {
        setError(res.data.message || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      console.error('Analysis Error:', err);
      const msg = err.response?.data?.message || 'Server connection error. Check if backend is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', marginBottom: '10px' }}>☀️ Solar Efficiency Analyzer</h1>
        <p style={{ color: '#7f8c8d' }}>
          Enter your installation details to get an AI-driven efficiency report and maintenance recommendations.
        </p>
      </div>

      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#fdedec', 
          color: '#e74c3c', 
          borderRadius: '5px', 
          marginBottom: '20px',
          border: '1px solid #fab1a0'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <SolarInputForm onSubmit={handleAnalysis} loading={loading} />

      {result && <SolarResultCard result={result} />}

      {!result && !loading && !error && (
        <div style={{ marginTop: '40px', textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '10px', border: '2px dashed #ddd' }}>
          <p style={{ color: '#95a5a6' }}>Click "Run Analysis" to see detailed results and financial impact.</p>
        </div>
      )}
    </div>
  );
};

export default SolarAnalysis;
