import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const InstallerMaintenanceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateMsg, setUpdateMsg] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const res = await axiosInstance.get('/maintenance/assigned');
    setRequests(res.data.data || []);
    setLoading(false);
  };

  const handleUpdate = async (id, status, notes) => {
    await axiosInstance.post('/maintenance/update', { id, status, notes });
    setUpdateMsg('Updated successfully!');
    fetchRequests();
    setTimeout(() => setUpdateMsg(''), 1500);
  };

  if (loading) return <div>Loading assigned maintenance requests...</div>;

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Assigned Maintenance Requests</h2>
      {updateMsg && <div style={{ color: '#27ae60', marginBottom: 12 }}>{updateMsg}</div>}
      {requests.length === 0 ? <div>No assigned requests.</div> : (
        <div style={{ display: 'grid', gap: 20 }}>
          {requests.map(req => (
            <div key={req._id} style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3>{req.type} for Panel {req.panelId}</h3>
              <p><strong>Requested:</strong> {new Date(req.createdAt).toLocaleString()}</p>
              <p><strong>Status:</strong> {req.status}</p>
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

              {/* Only show update form if not completed */}
              {req.status !== 'completed' ? (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    const status = e.target.status.value;
                    const notes = e.target.notes.value;
                    handleUpdate(req._id, status, notes);
                  }}
                  style={{ marginTop: 8 }}
                >
                  <div>
                    <label>Update Status: </label>
                    <select name="status" defaultValue={req.status}>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label>Update Notes: </label>
                    <input name="notes" type="text" defaultValue={req.notes} style={{ width: '80%' }} />
                  </div>
                  <button type="submit" style={{ marginTop: 8, padding: '4px 12px', borderRadius: 4, border: '1px solid #ccc', background: '#1976d2', color: '#fff', cursor: 'pointer' }}>
                    Update
                  </button>
                </form>
              ) : (
                <div style={{ marginTop: 8, color: '#27ae60', fontWeight: 500 }}>
                  Request Completed
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstallerMaintenanceRequests;
