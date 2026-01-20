import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import TrendsAnalysis from './TrendsAnalysis';
import ScheduleMaintenanceModal from '../components/installer/ScheduleMaintenanceModal';
import InstallerMaintenanceRequests from '../components/installer/InstallerMaintenanceRequests';
import InstallerPanelRequests from '../components/installer/InstallerPanelRequests';
import PartsCatalogManager from '../components/installer/PartsCatalogManager';
import axiosInstance from '../api/axiosInstance';

const InstallerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [stats, setStats] = useState({
    totalInstallations: 0,
    healthySystems: 0,
    needsAttention: 0,
    criticalIssues: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [scheduledMaintenance, setScheduledMaintenance] = useState([]);
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all panels
      const panelsRes = await axiosInstance.get('/panel');
      const allPanels = panelsRes.data.data || [];
      
      // If no panels, just update stats and return
      if (allPanels.length === 0) {
        setStats({
          totalInstallations: 0,
          healthySystems: 0,
          needsAttention: 0,
          criticalIssues: 0
        });
        setLoading(false);
        return;
      }

      // Fetch sensor data for each panel to calculate health
      const panelHealthPromises = allPanels.map(async (panel) => {
        try {
          const sensorRes = await axiosInstance.get(`/sensor?panelId=${panel._id}`);
          const sensorData = sensorRes.data.data || [];
          const latestData = sensorData[0];
          
          let health = 'healthy';
          if (latestData) {
            // Calculate health based on sensor data
            const tempIssue = latestData.temperature > 65;
            const dustIssue = latestData.dust > 100;
            const shadingIssue = latestData.shading > 30;
            
            if (tempIssue || dustIssue) {
              health = 'critical';
            } else if (shadingIssue) {
              health = 'attention';
            }
          } else {
            // No sensor data yet - consider it healthy by default
            health = 'healthy';
          }
          
          return { ...panel, latestSensor: latestData, health };
        } catch (err) {
          console.error(`Error fetching sensor data for panel ${panel._id}:`, err);
          // Even if sensor fetch fails, include the panel with healthy status
          return { ...panel, latestSensor: null, health: 'healthy' };
        }
      });

      const panelsWithHealth = await Promise.all(panelHealthPromises);
      console.log('Panels with health:', panelsWithHealth);
      setPanels(panelsWithHealth);

      // Calculate stats
      const healthy = panelsWithHealth.filter(p => p.health === 'healthy').length;
      const attention = panelsWithHealth.filter(p => p.health === 'attention').length;
      const critical = panelsWithHealth.filter(p => p.health === 'critical').length;
      
      setStats({
        totalInstallations: allPanels.length,
        healthySystems: healthy,
        needsAttention: attention,
        criticalIssues: critical
      });

      // Fetch pending maintenance requests
      try {
        const pendingRes = await axiosInstance.get('/maintenance/pending');
        setPendingRequests(pendingRes.data.data || []);
      } catch (err) {
        console.error('Error fetching pending requests:', err);
      }

      // Fetch all scheduled maintenance
      try {
        const scheduleRes = await axiosInstance.get('/maintenance/history');
        setScheduledMaintenance(scheduleRes.data.data || []);
      } catch (err) {
        console.error('Error fetching maintenance history:', err);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setLoading(false);
    }
  };

  const handleScheduleMaintenance = async (form) => {
    try {
      await axiosInstance.post('/maintenance/schedule', form);
      setModalMsg('Maintenance scheduled successfully!');
      fetchData(); // Refresh data
    } catch (err) {
      setModalMsg('Failed to schedule maintenance.');
    }
    setTimeout(() => { setShowModal(false); setModalMsg(''); }, 1500);
  };

  const handleContactCustomer = () => {
    window.location.href = 'mailto:customer@email.com?subject=Solar%20Panel%20Support';
  };

  const handleMarkHandled = async (id) => {
    try {
      await axiosInstance.post('/maintenance/handle', { id });
      fetchData(); // Refresh all data
    } catch (err) {
      console.error('Failed to mark as handled:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: '#e3f2fd', padding: '20px', borderRadius: '8px', color: '#0d47a1' }}>
          <strong>Loading installer dashboard...</strong>
        </div>
      </div>
    );
  }

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
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#95a5a6' }}>Installer Portal</p>
        </div>

        {/* User Info */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🧑‍🔧</div>
          <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{user?.name || 'Installer'}</div>
          <div style={{ fontSize: '0.85rem', color: '#95a5a6' }}>{user?.email}</div>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {[
            { id: 'overview', icon: '📊', label: 'Fleet Overview' },
            { id: 'systems', icon: '⚙️', label: 'System Performance' },
            { id: 'maintenance', icon: '🔧', label: 'Maintenance Requests' },
            { id: 'parts', icon: '🧰', label: 'Parts Catalog' },
            { id: 'panelRequests', icon: '📋', label: 'Panel Requests' },
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

        {/* Quick Actions */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h4 style={{ margin: '0 0 15px 0', color: 'white', fontSize: '0.9rem', opacity: 0.7 }}>QUICK ACTIONS</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setShowModal(true)} style={{
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
              🗓️ Schedule Maintenance
            </button>
            <Link to="/compare-panels" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '10px 14px',
                background: 'rgba(155, 89, 182, 0.2)',
                color: 'white',
                border: '1px solid rgba(155, 89, 182, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                width: '100%',
                textAlign: 'left'
              }}>
                📊 Compare Panels
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
        {/* Fleet Overview */}
        {activeSection === 'overview' && (
          <div>
            <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>Fleet Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <div style={{ backgroundColor: '#e3f2fd', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📦</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db', marginBottom: '5px' }}>{stats.totalInstallations}</div>
                <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Total Installations</div>
              </div>

              <div style={{ backgroundColor: '#e8f5e9', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🟢</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60', marginBottom: '5px' }}>{stats.healthySystems}</div>
                <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Healthy Systems</div>
              </div>

              <div style={{ backgroundColor: '#fff3e0', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🟡</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12', marginBottom: '5px' }}>{stats.needsAttention}</div>
                <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Needs Attention</div>
              </div>

              <div style={{ backgroundColor: '#ffcdd2', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔴</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c', marginBottom: '5px' }}>{stats.criticalIssues}</div>
                <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Critical Issues</div>
              </div>
            </div>

            {/* Performance Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
              {/* Fleet Health Summary */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '30px',
                borderRadius: '16px',
                color: 'white',
                boxShadow: '0 8px 24px rgba(102,126,234,0.25)'
              }}>
                <h3 style={{ margin: '0 0 25px 0', fontSize: '1.4rem', fontWeight: '600' }}>Fleet Health Analysis</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.15)', 
                    padding: '20px', 
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                      {stats.totalInstallations > 0 ? Math.round((stats.healthySystems / stats.totalInstallations) * 100) : 0}%
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Healthy Rate</div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.15)', 
                    padding: '20px', 
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                      {stats.criticalIssues + stats.needsAttention}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Need Service</div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.15)', 
                    padding: '20px', 
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '5px' }}>
                      {stats.totalInstallations}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Units</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ 
                background: '#ffffff',
                padding: '30px',
                borderRadius: '16px',
                border: '1px solid #e8ecf1',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '1.2rem' }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={() => setActiveSection('systems')}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'transform 0.2s',
                      boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <span>⚙️</span> View Systems
                  </button>
                  <button
                    onClick={() => setActiveSection('maintenance')}
                    style={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'transform 0.2s',
                      boxShadow: '0 4px 12px rgba(245,87,108,0.3)'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <span>🔧</span> Maintenance
                  </button>
                </div>
              </div>
            </div>

            {/* Priority Alerts */}
            {stats.criticalIssues > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                padding: '25px',
                borderRadius: '16px',
                color: 'white',
                marginBottom: '20px',
                boxShadow: '0 8px 24px rgba(255,107,107,0.25)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ fontSize: '2.5rem' }}>⚠️</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: '600' }}>Critical Systems Alert</h3>
                    <p style={{ margin: 0, opacity: 0.95, fontSize: '0.95rem' }}>
                      {stats.criticalIssues} system{stats.criticalIssues > 1 ? 's' : ''} require immediate attention. Please review and schedule maintenance.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSection('systems')}
                    style={{
                      background: 'rgba(255,255,255,0.25)',
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: '2px solid rgba(255,255,255,0.5)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.35)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.8)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.25)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}

            {/* Installation Summary */}
            <div style={{
              background: '#ffffff',
              padding: '30px',
              borderRadius: '16px',
              border: '1px solid #e8ecf1',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '1.4rem' }}>System Distribution</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ 
                  padding: '20px',
                  background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                  borderRadius: '12px',
                  borderLeft: '4px solid #27ae60'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#27ae60', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700' }}>
                    Optimal Performance
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60', marginBottom: '5px' }}>
                    {stats.healthySystems}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#2c3e50', opacity: 0.8 }}>
                    Systems running smoothly
                  </div>
                </div>
                <div style={{ 
                  padding: '20px',
                  background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                  borderRadius: '12px',
                  borderLeft: '4px solid #f39c12'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#f39c12', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700' }}>
                    Needs Monitoring
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12', marginBottom: '5px' }}>
                    {stats.needsAttention}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#2c3e50', opacity: 0.8 }}>
                    Require check-up soon
                  </div>
                </div>
                <div style={{ 
                  padding: '20px',
                  background: 'linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%)',
                  borderRadius: '12px',
                  borderLeft: '4px solid #e74c3c'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#e74c3c', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '700' }}>
                    Urgent Action
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c', marginBottom: '5px' }}>
                    {stats.criticalIssues}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#2c3e50', opacity: 0.8 }}>
                    Immediate service needed
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Performance Section */}
        {activeSection === 'systems' && (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>⚙️ System Performance</h2>
            {panels.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#95a5a6' }}>
                <p>No installations to manage yet</p>
                <p style={{ fontSize: '0.9rem' }}>Systems assigned to you will appear here</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ecf0f1' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Panel Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Location</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Temperature</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Dust</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Shading</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {panels.map((panel) => (
                  <tr key={panel._id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                    <td style={{ padding: '12px' }}>{panel.name}</td>
                    <td style={{ padding: '12px' }}>{panel.location || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      {panel.health === 'healthy' && <span style={{ color: '#27ae60', fontWeight: 'bold' }}>🟢 Healthy</span>}
                      {panel.health === 'attention' && <span style={{ color: '#f39c12', fontWeight: 'bold' }}>🟡 Attention</span>}
                      {panel.health === 'critical' && <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>🔴 Critical</span>}
                      {panel.health === 'unknown' && <span style={{ color: '#95a5a6' }}>⚪ Unknown</span>}
                    </td>
                    <td style={{ padding: '12px' }}>{panel.latestSensor?.temperature ? `${panel.latestSensor.temperature}°C` : 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{panel.latestSensor?.dust || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{panel.latestSensor?.shading ? `${panel.latestSensor.shading}%` : 'N/A'}</td>
                    <td style={{ padding: '12px' }}>{panel.latestSensor?.timestamp ? new Date(panel.latestSensor.timestamp).toLocaleString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
            )}
          </div>
        )}

        {/* Maintenance Requests Section */}
        {activeSection === 'maintenance' && (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>🔧 Maintenance Requests</h2>
            <InstallerMaintenanceRequests />
          </div>
        )}

        {/* Parts Catalog Section */}
        {activeSection === 'parts' && (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>🧰 Parts Catalog</h2>
            <PartsCatalogManager />
          </div>
        )}

        {/* Panel Requests Section */}
        {activeSection === 'panelRequests' && (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>📋 Panel Requests</h2>
            <InstallerPanelRequests />
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
        <ScheduleMaintenanceModal 
          open={showModal} 
          onClose={() => setShowModal(false)} 
          onSubmit={handleScheduleMaintenance} 
        />
        {modalMsg && (
          <div style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1000,
            background: '#27ae60',
            color: '#fff',
            padding: '15px 25px',
            borderRadius: 8,
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            {modalMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstallerDashboard;
