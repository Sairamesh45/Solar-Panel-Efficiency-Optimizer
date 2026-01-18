import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const MyMaintenanceRequests = ({ userId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchRequests();
    }
  }, [userId]);

  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get(`/maintenance/my-requests?userId=${userId}`);
      setRequests(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch maintenance requests:', err);
      setLoading(false);
    }
  };

  if (loading) return <div>Loading maintenance requests...</div>;
  if (!requests.length) return <div>No maintenance requests yet.</div>;

  return (
    <div style={{ marginTop: 30 }}>
      <h2>My Maintenance Requests</h2>
      <div style={{ display: 'grid', gap: 20 }}>
        {requests.map(req => (
          <div key={req._id} style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3>{req.type} for Panel {req.panelId?.name || req.panelId}</h3>
            <p><strong>Requested:</strong> {new Date(req.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> <span style={{ 
              color: req.status === 'completed' ? '#27ae60' : req.status === 'in_progress' ? '#f39c12' : '#7f8c8d',
              fontWeight: 'bold'
            }}>{req.status}</span></p>
            <p><strong>Notes:</strong> {req.notes || 'N/A'}</p>
            
            {/* Timeline */}
            {req.statusTimeline && req.statusTimeline.length > 0 && (
              <div style={{ marginTop: 12, padding: 10, background: '#f8f9fa', borderRadius: 8 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>Timeline</h4>
                {req.statusTimeline.map((event, idx) => (
                  <div key={idx} style={{ fontSize: 12, marginBottom: 4 }}>
                    <strong>{event.status}</strong> - {new Date(event.timestamp).toLocaleString()}
                    {event.notes && <span> ({event.notes})</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyMaintenanceRequests;
