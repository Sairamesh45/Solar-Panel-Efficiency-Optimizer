import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSolarAnalysis } from '../hooks/useSolarAnalysis';
import { useAuthContext } from '../context/AuthContext';
import { formatDateTime } from '../utils/formatters';
import SensorTrends from '../components/solar/SensorTrends';
import TrendsAnalysis from './TrendsAnalysis';

import MyPanels from '../components/customer/MyPanels';
import MyPanelRequests from '../components/customer/MyPanelRequests';
import MyMaintenanceRequests from '../components/customer/MyMaintenanceRequests';
import { exportToCSV } from '../utils/exportUtils';
import { getSensorData } from '../api/sensor.api';
import RequestMaintenanceModal from '../components/customer/RequestMaintenanceModal';
import RequestPanelModal from '../components/customer/RequestPanelModal';
import axiosInstance from '../api/axiosInstance';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { history, loading, error, fetchHistory, removeAnalysis } = useSolarAnalysis();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');
  const [showPanelModal, setShowPanelModal] = useState(false);
  const [panelMsg, setPanelMsg] = useState('');
  const [panels, setPanels] = useState([]);
  const [panelHealth, setPanelHealth] = useState({});
  const [activeSection, setActiveSection] = useState('overview');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    fetchHistory();
    if (user?._id) {
      fetchPanelsWithHealth();
    }
  }, [user]);

  const fetchPanelsWithHealth = async () => {
    try {
      const panelsRes = await axiosInstance.get(`/panel?userId=${user._id}`);
      const allPanels = panelsRes.data.data || [];
      setPanels(allPanels);

      // Fetch sensor data for each panel to calculate health
      const healthData = {};
      for (const panel of allPanels) {
        try {
          const sensorRes = await axiosInstance.get(`/sensor?panelId=${panel._id}`);
          const sensorData = sensorRes.data.data || [];
          const latestData = sensorData[0];
          
          let health = 'healthy';
          let healthScore = 100;
          if (latestData) {
            const tempIssue = latestData.temperature > 65;
            const dustIssue = latestData.dust > 100;
            const shadingIssue = latestData.shading > 30;
            
            if (tempIssue || dustIssue) {
              health = 'critical';
              healthScore = 50;
            } else if (shadingIssue) {
              health = 'warning';
              healthScore = 75;
            }
          }
          healthData[panel._id] = { health, healthScore, latestSensor: latestData };
        } catch (err) {
          healthData[panel._id] = { health: 'unknown', healthScore: 0, latestSensor: null };
        }
      }
      setPanelHealth(healthData);
    } catch (err) {
      console.error('Failed to fetch panels:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this analysis?')) {
      await removeAnalysis(id);
    }
  };

  const handleViewDetails = (item) => {
    navigate('/analyze', { state: { results: item.analysis } });
  };


  // Export sensor data to CSV
  const handleExportSensorData = async () => {
    const res = await getSensorData();
    exportToCSV(res.data.data || [], 'sensor_data_report.csv');
  };

  // Export analysis history to CSV
  const handleExportAnalysisHistory = () => {
    if (!history || !history.length) return;
    exportToCSV(history, 'analysis_history.csv');
  };

  const handleRequestMaintenance = async (form) => {
    try {
      await axiosInstance.post('/maintenance/schedule', { ...form, scheduledDate: new Date(), requested: true });
      setRequestMsg('Request sent to installer!');
    } catch (err) {
      setRequestMsg('Failed to send request.');
    }
    setTimeout(() => { setShowRequestModal(false); setRequestMsg(''); }, 1500);
  };

  const handleRequestPanel = async (form) => {
    if (!user || !user._id) {
      setPanelMsg('You must be logged in to request a panel.');
      setTimeout(() => { setShowPanelModal(false); setPanelMsg(''); }, 2000);
      return;
    }
    
    // Prevent duplicate submissions
    if (panelMsg) return;
    
    setPanelMsg('Sending request...');
    try {
      await axiosInstance.post('/panel-request', { ...form, userId: user._id });
      setPanelMsg('Panel request sent!');
    } catch (err) {
      setPanelMsg('Failed to send panel request.');
    }
    setTimeout(() => { setShowPanelModal(false); setPanelMsg(''); }, 1500);
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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <div style={{ 
        width: '280px', 
        backgroundColor: '#2c3e50', 
        color: 'white',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Logo/Brand */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>☀️ Solar Panel</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#95a5a6' }}>Customer Portal</p>
        </div>

        {/* User Info */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👤</div>
          <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{user?.name || 'User'}</div>
          <div style={{ fontSize: '0.85rem', color: '#95a5a6' }}>{user?.email}</div>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'panels', icon: '☀️', label: 'My Panels' },
            { id: 'panelRequests', icon: '📋', label: 'Panel Requests' },
            { id: 'maintenance', icon: '🔧', label: 'Maintenance' },
            { id: 'sensors', icon: '📈', label: 'Sensor Trends' },
            { id: 'analysis', icon: '🧠', label: 'Analysis History' },
            { id: 'trends', icon: '📉', label: 'System Trends' },
          ].map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: activeSection === section.id ? '#3498db' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontWeight: activeSection === section.id ? 'bold' : 'normal',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== section.id) {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== section.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>

          {/* Quick Actions in Sidebar */}
          <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ margin: '0 0 15px 0', color: 'white', fontSize: '0.9rem', opacity: 0.7 }}>QUICK ACTIONS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => setShowPanelModal(true)} style={{
                padding: '10px 14px',
                background: 'rgba(52, 152, 219, 0.2)',
                color: '#fff',
                border: '1px solid rgba(52, 152, 219, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                textAlign: 'left'
              }}>
                ➕ Request Panel
              </button>
              <button onClick={() => setShowRequestModal(true)} style={{
                padding: '10px 14px',
                background: 'rgba(39, 174, 96, 0.2)',
                color: '#fff',
                border: '1px solid rgba(39, 174, 96, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                textAlign: 'left'
              }}>
                🔧 Request Maintenance
              </button>
              <Link to="/analyze" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(230, 126, 34, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(230, 126, 34, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  width: '100%',
                  textAlign: 'left'
                }}>
                  🔍 New Analysis
                </button>
              </Link>
            </div>
          </div>

          {/* Logout Button */}
          <button onClick={handleLogout} style={{
            padding: '12px 16px',
            background: 'rgba(231, 76, 60, 0.2)',
            color: 'white',
            border: '1px solid rgba(231, 76, 60, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.2rem' }}>🚪</span>
            Logout
          </button>
        </div>

      {/* Main Content Area */}
      <div style={{ marginLeft: '280px', flex: 1, padding: '30px', minHeight: '100vh' }}>
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div>
              <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>Overview</h2>
              {/* Key Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
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

              {/* Latest Analysis Result */}
              {latestAnalysis && (
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '30px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  marginTop: '20px'
                }}>
                  <h3 style={{ fontSize: '1.5rem', color: '#2c3e50', marginBottom: '20px' }}>📊 Latest Analysis Result</h3>
                  <div style={{ display: 'grid', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem' }}>
                            📍 {latestAnalysis.requestId?.inputData?.location?.city || 'Location'}
                          </h4>
                          <span style={{ 
                            padding: '4px 12px', 
                            backgroundColor: '#e8f5e9', 
                            color: '#27ae60', 
                            borderRadius: '12px', 
                            fontSize: '0.85rem',
                            fontWeight: 'bold'
                          }}>
                            Latest
                          </span>
                        </div>
                        <p style={{ color: '#7f8c8d', margin: '5px 0', fontSize: '0.9rem' }}>
                          {latestAnalysis.createdAt ? new Date(latestAnalysis.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date unknown'}
                        </p>
                      </div>
                      <button onClick={() => handleViewDetails(latestAnalysis)} style={{ 
                        padding: '10px 20px', 
                        backgroundColor: '#3498db', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        fontSize: '1rem',
                        fontWeight: 'bold'
                      }}>
                        View Full Details
                      </button>
                    </div>

                    {/* Key Results */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ color: '#7f8c8d', fontSize: '0.85rem', marginBottom: '5px' }}>System Health Score</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>
                          {latestAnalysis.analysis?.performanceAnalysis?.system_health_score || 0}%
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ color: '#7f8c8d', fontSize: '0.85rem', marginBottom: '5px' }}>Energy Output</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db' }}>
                          {latestAnalysis.analysis?.performanceAnalysis?.monthly_kwh || 0} kWh
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ color: '#7f8c8d', fontSize: '0.85rem', marginBottom: '5px' }}>Payback Period</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f39c12' }}>
                          {latestAnalysis.analysis?.financialAnalysis?.payback_years || 0} years
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ color: '#7f8c8d', fontSize: '0.85rem', marginBottom: '5px' }}>ROI</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e91e63' }}>
                          {latestAnalysis.analysis?.financialAnalysis?.roi_25_years || 0}%
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {latestAnalysis.analysis?.systemRecommendation && (
                      <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', border: '1px solid #90caf9' }}>
                        <h5 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>💡 System Recommendation</h5>
                        <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                          <strong>Recommended Size:</strong> {latestAnalysis.analysis.systemRecommendation.size_kw} kW
                        </p>
                        <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                          <strong>Number of Panels:</strong> {latestAnalysis.analysis.systemRecommendation.num_panels}
                        </p>
                        <p style={{ margin: '5px 0', color: '#2c3e50' }}>
                          <strong>Installation Cost:</strong> ₹{latestAnalysis.analysis.systemRecommendation.installation_cost?.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* My Solar Panels Section */}
          {activeSection === 'panels' && (
            <div style={{ 
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '2rem', color: '#2c3e50', margin: 0 }}>☀️ My Solar Panels & Health Status</h2>
                <Link to="/compare-panels" style={{ textDecoration: 'none' }}>
                  <button style={{
                    padding: '12px 24px',
                    background: '#9b59b6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📊 Compare Panels
                  </button>
                </Link>
              </div>
              {panels.length === 0 ? (
                <div>No panels assigned yet. Request a new panel to get started!</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                  {panels.map(panel => {
                    const health = panelHealth[panel._id] || { health: 'unknown', healthScore: 0 };
                    return (
                      <div key={panel._id} style={{ 
                        background: health.health === 'critical' ? '#ffebee' : health.health === 'warning' ? '#fff3e0' : '#e8f5e9', 
                        padding: 20, 
                        borderRadius: 12, 
                        border: `2px solid ${health.health === 'critical' ? '#e74c3c' : health.health === 'warning' ? '#f39c12' : '#27ae60'}`
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                          <h3 style={{ margin: 0, color: '#2c3e50' }}>{panel.name}</h3>
                          <div style={{ fontSize: '2rem' }}>
                            {health.health === 'critical' ? '🔴' : health.health === 'warning' ? '🟡' : '🟢'}
                          </div>
                        </div>
                        <p><strong>Location:</strong> {panel.location || 'N/A'}</p>
                        <p><strong>Wattage:</strong> {panel.specifications?.wattage || 'N/A'}</p>
                        <p><strong>Brand:</strong> {panel.specifications?.brand || 'N/A'}</p>
                        <p><strong>Health Score:</strong> <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: health.health === 'critical' ? '#e74c3c' : health.health === 'warning' ? '#f39c12' : '#27ae60' }}>{health.healthScore}%</span></p>
                        {health.latestSensor && (
                          <div style={{ marginTop: 10, padding: 10, background: 'rgba(255,255,255,0.5)', borderRadius: 8, fontSize: '0.85rem' }}>
                            <p style={{ margin: '2px 0' }}><strong>Temp:</strong> {health.latestSensor.temperature}°C</p>
                            <p style={{ margin: '2px 0' }}><strong>Dust:</strong> {health.latestSensor.dust}</p>
                            <p style={{ margin: '2px 0' }}><strong>Shading:</strong> {health.latestSensor.shading}%</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Panel Requests Section */}
          {activeSection === 'panelRequests' && (
            <div style={{ 
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>📋 Panel Requests Timeline</h2>
              <MyPanelRequests userId={user?._id} />
            </div>
          )}

          {/* Maintenance Section */}
          {activeSection === 'maintenance' && (
            <div style={{ 
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>🔧 Maintenance Requests Timeline</h2>
              <MyMaintenanceRequests userId={user?._id} />
            </div>
          )}

          {/* Sensor Data Section */}
          {activeSection === 'sensors' && (
            <div style={{ 
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: '2rem', color: '#2c3e50' }}>📈 Sensor Data & Trends</h2>
                <button onClick={handleExportSensorData} style={{ 
                  padding: '10px 20px', 
                  background: '#27ae60', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 8, 
                  cursor: 'pointer', 
                  fontWeight: 'bold' 
                }}>
                  Export Sensor Data (CSV)
                </button>
              </div>
              <SensorTrends />
            </div>
          )}

          {/* Analysis History Section */}
          {activeSection === 'analysis' && (
            <div style={{ 
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: '2rem', color: '#2c3e50' }}>🧠 Analysis History</h2>
                <button onClick={handleExportAnalysisHistory} style={{ 
                  padding: '10px 20px', 
                  background: '#3498db', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 8, 
                  cursor: 'pointer', 
                  fontWeight: 'bold' 
                }}>
                  Export History (CSV)
                </button>
              </div>
              {!history || history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <p style={{ fontSize: '1.3rem', color: '#7f8c8d' }}>No analysis history yet</p>
                  <p style={{ color: '#95a5a6' }}>Run your first analysis to monitor your system</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {history.map((item) => (
                    <div key={item._id} style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
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
                          <button onClick={() => handleViewDetails(item)} style={{ 
                            padding: '8px 16px', 
                            backgroundColor: '#3498db', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}>
                            View
                          </button>
                          <button onClick={() => handleDelete(item._id)} style={{ 
                            padding: '8px 16px', 
                            backgroundColor: '#e74c3c', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer', 
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* System Trends Section */}
          {activeSection === 'trends' && (
            <div>
              <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>📉 System Trends</h2>
              <TrendsAnalysis />
            </div>
          )}

          {/* Modals */}
          <RequestPanelModal open={showPanelModal} onClose={() => setShowPanelModal(false)} onSubmit={handleRequestPanel} />
          <RequestMaintenanceModal open={showRequestModal} onClose={() => setShowRequestModal(false)} onSubmit={handleRequestMaintenance} userId={user?._id} />
          {requestMsg && <div style={{position:'fixed',top:20,right:20,zIndex:1000,background:'#27ae60',color:'#fff',padding:'15px 25px',borderRadius:8,fontWeight:'bold',boxShadow:'0 4px 12px rgba(0,0,0,0.15)'}}>{requestMsg}</div>}
          {panelMsg && <div style={{position:'fixed',top:20,right:20,zIndex:1000,background:'#3498db',color:'#fff',padding:'15px 25px',borderRadius:8,fontWeight:'bold',boxShadow:'0 4px 12px rgba(0,0,0,0.15)'}}>{panelMsg}</div>}
        </div>
      </div>
  );
};

export default CustomerDashboard;
