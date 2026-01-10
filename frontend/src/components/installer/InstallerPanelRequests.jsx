import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosInstance';

const InstallerPanelRequests = () => {
  const { user } = useAuthContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedRequests();
  }, [user]);

  const fetchAssignedRequests = async () => {
    try {
      const res = await axiosInstance.get('/panel-request');
      // Filter for requests assigned to this installer that are approved but not completed
      const assignedToMe = res.data.data.filter(
        req => req.installerId === user?._id && req.status === 'approved'
      );
      setRequests(assignedToMe);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleMarkComplete = async (requestId) => {
    try {
      await axiosInstance.post('/panel-request/complete', {
        id: requestId,
        installerId: user._id
      });
      alert('Installation marked as complete!');
      fetchAssignedRequests(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to mark installation as complete');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading assigned installations...</div>;
  }

  if (!requests.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ecf0f1', borderRadius: '8px', margin: '20px 0' }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔧</div>
        <p style={{ color: '#7f8c8d' }}>No panel installations assigned to you</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        🔧 Assigned Panel Installations
        <span style={{ 
          fontSize: '0.9rem', 
          background: '#3498db', 
          color: 'white', 
          padding: '4px 12px', 
          borderRadius: '12px',
          fontWeight: 'bold'
        }}>
          {requests.length}
        </span>
      </h2>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {requests.map(req => (
          <div
            key={req._id}
            style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid #ecf0f1'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.2rem' }}>
                  {req.name}
                </h3>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    background: '#e8f5e9',
                    color: '#27ae60',
                    border: '1px solid #27ae60'
                  }}
                >
                  ✓ Approved - Ready to Install
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#7f8c8d', display: 'block', marginBottom: '4px' }}>📍 Location</label>
                <p style={{ margin: 0, color: '#2c3e50', fontWeight: '500' }}>{req.location || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#7f8c8d', display: 'block', marginBottom: '4px' }}>⚡ Wattage</label>
                <p style={{ margin: 0, color: '#2c3e50', fontWeight: '500' }}>{req.wattage || 'N/A'} W</p>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#7f8c8d', display: 'block', marginBottom: '4px' }}>🏢 Brand</label>
                <p style={{ margin: 0, color: '#2c3e50', fontWeight: '500' }}>{req.brand || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#7f8c8d', display: 'block', marginBottom: '4px' }}>📅 Requested</label>
                <p style={{ margin: 0, color: '#2c3e50', fontWeight: '500' }}>{new Date(req.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {req.notes && (
              <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #3498db', marginBottom: '15px' }}>
                <label style={{ fontSize: '0.85rem', color: '#7f8c8d', display: 'block', marginBottom: '4px' }}>📝 Notes</label>
                <p style={{ margin: 0, color: '#2c3e50', fontSize: '0.95rem' }}>{req.notes}</p>
              </div>
            )}

            {req.panelId && (
              <div style={{ padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '6px', marginBottom: '15px' }}>
                <label style={{ fontSize: '0.85rem', color: '#27ae60', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                  ✓ Panel Created
                </label>
                <p style={{ margin: 0, color: '#2c3e50', fontSize: '0.85rem' }}>Panel ID: {req.panelId}</p>
              </div>
            )}

            <button
              onClick={() => handleMarkComplete(req._id)}
              style={{
                width: '100%',
                padding: '12px 20px',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(39, 174, 96, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#229954';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#27ae60';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(39, 174, 96, 0.3)';
              }}
            >
              ✓ Mark Installation as Complete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstallerPanelRequests;
