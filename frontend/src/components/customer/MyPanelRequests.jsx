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
    return <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d', fontSize: '1.1rem' }}>⏳ Loading your requests...</div>;
  }

  if (!requests.length) {
    return (
      <div style={{ 
        padding: '60px 40px', 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)', 
        borderRadius: '16px', 
        margin: '20px 0',
        color: 'white',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📋</div>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.5rem' }}>No Panel Requests</h3>
        <p style={{ margin: 0, opacity: 0.9 }}>You haven't made any panel requests yet</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gap: '20px' }}>
        {requests.map(req => (
          <div
            key={req._id}
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e9ecef',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }}
          >
            {/* Decorative corner */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '120px',
              height: '120px',
              background: req.status === 'approved' 
                ? 'linear-gradient(135deg, #27ae60 0%, #229954 100%)' 
                : req.status === 'rejected' 
                ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)' 
                : 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
              opacity: 0.08,
              borderRadius: '0 0 0 100%'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)'
                  }}>
                    📦
                  </div>
                  <h4 style={{ margin: 0, color: '#2c3e50', fontSize: '1.3rem' }}>{req.name}</h4>
                </div>
                <span
                  style={{
                    padding: '8px 16px',
                    borderRadius: '25px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    background: req.status === 'approved' 
                      ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)' 
                      : req.status === 'rejected' 
                      ? 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)' 
                      : 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                    color: req.status === 'approved' ? '#27ae60' : req.status === 'rejected' ? '#e74c3c' : '#f39c12',
                    border: `2px solid ${req.status === 'approved' ? '#27ae60' : req.status === 'rejected' ? '#e74c3c' : '#f39c12'}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {req.status === 'approved' && '✓ '}
                  {req.status === 'rejected' && '✗ '}
                  {req.status === 'pending' && '⏳ '}
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </span>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '12px', 
                marginBottom: '16px' 
              }}>
                <div style={{ background: '#f8f9fa', padding: '14px', borderRadius: '10px', border: '1px solid #e9ecef' }}>
                  <label style={{ fontSize: '0.75rem', color: '#7f8c8d', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📍 Location</label>
                  <p style={{ margin: '6px 0 0 0', color: '#2c3e50', fontWeight: '600', fontSize: '1rem' }}>{req.location || 'N/A'}</p>
                </div>
                <div style={{ background: '#f8f9fa', padding: '14px', borderRadius: '10px', border: '1px solid #e9ecef' }}>
                  <label style={{ fontSize: '0.75rem', color: '#7f8c8d', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚡ Wattage</label>
                  <p style={{ margin: '6px 0 0 0', color: '#2c3e50', fontWeight: '600', fontSize: '1rem' }}>{req.wattage || 'N/A'} W</p>
                </div>
                <div style={{ background: '#f8f9fa', padding: '14px', borderRadius: '10px', border: '1px solid #e9ecef' }}>
                  <label style={{ fontSize: '0.75rem', color: '#7f8c8d', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏷️ Brand</label>
                  <p style={{ margin: '6px 0 0 0', color: '#2c3e50', fontWeight: '600', fontSize: '1rem' }}>{req.brand || 'N/A'}</p>
                </div>
                <div style={{ background: '#f8f9fa', padding: '14px', borderRadius: '10px', border: '1px solid #e9ecef' }}>
                  <label style={{ fontSize: '0.75rem', color: '#7f8c8d', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📅 Requested</label>
                  <p style={{ margin: '6px 0 0 0', color: '#2c3e50', fontWeight: '600', fontSize: '1rem' }}>
                    {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>

              {req.notes && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '14px', 
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
                  borderRadius: '10px', 
                  borderLeft: '4px solid #3498db' 
                }}>
                  <label style={{ fontSize: '0.75rem', color: '#2980b9', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    💬 Notes
                  </label>
                  <p style={{ margin: '8px 0 0 0', color: '#2c3e50', fontSize: '0.95rem', lineHeight: '1.5' }}>{req.notes}</p>
                </div>
              )}

              {/* Timeline toggle button */}
              {req.timeline && req.timeline.length > 0 && (
                <>
                  <button
                    onClick={() => toggleTimeline(req._id)}
                    style={{
                      marginTop: '16px',
                      padding: '12px 20px',
                      background: expandedId === req._id 
                        ? 'linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%)' 
                        : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(52, 152, 219, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{expandedId === req._id ? '▲' : '▼'}</span>
                    {expandedId === req._id ? 'Hide Timeline' : 'View Timeline'}
                  </button>

                  {expandedId === req._id && (
                    <PanelRequestTimeline timeline={req.timeline} />
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPanelRequests;
