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
import { getUserAlerts, resolveAlert, deleteAlert } from '../api/alert.api';
import { AlertCircle, AlertTriangle, Info, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import { generateAnalytics, getCumulativeAnalytics } from '../api/analytics.api';
import CostSavingsCard from '../components/common/CostSavingsCard';
import CarbonFootprintCard from '../components/common/CarbonFootprintCard';

// Alerts Section Component
const AlertsSection = ({ userId }) => {
  const [alerts, setAlerts] = useState([]);
  const [alertPanels, setAlertPanels] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState('all');
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterResolved, setFilterResolved] = useState('false');
  const [stats, setStats] = useState({ total: 0, critical: 0, warning: 0, info: 0, unresolved: 0 });

  useEffect(() => {
    const fetchPanels = async () => {
      try {
        const response = await axiosInstance.get(`/panel?userId=${userId}`);
        setAlertPanels(response.data.data || []);
      } catch (error) {
        console.error('Error fetching panels:', error);
      }
    };
    
    if (userId) {
      fetchPanels();
    }
  }, [userId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = {
        resolved: filterResolved,
        ...(filterCategory !== 'all' && { category: filterCategory }),
        ...(filterSeverity !== 'all' && { severity: filterSeverity }),
        limit: 100
      };
      
      const response = await getUserAlerts(userId, params);
      if (response.data.success) {
        let alertsData = response.data.data || [];
        
        if (selectedPanel !== 'all') {
          alertsData = alertsData.filter(alert => 
            alert.panelId?._id === selectedPanel || alert.panelId === selectedPanel
          );
        }
        
        setAlerts(alertsData);
        
        const newStats = {
          total: alertsData.length,
          critical: alertsData.filter(a => a.severity === 'critical').length,
          warning: alertsData.filter(a => a.severity === 'warning').length,
          info: alertsData.filter(a => a.severity === 'info').length,
          unresolved: alertsData.filter(a => !a.isResolved).length
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAlerts();
    }
  }, [userId, filterCategory, filterSeverity, filterResolved, selectedPanel]);

  const handleResolve = async (alertId) => {
    try {
      await resolveAlert(alertId);
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleDelete = async (alertId) => {
    if (!window.confirm('Delete this alert?')) return;
    try {
      await deleteAlert(alertId);
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertCircle size={20} color="#e74c3c" />;
      case 'warning': return <AlertTriangle size={20} color="#f39c12" />;
      case 'info': return <Info size={20} color="#3498db" />;
      default: return <Info size={20} color="#95a5a6" />;
    }
  };

  const getSeverityBadgeStyle = (severity) => {
    switch (severity) {
      case 'critical': return { background: '#e74c3c', color: 'white' };
      case 'warning': return { background: '#f39c12', color: 'white' };
      case 'info': return { background: '#3498db', color: 'white' };
      default: return { background: '#95a5a6', color: 'white' };
    }
  };

  const getCategoryBadgeStyle = (category) => {
    const colors = { anomaly: '#9b59b6', performance: '#e67e22', maintenance: '#16a085', cleaning: '#27ae60', system: '#34495e' };
    return { background: colors[category] || '#95a5a6', color: 'white' };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '15px' }}>🔔 Alert Center</h2>

      {/* Enhanced Alert Conditions */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '25px 30px', 
        borderRadius: '12px', 
        marginBottom: '25px', 
        color: 'white',
        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.35)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '10px', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.5rem' }}>📋</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '600' }}>Alert Trigger Conditions</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { icon: '🌡️', label: 'Temperature Alert', condition: 'Temp > 65°C', severity: 'Critical' },
            { icon: '💨', label: 'Dust Accumulation', condition: 'Dust > 100', severity: 'Warning' },
            { icon: '🌥️', label: 'Shading Issue', condition: 'Shading > 30%', severity: 'Info' },
            { icon: '📉', label: 'Efficiency Drop', condition: 'Drop > 15%', severity: 'Critical' },
            { icon: '🧹', label: 'Cleaning Required', condition: 'Loss > 8%', severity: 'Warning' },
            { icon: '🔍', label: 'ML Anomaly', condition: 'Confidence > 60%', severity: 'AI-Based' }
          ].map((threshold, idx) => (
            <div key={idx} style={{ 
              background: 'rgba(255,255,255,0.15)', 
              padding: '15px', 
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.2s, background 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>{threshold.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{threshold.label}</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>{threshold.condition}</div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Severity: {threshold.severity}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total', value: stats.total, color: '#2c3e50', bg: '#f8f9fa' },
          { label: 'Critical', value: stats.critical, color: '#e74c3c', bg: '#fee' },
          { label: 'Warning', value: stats.warning, color: '#f39c12', bg: '#fef9e7' },
          { label: 'Info', value: stats.info, color: '#3498db', bg: '#ebf5fb' },
          { label: 'Unresolved', value: stats.unresolved, color: '#27ae60', bg: '#d5f4e6' }
        ].map(stat => (
          <div key={stat.label} style={{ background: stat.bg, padding: '15px', borderRadius: '8px', textAlign: 'center', border: `1px solid ${stat.color}20` }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #e0e0e0', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: '600', color: '#2c3e50', fontSize: '14px' }}>🔍</span>
        
        <select value={selectedPanel} onChange={(e) => setSelectedPanel(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', minWidth: '150px' }}>
          <option value="all">All Panels</option>
          {alertPanels.map(panel => (
            <option key={panel._id} value={panel._id}>{panel.name}</option>
          ))}
        </select>

        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }}>
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }}>
          <option value="all">All Categories</option>
          <option value="anomaly">Anomaly</option>
          <option value="performance">Performance</option>
          <option value="maintenance">Maintenance</option>
          <option value="cleaning">Cleaning</option>
          <option value="system">System</option>
        </select>

        <select value={filterResolved} onChange={(e) => setFilterResolved(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }}>
          <option value="false">Unresolved</option>
          <option value="true">Resolved</option>
          <option value="">All</option>
        </select>

        <button onClick={fetchAlerts} style={{ marginLeft: 'auto', background: '#3498db', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Alert List */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#95a5a6' }}>Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#95a5a6' }}>
            <CheckCircle size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <h3 style={{ margin: '0 0 8px', color: '#7f8c8d' }}>No alerts found</h3>
            <p style={{ margin: 0, fontSize: '13px' }}>Adjust filters or wait for alerts to be generated</p>
          </div>
        ) : (
          <div>
            {alerts.map((alert, index) => (
              <div key={alert._id} style={{ padding: '15px', borderBottom: index < alerts.length - 1 ? '1px solid #f0f0f0' : 'none', opacity: alert.isResolved ? 0.6 : 1, borderLeft: `4px solid ${getSeverityBadgeStyle(alert.severity).background}` }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '2px' }}>{getSeverityIcon(alert.severity)}</div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ ...getSeverityBadgeStyle(alert.severity), padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
                        {alert.severity}
                      </span>
                      <span style={{ ...getCategoryBadgeStyle(alert.category), padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>
                        {alert.category}
                      </span>
                      {alert.isResolved && (
                        <span style={{ background: '#27ae60', color: 'white', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>
                          ✓ RESOLVED
                        </span>
                      )}
                    </div>
                    
                    <div style={{ fontSize: '14px', color: '#2c3e50', marginBottom: '8px', fontWeight: '500' }}>{alert.message}</div>
                    
                    <div style={{ fontSize: '12px', color: '#7f8c8d', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span>📅 {formatDate(alert.createdAt)}</span>
                      {alert.panelId?.name && <span>🔆 {alert.panelId.name}</span>}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {!alert.isResolved && (
                      <button onClick={() => handleResolve(alert._id)} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} />
                        Resolve
                      </button>
                    )}
                    <button onClick={() => handleDelete(alert._id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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
            { id: 'analytics', icon: '💰', label: 'Analytics & Reports' },
            { id: 'panelRequests', icon: '📋', label: 'Panel Requests' },
            { id: 'maintenance', icon: '🔧', label: 'Maintenance' },
            { id: 'recurring', icon: '🔄', label: 'Recurring Schedules' },
            { id: 'alerts', icon: '🔔', label: 'Alerts' },
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
                            
                            if (!netCost || netCost === 0 || yearlySavings === 0) return 'N/A';
                            // ROI = (Total Savings / Investment) * 100
                            const tenYearSavings = yearlySavings * 10;
                            const roi = (tenYearSavings / netCost) * 100;
                            return roi.toFixed(0);
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

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <div style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>💰 Analytics & Reports</h2>
              <AnalyticsSection userId={user?._id} panels={panels} />
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

          {/* Alerts Section */}
          {activeSection === 'alerts' && (
            <AlertsSection userId={user?._id} />
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

// Analytics Section Component
const AnalyticsSection = ({ userId, panels }) => {
  const [selectedPanel, setSelectedPanel] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [cumulative, setCumulative] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [systemCost, setSystemCost] = useState('');
  const [electricityTariff, setElectricityTariff] = useState('6.5');

  useEffect(() => {
    if (panels.length > 0 && !selectedPanel) {
      setSelectedPanel(panels[0]._id);
    }
  }, [panels]);

  useEffect(() => {
    if (selectedPanel) {
      fetchAnalytics();
      fetchCumulativeAnalytics();
    }
  }, [selectedPanel, dateRange]);

  const fetchAnalytics = async () => {
    if (!selectedPanel) return;

    try {
      setLoading(true);
      setError('');

      const response = await generateAnalytics({
        panelId: selectedPanel,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        systemCost: systemCost || 0,
        electricityTariff: electricityTariff || 6.5
      });

      if (response.success) {
        setAnalytics(response.data);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
      setLoading(false);
    }
  };

  const fetchCumulativeAnalytics = async () => {
    try {
      const response = await getCumulativeAnalytics(selectedPanel || null);
      if (response.success) {
        setCumulative(response.data);
      }
    } catch (err) {
      console.error('Error fetching cumulative analytics:', err);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
    fetchCumulativeAnalytics();
  };

  if (panels.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📊</div>
        <p style={{ color: '#7f8c8d', margin: 0 }}>No panels available. Add a panel to view analytics.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Select Panel
            </label>
            <select
              value={selectedPanel}
              onChange={(e) => setSelectedPanel(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {panels.map(panel => (
                <option key={panel._id} value={panel._id}>
                  {panel.name} - {panel.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              max={dateRange.endDate}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              min={dateRange.startDate}
              max={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              System Cost (₹)
            </label>
            <input
              type="number"
              value={systemCost}
              onChange={(e) => setSystemCost(e.target.value)}
              placeholder="Optional"
              min="0"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              Tariff (₹/kWh)
            </label>
            <input
              type="number"
              value={electricityTariff}
              onChange={(e) => setElectricityTariff(e.target.value)}
              placeholder="6.5"
              step="0.1"
              min="0"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
              &nbsp;
            </label>
            <button
              onClick={handleRefresh}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 20px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '🔄 Loading...' : '🔄 Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          background: '#fef2f2',
          borderLeft: '4px solid #ef4444',
          borderRadius: '6px',
          color: '#991b1b',
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Cumulative Stats */}
      {cumulative && (
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1f2937', fontWeight: '600' }}>
            All-Time Statistics
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
              border: '1px solid #e5e7eb',
              borderTop: '4px solid #fbbf24',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚡</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                {cumulative.totalEnergyProduced?.toFixed(2) || '0'} kWh
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Total Energy</div>
            </div>

            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
              border: '1px solid #e5e7eb',
              borderTop: '4px solid #10b981',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>💰</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                ₹{cumulative.totalSavings?.toLocaleString() || '0'}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Total Savings</div>
            </div>

            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
              border: '1px solid #e5e7eb',
              borderTop: '4px solid #059669',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌍</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                {cumulative.totalCO2Avoided?.toFixed(2) || '0'} kg
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>CO₂ Avoided</div>
            </div>

            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)',
              border: '1px solid #e5e7eb',
              borderTop: '4px solid #2563eb',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>📊</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
                {cumulative.averageROI?.toFixed(2) || '0'}%
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Average ROI</div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        <CostSavingsCard data={analytics} loading={loading} />
        <CarbonFootprintCard data={analytics} loading={loading} />
      </div>
    </div>
  );
};

export default CustomerDashboard;
