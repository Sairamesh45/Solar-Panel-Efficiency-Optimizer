import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const InstallerDashboard = () => {
  const [stats, setStats] = useState({
    totalInstallations: 0,
    healthySystems: 0,
    needsAttention: 0,
    criticalIssues: 0
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px', minHeight: '60vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', margin: 0 }}>🧑‍🔧 Installer Dashboard</h1>
        <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Manage and monitor your installations</p>
      </div>

      {/* Fleet Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#e3f2fd', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📦</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db', marginBottom: '5px' }}>0</div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Total Installations</div>
        </div>

        <div style={{ backgroundColor: '#e8f5e9', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🟢</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60', marginBottom: '5px' }}>0</div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Healthy Systems</div>
        </div>

        <div style={{ backgroundColor: '#fff3e0', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🟡</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12', marginBottom: '5px' }}>0</div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Needs Attention</div>
        </div>

        <div style={{ backgroundColor: '#ffcdd2', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔴</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c', marginBottom: '5px' }}>0</div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Critical Issues</div>
        </div>
      </div>

      {/* System Performance Table */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', marginBottom: '20px' }}>⚙️ System Performance</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#95a5a6' }}>
          <p>No installations to manage yet</p>
          <p style={{ fontSize: '0.9rem' }}>Systems assigned to you will appear here</p>
        </div>
      </div>

      {/* Maintenance Schedule */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', marginBottom: '20px' }}>🗓️ Maintenance Schedule</h2>
        <div style={{ textAlign: 'center', padding: '40px', color: '#95a5a6' }}>
          <p>No scheduled maintenance</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', marginBottom: '20px' }}>🚀 Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <Link to="/analyze" style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              📊 Run Analysis
            </button>
          </Link>
          <button style={{ width: '100%', padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            🔧 Schedule Maintenance
          </button>
          <button style={{ width: '100%', padding: '15px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            📞 Contact Customer
            </button>
        </div>
      </div>
    </div>
  );
};

export default InstallerDashboard;
