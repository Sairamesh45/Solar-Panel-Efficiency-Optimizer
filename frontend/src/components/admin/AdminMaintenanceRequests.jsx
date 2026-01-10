
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

  if (loading) return <div>Loading maintenance requests...</div>;

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Maintenance Requests (Assign Installer)</h2>
      {requests.length === 0 ? <div>No pending requests.</div> : (
        <div style={{ display: 'grid', gap: 20 }}>
          {requests.map(req => (
            <div key={req._id} style={{ background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3>{req.type} for Panel {req.panelId}</h3>
              <p><strong>Requested:</strong> {new Date(req.createdAt).toLocaleString()}</p>
              <p><strong>Notes:</strong> {req.notes || 'N/A'}</p>
              {(!req.installerId && req.status === 'pending') ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label>Assign Installer: </label>
                  <select
                    value={selectedInstallers[req._id] || ''}
                    onChange={e => handleSelectInstaller(req._id, e.target.value)}
                  >
                    <option value="" disabled>Select Installer</option>
                    {installers.filter(inst => inst.role === 'Installer').map(inst => (
                      <option key={inst._id} value={inst._id}>{inst.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssign(req._id)}
                    disabled={!selectedInstallers[req._id]}
                    style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #ccc', background: '#1976d2', color: '#fff', cursor: selectedInstallers[req._id] ? 'pointer' : 'not-allowed' }}
                  >
                    Assign
                  </button>
                </div>
              ) : (
                <div style={{ color: '#1976d2', fontWeight: 500 }}>
                  Assigned to installer
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMaintenanceRequests;
