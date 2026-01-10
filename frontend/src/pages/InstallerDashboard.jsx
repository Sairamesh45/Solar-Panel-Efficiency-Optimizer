import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ScheduleMaintenanceModal from '../components/installer/ScheduleMaintenanceModal';
import axiosInstance from '../api/axiosInstance';

const InstallerDashboard = () => {
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all panels
      const panelsRes = await axiosInstance.get('/panel');
      const allPanels = panelsRes.data.data || [];
      console.log('Fetched panels:', allPanels);
      
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

      {/* System Performance Table */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', marginBottom: '20px' }}>⚙️ System Performance</h2>
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

      {/* Maintenance Schedule */}
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#2c3e50', marginBottom: '20px' }}>🗓️ Maintenance Schedule</h2>
        
        {/* Pending Customer Requests */}
        {pendingRequests.length > 0 && (
          <div style={{ marginBottom: 30, padding: 20, backgroundColor: '#fff3e0', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#f39c12' }}>⚠️ Pending Customer Requests ({pendingRequests.length})</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {pendingRequests.map(req => (
                <div key={req._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: 'white', borderRadius: 6, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div>
                    <strong style={{ color: '#2c3e50' }}>{req.type.charAt(0).toUpperCase() + req.type.slice(1)}</strong>
                    <span style={{ margin: '0 8px', color: '#95a5a6' }}>•</span>
                    <span style={{ color: '#7f8c8d' }}>Panel ID: {req.panelId}</span>
                    {req.notes && (
                      <div style={{ marginTop: 4, fontSize: '0.9rem', color: '#7f8c8d' }}>
                        Note: {req.notes}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => handleMarkHandled(req._id)} 
                    style={{ padding: '8px 16px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Mark Handled
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Maintenance */}
        {scheduledMaintenance.length === 0 && pendingRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#95a5a6' }}>
            <p>No scheduled maintenance</p>
          </div>
        ) : scheduledMaintenance.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ecf0f1' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Panel ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Notes</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduledMaintenance.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                    <td style={{ padding: '12px' }}>{new Date(item.scheduledDate).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ textTransform: 'capitalize' }}>{item.type}</span>
                    </td>
                    <td style={{ padding: '12px' }}>{item.panelId}</td>
                    <td style={{ padding: '12px' }}>{item.notes || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      {item.completed ? (
                        <span style={{ color: '#27ae60', fontWeight: 'bold' }}>✓ Completed</span>
                      ) : item.handled ? (
                        <span style={{ color: '#3498db', fontWeight: 'bold' }}>⏳ In Progress</span>
                      ) : (
                        <span style={{ color: '#f39c12', fontWeight: 'bold' }}>📅 Scheduled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
          <button onClick={() => setShowModal(true)} style={{ width: '100%', padding: '15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            🔧 Schedule Maintenance
          </button>
          <button onClick={handleContactCustomer} style={{ width: '100%', padding: '15px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            📞 Contact Customer
          </button>
        </div>
        <ScheduleMaintenanceModal open={showModal} onClose={() => setShowModal(false)} onSubmit={handleScheduleMaintenance} />
        {modalMsg && <div style={{marginTop:12, color:'#27ae60', fontWeight:'bold'}}>{modalMsg}</div>}
      </div>
    </div>
  );
};

export default InstallerDashboard;
