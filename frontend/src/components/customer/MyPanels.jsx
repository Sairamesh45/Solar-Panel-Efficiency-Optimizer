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

  if (loading) return <div>Loading your panels...</div>;
  if (!panels.length) return <div>No panels assigned yet. Request a new panel to get started!</div>;

  return (
    <div>
      {requestMsg && <div style={{color:'#2c3e50',background:'#e3f2fd',padding:'8px 16px',borderRadius:6,marginBottom:10}}>{requestMsg}</div>}
      {!panels.length ? (
        <div>No panels assigned yet. Request a new panel to get started!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {panels.map(panel => (
          <div key={panel._id} style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{panel.name}</h3>
            <p><strong>Location:</strong> {panel.location || 'N/A'}</p>
            <p><strong>Wattage:</strong> {panel.specifications?.wattage || 'N/A'}</p>
            <p><strong>Brand:</strong> {panel.specifications?.brand || 'N/A'}</p>
            <p><strong>Installed:</strong> {panel.installationDate ? new Date(panel.installationDate).toLocaleDateString() : 'N/A'}</p>
            <button onClick={() => handleRequestDelete(panel)} style={{marginTop:10,padding:'6px 14px',background:'#e74c3c',color:'#fff',border:'none',borderRadius:6,cursor:'pointer'}}>Request Delete</button>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default MyPanels;
