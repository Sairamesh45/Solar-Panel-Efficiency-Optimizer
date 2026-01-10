import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import PanelRequestTimeline from './PanelRequestTimeline';

const MyPanelRequests = ({ userId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get('/panel-request');
      const userRequests = res.data.data.filter(req => req.userId === userId);
      setRequests(userRequests);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const toggleTimeline = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading your requests...</div>;
  }

  if (!requests.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ecf0f1', borderRadius: '8px', margin: '20px 0' }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
        <p style={{ color: '#7f8c8d' }}>You haven't made any panel requests yet</p>
      </div>
    );
  }

  return (
    <div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, color: '#2c3e50' }}>{req.name}</h4>
              <span
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  background: req.status === 'approved' ? '#e8f5e9' : req.status === 'rejected' ? '#ffcdd2' : '#fff3e0',
                  color: req.status === 'approved' ? '#27ae60' : req.status === 'rejected' ? '#e74c3c' : '#f39c12',
                  border: `1px solid ${req.status === 'approved' ? '#27ae60' : req.status === 'rejected' ? '#e74c3c' : '#f39c12'}`
                }}
              >
                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Location</label>
                <p style={{ margin: '2px 0 0 0', color: '#2c3e50', fontWeight: '500' }}>{req.location || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Wattage</label>
                <p style={{ margin: '2px 0 0 0', color: '#2c3e50', fontWeight: '500' }}>{req.wattage || 'N/A'} W</p>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Brand</label>
                <p style={{ margin: '2px 0 0 0', color: '#2c3e50', fontWeight: '500' }}>{req.brand || 'N/A'}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Requested</label>
                <p style={{ margin: '2px 0 0 0', color: '#2c3e50', fontWeight: '500' }}>{new Date(req.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {req.notes && (
              <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #3498db' }}>
                <label style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Notes</label>
                <p style={{ margin: '4px 0 0 0', color: '#2c3e50', fontSize: '0.95rem' }}>{req.notes}</p>
              </div>
            )}

            {/* Timeline toggle button */}
            {req.timeline && req.timeline.length > 0 && (
              <>
                <button
                  onClick={() => toggleTimeline(req._id)}
                  style={{
                    marginTop: '15px',
                    padding: '8px 16px',
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  {expandedId === req._id ? '▲ Hide Timeline' : '▼ View Timeline'}
                </button>

                {expandedId === req._id && (
                  <PanelRequestTimeline timeline={req.timeline} />
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPanelRequests;
