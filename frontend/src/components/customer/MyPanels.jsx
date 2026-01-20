import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { createPanelRequest } from '../../api/panelRequest.api';

const MyPanels = ({ userId }) => {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [requestMsg, setRequestMsg] = useState('');

  useEffect(() => {
    if (userId) {
      axiosInstance.get(`/panel?userId=${userId}`)
        .then(res => {
          setPanels(res.data.data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [userId]);

  const handleRequestDelete = async (panel) => {
    try {
      await createPanelRequest({
        userId,
        name: panel.name,
        location: panel.location,
        wattage: panel.specifications?.wattage,
        brand: panel.specifications?.brand,
        notes: `Request to delete panel ${panel._id}`
      });
      setRequestMsg('Delete request sent for admin approval!');
    } catch (err) {
      setRequestMsg('Failed to send delete request.');
    }
    setTimeout(() => setRequestMsg(''), 2000);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>Loading your panels...</div>;
  if (!panels.length) return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center', 
      background: '#f8f9fa', 
      borderRadius: '12px',
      border: '1px solid #e9ecef'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.6 }}>🌞</div>
      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#495057' }}>No Panels Yet</h3>
      <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>Request a new solar panel to get started</p>
    </div>
  );

  return (
    <div>
      {requestMsg && (
        <div style={{
          color: '#27ae60',
          background: '#d4edda',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid #c3e6cb',
          fontSize: '0.9rem'
        }}>
          {requestMsg}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {panels.map(panel => (
          <div 
            key={panel._id} 
            style={{ 
              background: 'white',
              padding: 20,
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e9ecef',
              transition: 'box-shadow 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f3f5' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#3498db',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem'
              }}>
                📦
              </div>
              <h3 style={{ margin: 0, color: '#212529', fontSize: '1.15rem', fontWeight: '600' }}>{panel.name}</h3>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#868e96', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</div>
                <div style={{ color: '#495057', fontSize: '0.95rem' }}>{panel.location || 'N/A'}</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#868e96', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wattage</div>
                  <div style={{ color: '#495057', fontSize: '0.95rem', fontWeight: '600' }}>{panel.specifications?.wattage || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#868e96', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Brand</div>
                  <div style={{ color: '#495057', fontSize: '0.95rem', fontWeight: '600' }}>{panel.specifications?.brand || 'N/A'}</div>
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#868e96', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Installed</div>
                <div style={{ color: '#495057', fontSize: '0.95rem' }}>
                  {panel.installationDate ? new Date(panel.installationDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'N/A'}
                </div>
              </div>
            </div>

            <button 
              onClick={() => handleRequestDelete(panel)} 
              style={{
                width: '100%',
                padding: '10px',
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.9rem',
                transition: 'background 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#c82333';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#dc3545';
              }}
            >
              Request Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPanels;