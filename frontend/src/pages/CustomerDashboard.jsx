import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSolarAnalysis } from '../hooks/useSolarAnalysis';
import { useAuthContext } from '../context/AuthContext';
import { formatDateTime, formatNumber } from '../utils/formatters';
import SensorTrends from '../components/solar/SensorTrends';
import TrendsAnalysis from './TrendsAnalysis';

import MyPanels from '../components/customer/MyPanels';
import MyPanelRequests from '../components/customer/MyPanelRequests';
import MyMaintenanceRequests from '../components/customer/MyMaintenanceRequests';
import HistoricalAnalysisComparison from '../components/customer/HistoricalAnalysisComparison';
import RecurringMaintenanceManager from '../components/installer/RecurringMaintenanceManager';
import { exportToCSV } from '../utils/exportUtils';
import { getSensorData } from '../api/sensor.api';
import RequestMaintenanceModal from '../components/customer/RequestMaintenanceModal';
import RequestPanelModal from '../components/customer/RequestPanelModal';
import WeatherForecast from '../components/solar/WeatherForecast';
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
    ? (history.reduce((sum, item) => sum + (item.analysis?.performanceAnalysis?.system_health_score || 0), 0) / history.length)
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
            { id: 'recurring', icon: '🔄', label: 'Recurring Schedules' },
            { id: 'sensors', icon: '📈', label: 'Sensor Trends' },
            { id: 'analysis', icon: '🧠', label: 'Analysis History' },
            { id: 'comparison', icon: '📊', label: 'Compare Analyses' },
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
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12', marginBottom: '5px' }}>{formatNumber(avgEfficiency, 2)}%</div>
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
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e91e63', marginBottom: '5px' }}>
                    {(() => {
                      // Prefer stored monthly_savings, then yearly_savings/12, then estimate from annual generation and tariff
                      const fin = latestAnalysis?.analysis?.financials;
                      const monthlyFromFin = fin?.monthly_savings;
                      const yearlyFromFin = fin?.yearly_savings;
                      if (monthlyFromFin && monthlyFromFin > 0) return `₹${monthlyFromFin.toLocaleString()}`;
                      if (yearlyFromFin && yearlyFromFin > 0) return `₹${Math.round(yearlyFromFin / 12).toLocaleString()}`;
                      const annualGen = latestAnalysis?.analysis?.systemRecommendation?.annual_generation;
                      const tariff = latestAnalysis?.requestId?.inputData?.energy?.tariff || latestAnalysis?.analysis?.input_energy_tariff;
                      if (annualGen && tariff) {
                        const estMonthly = Math.round((annualGen * tariff) / 12);
                        return `₹${estMonthly.toLocaleString()}`;
                      }
                      return '₹0';
                    })()}
                  </div>
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
                          {latestAnalysis.analysis?.performanceAnalysis?.system_health_score !== undefined && latestAnalysis.analysis?.performanceAnalysis?.system_health_score !== null
                            ? `${formatNumber(latestAnalysis.analysis.performanceAnalysis.system_health_score, 2)}%`
                            : '0.00%'}
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ color: '#7f8c8d', fontSize: '0.85rem', marginBottom: '5px' }}>Energy Output</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db' }}>
                          {latestAnalysis.analysis?.systemRecommendation?.annual_generation 
                            ? Math.round(latestAnalysis.analysis.systemRecommendation.annual_generation / 12) 
                            : 0} kWh/month
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ color: '#7f8c8d', fontSize: '0.85rem', marginBottom: '5px' }}>Payback Period</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f39c12' }}>
                          {latestAnalysis.analysis?.financials?.payback_years?.toFixed(1) || 0} years
                        </div>
                      </div>
                      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                        <div style={{ color: '#7f8c8d', fontSize: '0.85rem', marginBottom: '5px' }}>ROI (10 years)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e91e63' }}>
                          {(() => {
                            const yearlySavings = latestAnalysis.analysis?.financials?.yearly_savings || 0;
                            let netCost = latestAnalysis.analysis?.financials?.system_cost?.net_cost_inr;
                            
                            // Calculate net cost if missing
                            if (!netCost && latestAnalysis.analysis?.systemRecommendation?.size_kw) {
                              const systemSizeKw = latestAnalysis.analysis.systemRecommendation.size_kw;
                              let costPerKw;
                              if (systemSizeKw <= 3) costPerKw = 75000;
                              else if (systemSizeKw <= 10) costPerKw = 65000;
                              else costPerKw = 55000;
                              
                              const grossCost = systemSizeKw * costPerKw;
                              let subsidy;
                              if (systemSizeKw <= 3) {
                                subsidy = grossCost * 0.40;
                              } else if (systemSizeKw <= 10) {
                                subsidy = (3 * costPerKw * 0.40) + ((systemSizeKw - 3) * costPerKw * 0.20);
                              } else {
                                subsidy = (3 * costPerKw * 0.40) + (7 * costPerKw * 0.20);
                              }
                              netCost = grossCost - subsidy;
                            }
                            
                            if (!netCost || netCost === 0) return 'N/A';
                            // ROI for 10 years = (10 year savings - Cost) / Cost * 100
                            const tenYearSavings = yearlySavings * 10;
                            const roi = ((tenYearSavings - netCost) / netCost) * 100;
                            return roi > 0 ? roi.toFixed(0) : 0;
                          })()}%
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {latestAnalysis.analysis?.systemRecommendation && (() => {
                      // Calculate costs if missing from database (for old analyses)
                      const systemSizeKw = latestAnalysis.analysis.systemRecommendation.size_kw;
                      let costPerKw = latestAnalysis.analysis?.financials?.system_cost?.cost_per_kw;
                      let grossCost = latestAnalysis.analysis?.financials?.system_cost?.gross_cost_inr;
                      let subsidy = latestAnalysis.analysis?.financials?.system_cost?.subsidy_inr;
                      let netCost = latestAnalysis.analysis?.financials?.system_cost?.net_cost_inr;
                      
                      // If costs are missing, calculate them
                      if (!costPerKw || !grossCost) {
                        // Determine cost per kW based on system size
                        if (systemSizeKw <= 3) costPerKw = 75000;
                        else if (systemSizeKw <= 10) costPerKw = 65000;
                        else costPerKw = 55000;
                        
                        grossCost = systemSizeKw * costPerKw;
                        
                        // Calculate subsidy
                        if (systemSizeKw <= 3) {
                          subsidy = grossCost * 0.40;
                        } else if (systemSizeKw <= 10) {
                          subsidy = (3 * costPerKw * 0.40) + ((systemSizeKw - 3) * costPerKw * 0.20);
                        } else {
                          subsidy = (3 * costPerKw * 0.40) + (7 * costPerKw * 0.20);
                        }
                        
                        netCost = grossCost - subsidy;
                      }
                      
                      return (
                        <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', border: '1px solid #90caf9' }}>
                          <h5 style={{ margin: '0 0 15px 0', color: '#1976d2' }}>💡 System Recommendation</h5>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                            <div>
                              <p style={{ margin: '5px 0', color: '#2c3e50', fontSize: '0.95rem' }}>
                                <strong>Recommended Size:</strong> {systemSizeKw} kW
                              </p>
                              <p style={{ margin: '5px 0', color: '#2c3e50', fontSize: '0.95rem' }}>
                                <strong>Number of Panels:</strong> {Math.ceil((systemSizeKw * 1000) / 400)} panels (400W each)
                              </p>
                            </div>
                            <div>
                              <p style={{ margin: '5px 0', color: '#2c3e50', fontSize: '0.95rem' }}>
                                <strong>Annual Generation:</strong> {latestAnalysis.analysis.systemRecommendation.annual_generation?.toLocaleString()} kWh/year
                              </p>
                              <p style={{ margin: '5px 0', color: '#2c3e50', fontSize: '0.95rem' }}>
                                <strong>Cost per kW:</strong> ₹{costPerKw.toLocaleString()}/kW
                              </p>
                            </div>
                          </div>
                          <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', marginTop: '10px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', fontSize: '0.9rem' }}>
                              <div>
                                <div style={{ color: '#7f8c8d', fontSize: '0.8rem', marginBottom: '3px' }}>Gross Cost</div>
                                <div style={{ fontWeight: 'bold', color: '#e74c3c', fontSize: '1.1rem' }}>
                                  ₹{Math.round(grossCost).toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div style={{ color: '#7f8c8d', fontSize: '0.8rem', marginBottom: '3px' }}>Govt. Subsidy</div>
                                <div style={{ fontWeight: 'bold', color: '#27ae60', fontSize: '1.1rem' }}>
                                  - ₹{Math.round(subsidy).toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div style={{ color: '#7f8c8d', fontSize: '0.8rem', marginBottom: '3px' }}>Net Cost (After Subsidy)</div>
                                <div style={{ fontWeight: 'bold', color: '#2980b9', fontSize: '1.1rem' }}>
                                  ₹{Math.round(netCost).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* 7-Day Weather Forecast Section */}
              <div style={{ marginTop: '30px' }}>
                <WeatherForecast panelId={panels[0]?._id} />
              </div>
            </div>
          )}

          {/* My Solar Panels Section */}
          {activeSection === 'panels' && (
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', margin: 0 }}>My Solar Panels</h2>
                <Link to="/compare-panels" style={{ textDecoration: 'none' }}>
                  <button style={{
                    padding: '10px 20px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}>
                    Compare Panels
                  </button>
                </Link>
              </div>
              {panels.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🌞</div>
                  <p style={{ color: '#7f8c8d', margin: 0 }}>No panels yet</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  {panels.map(panel => {
                    const health = panelHealth[panel._id] || { health: 'unknown', healthScore: 0 };
                    return (
                      <div 
                        key={panel._id} 
                        style={{ 
                          background: 'white',
                          padding: 20, 
                          borderRadius: 12, 
                          border: `2px solid ${health.health === 'critical' ? '#e74c3c' : health.health === 'warning' ? '#f39c12' : '#27ae60'}`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                          <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem' }}>{panel.name}</h3>
                          <div style={{ fontSize: '1.5rem' }}>
                            {health.health === 'critical' ? '🔴' : health.health === 'warning' ? '🟡' : '🟢'}
                          </div>
                        </div>

                        <div style={{ fontSize: '0.85rem', marginBottom: 12 }}>
                          <div style={{ color: '#7f8c8d', marginBottom: 2 }}>Location:</div>
                          <div style={{ color: '#2c3e50', fontWeight: '600' }}>{panel.location || 'N/A'}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: 2 }}>Wattage:</div>
                            <div style={{ fontSize: '0.95rem', color: '#2c3e50', fontWeight: '600' }}>{panel.specifications?.wattage || 'N/A'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: 2 }}>Brand:</div>
                            <div style={{ fontSize: '0.95rem', color: '#2c3e50', fontWeight: '600' }}>{panel.specifications?.brand || 'N/A'}</div>
                          </div>
                        </div>

                        <div style={{ 
                          background: '#f8f9fa',
                          padding: 12,
                          borderRadius: 8,
                          marginBottom: 12
                        }}>
                          <div style={{ fontSize: '0.75rem', color: '#7f8c8d', marginBottom: 4 }}>Health Score:</div>
                          <div style={{ 
                            fontWeight: 'bold', 
                            fontSize: '1.5rem', 
                            color: health.health === 'critical' ? '#e74c3c' : health.health === 'warning' ? '#f39c12' : '#27ae60'
                          }}>
                            {health.healthScore}%
                          </div>
                        </div>

                        {health.latestSensor && (
                          <div style={{ fontSize: '0.85rem', lineHeight: '1.8' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#7f8c8d' }}>Temp:</span>
                              <span style={{ color: '#2c3e50', fontWeight: '600' }}>{health.latestSensor.temperature}°C</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#7f8c8d' }}>Dust:</span>
                              <span style={{ color: '#2c3e50', fontWeight: '600' }}>{health.latestSensor.dust}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#7f8c8d' }}>Shading:</span>
                              <span style={{ color: '#2c3e50', fontWeight: '600' }}>{health.latestSensor.shading}%</span>
                            </div>
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

          {/* Recurring Maintenance Section */}
          {activeSection === 'recurring' && (
            <div style={{ 
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>🔄 Recurring Maintenance</h2>
              <RecurringMaintenanceManager />
            </div>
          )}

          {/* Analysis Comparison Section */}
          {activeSection === 'comparison' && (
            <div style={{ 
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <HistoricalAnalysisComparison />
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
