import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const AdminMaintenanceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [installers, setInstallers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstallers, setSelectedInstallers] = useState({});

  useEffect(() => {
    fetchRequests();
    fetchInstallers();
  }, []);

  const fetchRequests = async () => {
    const res = await axiosInstance.get('/maintenance/pending');
    setRequests(res.data.data || []);
    setLoading(false);
  };

  const fetchInstallers = async () => {
    const res = await axiosInstance.get('/admin/users?role=Installer');
    setInstallers(res.data.data || []);
  };


  const handleSelectInstaller = (requestId, installerId) => {
    setSelectedInstallers(prev => ({ ...prev, [requestId]: installerId }));
  };

  const handleAssign = async (requestId) => {
    const installerId = selectedInstallers[requestId];
    if (!installerId) return;
    await axiosInstance.post('/maintenance/assign', { id: requestId, installerId });
    fetchRequests();
    setSelectedInstallers(prev => ({ ...prev, [requestId]: '' }));
  };

  if (loading) return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      color: '#7f8c8d', 
      fontSize: '1.1rem' 
    }}>
      Loading maintenance requests...
    </div>
  );

  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h2 style={{ margin: 0, color: '#122436', fontSize: '1.9rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '1.25rem', color: '#6b8aa4' }}>🔧</span>
          Maintenance Requests
        </h2>
      </div>

      {requests.length === 0 ? (
        <div style={{ 
          padding: '60px 40px', 
          textAlign: 'center', 
          background: '#fbfdff', 
          borderRadius: '14px',
          color: '#2c3e50',
          boxShadow: '0 6px 20px rgba(18,38,63,0.06)'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem' }}>No Maintenance Requests</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>No pending maintenance requests at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {requests.map(req => (
            <div key={req._id} style={{ 
              background: '#ffffff',
              padding: 22,
              borderRadius: 14,
              boxShadow: '0 6px 24px rgba(18,38,63,0.06)',
              border: '1px solid #eef3f6',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 12px 36px rgba(18,38,63,0.08)';
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(18,38,63,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    background: req.type === 'cleaning' 
                      ? 'linear-gradient(135deg,#3aa0ff,#2d6fb6)' 
                      : req.type === 'inspection' 
                      ? 'linear-gradient(135deg,#b08be6,#7b5fb3)' 
                      : 'linear-gradient(135deg,#ffb577,#e07a2f)',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    color: 'white',
                    boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.08)'
                  }}>
                    {req.type.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 6px 0', color: '#122436', fontSize: '1.18rem' }}>
                      {req.type.charAt(0).toUpperCase() + req.type.slice(1)}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: '#6b7f8f' }}>
                      Panel: <span style={{ fontWeight: '700', color: '#122436' }}>{req.panelId?.name || req.panelId}</span>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '8px 16px',
                      borderRadius: '22px',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      background: req.status === 'completed' 
                        ? 'rgba(41, 184, 86, 0.08)' 
                        : req.status === 'in_progress' 
                        ? 'rgba(243, 156, 18, 0.08)' 
                        : 'rgba(149,165,166,0.06)',
                      color: req.status === 'completed' ? '#27ae60' : req.status === 'in_progress' ? '#f39c12' : '#7f8c8d',
                      border: `1px solid ${req.status === 'completed' ? 'rgba(39,174,96,0.18)' : req.status === 'in_progress' ? 'rgba(243,156,18,0.18)' : 'rgba(149,165,166,0.12)'}`
                    }}
                  >
                    {req.status.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr', 
                  gap: '12px', 
                  marginBottom: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f6f9'
                }}>
                  <div style={{ background: '#fbfdff', padding: '14px', borderRadius: '10px', border: '1px solid #eef6fb' }}>
                    <label style={{ fontSize: '0.72rem', color: '#9aa7b2', fontWeight: '700', textTransform: 'uppercase' }}>Requested</label>
                    <p style={{ margin: '6px 0 0 0', color: '#122436', fontWeight: '700', fontSize: '0.98rem' }}>
                      {new Date(req.createdAt).toLocaleString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>

                  {req.notes && (
                    <div style={{ 
                      padding: '14px', 
                      background: '#f1fbff', 
                      borderRadius: '10px', 
                      borderLeft: '4px solid #3aa0ff' 
                    }}>
                      <label style={{ fontSize: '0.72rem', color: '#2b7bbf', fontWeight: '800', textTransform: 'uppercase' }}>
                        Notes
                      </label>
                      <p style={{ margin: '8px 0 0 0', color: '#122436', fontSize: '0.95rem', lineHeight: '1.5' }}>{req.notes}</p>
                    </div>
                  )}

                  {req.installerId && (
                    <div style={{ 
                      padding: '14px', 
                      background: '#f9f9f9', 
                      borderRadius: '10px', 
                      borderLeft: '4px solid #27ae60' 
                    }}>
                      <label style={{ fontSize: '0.72rem', color: '#27ae60', fontWeight: '800', textTransform: 'uppercase' }}>
                        Assigned Installer
                      </label>
                      <p style={{ margin: '8px 0 0 0', color: '#122436', fontSize: '0.95rem', lineHeight: '1.5' }}>{req.installerId.name || req.installerId}</p>
                    </div>
                  )}

                  {req.costEstimate && (
                    <div style={{ 
                      padding: '14px', 
                      background: '#f9f9f9', 
                      borderRadius: '10px', 
                      border: '1px solid #e0e0e0' 
                    }}>
                      <label style={{ fontSize: '0.72rem', color: '#7f8c8d', fontWeight: '700', textTransform: 'uppercase' }}>
                        Cost Estimate
                      </label>
                      <p style={{ margin: '8px 0 0 0', color: '#122436', fontSize: '0.95rem' }}>
                        ₹{req.costEstimate.laborCost.toLocaleString()} + Parts
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMaintenanceRequests;
