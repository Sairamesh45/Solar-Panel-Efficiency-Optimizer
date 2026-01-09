import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSolarAnalysis } from '../hooks/useSolarAnalysis';
import { formatDateTime } from '../utils/formatters';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { history, loading, error, fetchHistory, removeAnalysis } = useSolarAnalysis();

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this analysis?')) {
      await removeAnalysis(id);
    }
  };

  const handleViewDetails = (item) => {
    navigate('/analyze', { state: { results: item.analysis } });
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', color: '#0d47a1' }}>
          <strong>Loading your dashboard...</strong>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: '#ffcdd2', padding: '20px', borderRadius: '8px', color: '#c62828' }}>
          <strong>Error: {error}</strong>
        </div>
      </div>
    );
  }

  // Calculate summary stats
  const totalAnalyses = history?.length || 0;
  const latestAnalysis = history?.[0];
  const avgEfficiency = history?.length 
    ? Math.round(history.reduce((sum, item) => sum + (item.analysis?.performanceAnalysis?.system_health_score || 0), 0) / history.length)
    : 0;

  return (
    <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px', minHeight: '60vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', margin: 0 }}>👤 Customer Dashboard</h1>
        <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Monitor your solar system performance</p>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#e8f5e9', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔋</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60', marginBottom: '5px' }}>{totalAnalyses}</div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Total Analyses</div>
        </div>

        <div style={{ backgroundColor: '#fff3e0', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚡</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12', marginBottom: '5px' }}>{avgEfficiency}%</div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Average Health Score</div>
        </div>

        <div style={{ backgroundColor: '#e3f2fd', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🌱</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db', marginBottom: '5px' }}>
            {latestAnalysis?.analysis?.systemRecommendation?.size_kw || 0} kW
          </div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>System Size</div>
        </div>

        <div style={{ backgroundColor: '#fce4ec', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>💰</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e91e63', marginBottom: '5px' }}>₹{latestAnalysis?.analysis?.financialAnalysis?.monthly_savings || 0}</div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Est. Monthly Savings</div>
        </div>
      </div>

      {/* Panel Health Status */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', marginBottom: '20px' }}>🔆 Panel Health Status</h2>
        {avgEfficiency >= 80 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
            <div style={{ fontSize: '3rem' }}>🟢</div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#27ae60' }}>All Systems Healthy</div>
              <div style={{ color: '#7f8c8d', marginTop: '5px' }}>Your solar panels are performing optimally</div>
            </div>
          </div>
        ) : avgEfficiency >= 60 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
            <div style={{ fontSize: '3rem' }}>🟡</div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f39c12' }}>Minor Issues Detected</div>
              <div style={{ color: '#7f8c8d', marginTop: '5px' }}>Your panels may need cleaning or maintenance</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', backgroundColor: '#ffcdd2', borderRadius: '8px' }}>
            <div style={{ fontSize: '3rem' }}>🔴</div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e74c3c' }}>System Underperforming</div>
              <div style={{ color: '#7f8c8d', marginTop: '5px' }}>Immediate attention required - contact your installer</div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis History */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', margin: 0 }}>📊 Analysis History</h2>
        <Link to="/analyze" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '12px 24px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            ➕ New Analysis
          </button>
        </Link>
      </div>

      {!history || history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '8px' }}>
          <p style={{ fontSize: '1.3rem', color: '#7f8c8d' }}>No analysis history yet</p>
          <p style={{ color: '#95a5a6' }}>Run your first analysis to monitor your system</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {history.map((item) => (
            <div key={item._id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#2c3e50' }}>
                    📍 {item.requestId?.inputData?.location?.city || 'Analysis'}
                  </h3>
                  <p style={{ color: '#7f8c8d', margin: '5px 0 0 0', fontSize: '0.9rem' }}>
                    {item.createdAt ? formatDateTime(item.createdAt) : 'Date unknown'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleViewDetails(item)} style={{ padding: '8px 16px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    View
                  </button>
                  <button onClick={() => handleDelete(item._id)} style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
