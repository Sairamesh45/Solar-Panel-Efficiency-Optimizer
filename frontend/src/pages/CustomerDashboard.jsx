import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSolarAnalysis } from '../hooks/useSolarAnalysis';
import { useAuthContext } from '../context/AuthContext';
import { formatDateTime } from '../utils/formatters';
import SensorTrends from '../components/solar/SensorTrends';

import MyPanels from '../components/customer/MyPanels';
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
    <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px', minHeight: '60vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', margin: 0 }}>👤 Customer Dashboard</h1>
        <p style={{ color: '#7f8c8d', margin: '5px 0 0 0' }}>Monitor your solar system performance</p>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#e8f5e9', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} title="Total number of analyses performed on your solar system.">
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔋</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60', marginBottom: '5px' }}>{totalAnalyses}</div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Total Analyses</div>
        </div>

        <div style={{ backgroundColor: '#fff3e0', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} title="Average health score of your solar system based on analyses (higher is better).">
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⚡</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12', marginBottom: '5px' }}>{avgEfficiency}%</div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Average Health Score</div>
        </div>

        <div style={{ backgroundColor: '#e3f2fd', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} title="Current system size in kilowatts (kW).">
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

      {/* Help section for charts */}
      <div style={{marginBottom: 20, color: '#607d8b', fontSize: '1rem'}}>
        <strong>Tip:</strong> Hover over the chart lines or table rows for detailed sensor values. Metrics like dust, tilt, and shading help you spot efficiency issues early.
      </div>

      {/* My Panels */}
      <MyPanels userId={user?._id} />

      {/* Sensor Trends */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>Sensor Trends (Recent)</h2>
        <button onClick={handleExportSensorData} style={{ padding: '8px 16px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>Export Sensor Data (CSV)</button>
      </div>
      <SensorTrends />
      <button onClick={() => setShowPanelModal(true)} style={{margin:'10px 0 10px 0',padding:'8px 18px',background:'#3498db',color:'#fff',border:'none',borderRadius:6,cursor:'pointer'}}>
        Request New Panel
      </button>
      <RequestPanelModal open={showPanelModal} onClose={() => setShowPanelModal(false)} onSubmit={handleRequestPanel} />
      <button onClick={() => setShowRequestModal(true)} style={{margin:'10px 0 10px 0',padding:'8px 18px',background:'#27ae60',color:'#fff',border:'none',borderRadius:6,cursor:'pointer'}}>
        Request Maintenance
      </button>
      <RequestMaintenanceModal open={showRequestModal} onClose={() => setShowRequestModal(false)} onSubmit={handleRequestMaintenance} userId={user?._id} />
      {requestMsg && <div style={{marginTop:12, color:'#27ae60', fontWeight:'bold'}}>{requestMsg}</div>}
      {panelMsg && <div style={{marginTop:12, color:'#3498db', fontWeight:'bold'}}>{panelMsg}</div>}



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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportAnalysisHistory} style={{ padding: '8px 16px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}>Export History (CSV)</button>
          <Link to="/analyze" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '12px 24px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              ➕ New Analysis
            </button>
          </Link>
        </div>
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
