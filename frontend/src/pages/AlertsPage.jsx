import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { getUserAlerts, resolveAlert, deleteAlert } from '../api/alert.api';
import axiosInstance from '../api/axiosInstance';
import { AlertCircle, AlertTriangle, Info, CheckCircle, Trash2, RefreshCw } from 'lucide-react';

const AlertsPage = () => {
  const { user } = useAuthContext();
  const [alerts, setAlerts] = useState([]);
  const [panels, setPanels] = useState([]);
  const [selectedPanel, setSelectedPanel] = useState('all');
  const [loading, setLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterResolved, setFilterResolved] = useState('false');
  const [stats, setStats] = useState({ total: 0, critical: 0, warning: 0, info: 0, unresolved: 0 });

  // Fetch panels
  useEffect(() => {
    const fetchPanels = async () => {
      try {
        const response = await axiosInstance.get(`/panel?userId=${user._id}`);
        setPanels(response.data.data || []);
      } catch (error) {
        console.error('Error fetching panels:', error);
      }
    };
    
    if (user?._id) {
      fetchPanels();
    }
  }, [user]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = {
        resolved: filterResolved,
        ...(filterCategory !== 'all' && { category: filterCategory }),
        ...(filterSeverity !== 'all' && { severity: filterSeverity }),
        limit: 100
      };
      
      const response = await getUserAlerts(user._id, params);
      if (response.data.success) {
        let alertsData = response.data.data || [];
        
        // Filter by selected panel
        if (selectedPanel !== 'all') {
          alertsData = alertsData.filter(alert => 
            alert.panelId?._id === selectedPanel || alert.panelId === selectedPanel
          );
        }
        
        setAlerts(alertsData);
        
        // Calculate statistics
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
    if (user?._id) {
      fetchAlerts();
    }
  }, [user, filterSeverity, filterCategory, filterResolved, selectedPanel]);

  const handleResolve = async (alertId) => {
    try {
      await resolveAlert(alertId);
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleDelete = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    
    try {
      await deleteAlert(alertId);
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle size={20} color="#e74c3c" />;
      case 'warning':
        return <AlertTriangle size={20} color="#f39c12" />;
      case 'info':
        return <Info size={20} color="#3498db" />;
      default:
        return <Info size={20} color="#95a5a6" />;
    }
  };

  const getSeverityBadgeStyle = (severity) => {
    switch (severity) {
      case 'critical':
        return { background: '#e74c3c', color: 'white' };
      case 'warning':
        return { background: '#f39c12', color: 'white' };
      case 'info':
        return { background: '#3498db', color: 'white' };
      default:
        return { background: '#95a5a6', color: 'white' };
    }
  };

  const getCategoryBadgeStyle = (category) => {
    const colors = {
      anomaly: '#9b59b6',
      performance: '#e67e22',
      maintenance: '#16a085',
      cleaning: '#27ae60',
      system: '#34495e'
    };
    return { background: colors[category] || '#95a5a6', color: 'white' };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Sidebar Navigation */}
      <div style={{ 
        width: '280px', 
        backgroundColor: '#2c3e50', 
        color: 'white',
        padding: '30px 20px',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>☀️ Solar Panel</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#95a5a6' }}>Alert System</p>
        </div>

        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👤</div>
          <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{user?.name}</div>
          <div style={{ fontSize: '0.85rem', color: '#95a5a6' }}>{user?.email}</div>
        </div>

        <Link to="/customer-dashboard" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(52, 152, 219, 0.2)',
            color: 'white',
            border: '1px solid rgba(52, 152, 219, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '280px', flex: 1, padding: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', marginBottom: '10px' }}>🔔 Alert Center</h1>
        <p style={{ color: '#7f8c8d', marginBottom: '30px', fontSize: '1.1rem' }}>
          Monitor and manage your solar panel alerts
        </p>

        {/* Alert Conditions Info Box */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '25px', 
          borderRadius: '12px', 
          marginBottom: '25px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            📋 Alert Trigger Conditions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', fontSize: '14px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '15px' }}>🌡️ Temperature Alert</div>
              <div style={{ marginBottom: '4px' }}>Condition: <strong>Temperature {'>'} 65°C</strong></div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Severity: Critical | Can damage solar cells</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '15px' }}>💨 Dust Accumulation</div>
              <div style={{ marginBottom: '4px' }}>Condition: <strong>Dust Level {'>'} 100</strong></div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Severity: Warning | Cleaning recommended</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '15px' }}>🌥️ Shading Issue</div>
              <div style={{ marginBottom: '4px' }}>Condition: <strong>Shading {'>'} 30%</strong></div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Severity: Info | May affect efficiency</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '15px' }}>📉 Efficiency Drop</div>
              <div style={{ marginBottom: '4px' }}>Condition: <strong>Drop {'>'} 15%</strong></div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Severity: Critical | Below expected performance</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '15px' }}>🧹 Cleaning Required</div>
              <div style={{ marginBottom: '4px' }}>Condition: <strong>Efficiency Loss {'>'} 8%</strong></div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Severity: Warning | ML-based or 60+ days</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '15px' }}>🔍 Anomaly Detection</div>
              <div style={{ marginBottom: '4px' }}>Condition: <strong>ML Confidence {'>'} 60%</strong></div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Severity: AI-based | Unusual patterns</div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '25px' }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50', marginBottom: '8px' }}>{stats.total}</div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Total Alerts</div>
          </div>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #fee', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#e74c3c', marginBottom: '8px' }}>{stats.critical}</div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Critical</div>
          </div>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #fef9e7', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f39c12', marginBottom: '8px' }}>{stats.warning}</div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Warnings</div>
          </div>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #ebf5fb', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3498db', marginBottom: '8px' }}>{stats.info}</div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Info</div>
          </div>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '2px solid #d5f4e6', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#27ae60', marginBottom: '8px' }}>{stats.unresolved}</div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Unresolved</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ fontWeight: '600', color: '#2c3e50', fontSize: '15px' }}>🔍 Filters:</div>
          
          <select 
            value={selectedPanel} 
            onChange={(e) => setSelectedPanel(e.target.value)} 
            style={{ padding: '10px 14px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '14px', minWidth: '200px', cursor: 'pointer', fontWeight: '500' }}
          >
            <option value="all">🔆 All Panels</option>
            {panels.map(panel => (
              <option key={panel._id} value={panel._id}>
                {panel.name} {panel.location ? `(${panel.location})` : ''}
              </option>
            ))}
          </select>

          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} style={{ padding: '10px 14px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <option value="all">All Severities</option>
            <option value="critical">🔴 Critical</option>
            <option value="warning">🟡 Warning</option>
            <option value="info">🔵 Info</option>
          </select>

          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '10px 14px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <option value="all">All Categories</option>
            <option value="anomaly">🔍 Anomaly</option>
            <option value="performance">📉 Performance</option>
            <option value="maintenance">🔧 Maintenance</option>
            <option value="cleaning">🧹 Cleaning</option>
            <option value="system">⚙️ System</option>
          </select>

          <select value={filterResolved} onChange={(e) => setFilterResolved(e.target.value)} style={{ padding: '10px 14px', border: '2px solid #ddd', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <option value="false">❌ Unresolved Only</option>
            <option value="true">✅ Resolved Only</option>
            <option value="">📋 All Alerts</option>
          </select>

          <button onClick={fetchAlerts} style={{ marginLeft: 'auto', background: '#3498db', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', boxShadow: '0 2px 6px rgba(52, 152, 219, 0.3)' }}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Alerts List */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#95a5a6' }}>
              <RefreshCw size={48} style={{ marginBottom: '16px', opacity: 0.3, animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '16px', margin: 0 }}>Loading alerts...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#95a5a6' }}>
              <CheckCircle size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <h3 style={{ margin: '0 0 8px', color: '#7f8c8d' }}>No alerts found</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <div>
              {alerts.map((alert, index) => (
                <div 
                  key={alert._id} 
                  style={{ 
                    padding: '20px', 
                    borderBottom: index < alerts.length - 1 ? '1px solid #f0f0f0' : 'none', 
                    opacity: alert.isResolved ? 0.6 : 1,
                    borderLeft: `5px solid ${getSeverityBadgeStyle(alert.severity).background}`
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ marginTop: '2px' }}>{getSeverityIcon(alert.severity)}</div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <span style={{ ...getSeverityBadgeStyle(alert.severity), padding: '5px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
                          {alert.severity}
                        </span>
                        <span style={{ ...getCategoryBadgeStyle(alert.category), padding: '5px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' }}>
                          {alert.category}
                        </span>
                        {alert.isResolved && (
                          <span style={{ background: '#27ae60', color: 'white', padding: '5px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                            ✓ RESOLVED
                          </span>
                        )}
                      </div>
                      
                      <div style={{ fontSize: '16px', color: '#2c3e50', marginBottom: '10px', fontWeight: '500' }}>
                        {alert.message}
                      </div>
                      
                      <div style={{ fontSize: '13px', color: '#7f8c8d', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <span>📅 {formatDate(alert.createdAt)}</span>
                        {alert.panelId?.name && <span>🔆 {alert.panelId.name}</span>}
                        {alert.panelId?.location && <span>📍 {alert.panelId.location}</span>}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!alert.isResolved && (
                        <button 
                          onClick={() => handleResolve(alert._id)} 
                          style={{ 
                            background: '#27ae60', 
                            color: 'white', 
                            border: 'none', 
                            padding: '10px 16px', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            fontSize: '13px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            fontWeight: '600',
                            boxShadow: '0 2px 6px rgba(39, 174, 96, 0.3)'
                          }}
                        >
                          <CheckCircle size={14} />
                          Resolve
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(alert._id)} 
                        style={{ 
                          background: '#e74c3c', 
                          color: 'white', 
                          border: 'none', 
                          padding: '10px 16px', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          fontSize: '13px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          fontWeight: '600',
                          boxShadow: '0 2px 6px rgba(231, 76, 60, 0.3)'
                        }}
                      >
                        <Trash2 size={14} />
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
    </div>
  );
};

export default AlertsPage;
