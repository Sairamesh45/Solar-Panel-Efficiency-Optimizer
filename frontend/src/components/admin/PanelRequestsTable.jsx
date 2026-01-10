import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const PanelRequestsTable = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get('/panel-request');
      setRequests(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    const isDeleteRequest = request.notes?.toLowerCase().includes('delete panel');
    try {
      if (isDeleteRequest) {
        // Extract panelId from notes
        const match = request.notes.match(/delete panel ([a-f0-9]{24})/i);
        const panelId = match ? match[1] : null;
        if (panelId) {
          await axiosInstance.delete(`/panel/${panelId}`);
        }
        await axiosInstance.post('/panel-request/status', {
          id: request._id,
          status: 'approved'
        });
        alert('Panel deleted and request approved!');
      } else {
        // Create panel from request
        await axiosInstance.post('/panel', {
          userId: request.userId,
          name: request.name,
          location: request.location,
          wattage: request.wattage,
          brand: request.brand
        });
        await axiosInstance.post('/panel-request/status', {
          id: request._id,
          status: 'approved'
        });
        alert('Panel created and request approved!');
      }
      fetchRequests();
    } catch (err) {
      alert('Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.post('/panel-request/status', { id, status: 'rejected' });
      alert('Request rejected');
      fetchRequests();
    } catch (err) {
      alert('Failed to reject request');
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'pending':
        return { background: '#fff3e0', color: '#f39c12', border: '1px solid #f39c12' };
      case 'approved':
        return { background: '#e8f5e9', color: '#27ae60', border: '1px solid #27ae60' };
      case 'rejected':
        return { background: '#ffcdd2', color: '#e74c3c', border: '1px solid #e74c3c' };
      default:
        return { background: '#ecf0f1', color: '#7f8c8d', border: '1px solid #bdc3c7' };
    }
  };

  const filteredRequests = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
        <p>Loading panel requests...</p>
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#ecf0f1', borderRadius: '12px', margin: '20px 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📋</div>
        <p style={{ fontSize: '1.1rem', color: '#2c3e50', fontWeight: 'bold' }}>No panel requests yet</p>
        <p style={{ color: '#7f8c8d' }}>When customers request panels, they will appear here</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px' }}>
      {/* Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: '#fff3e0', borderRadius: '8px', borderLeft: '4px solid #f39c12' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f39c12' }}>{pendingCount}</div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem', marginTop: '5px' }}>Pending Requests</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px', borderLeft: '4px solid #27ae60' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#27ae60' }}>{approvedCount}</div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem', marginTop: '5px' }}>Approved</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#ffcdd2', borderRadius: '8px', borderLeft: '4px solid #e74c3c' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e74c3c' }}>{rejectedCount}</div>
          <div style={{ color: '#7f8c8d', fontSize: '0.9rem', marginTop: '5px' }}>Rejected</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #ecf0f1', paddingBottom: '15px' }}>
        {['all', 'pending', 'approved', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: filter === status ? '#3498db' : 'transparent',
              color: filter === status ? 'white' : '#7f8c8d',
              borderBottom: filter === status ? '3px solid #2980b9' : 'none',
              cursor: 'pointer',
              fontWeight: filter === status ? 'bold' : 'normal',
              textTransform: 'capitalize',
              fontSize: '0.95rem'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#95a5a6' }}>
          <p>No {filter !== 'all' ? filter : ''} requests found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {filteredRequests.map(req => (
            <div
              key={req._id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #ecf0f1',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
                {/* Left: Panel Details */}
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50', fontSize: '1.1rem' }}>
                      {req.name}
                    </h3>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        ...getStatusBadgeStyle(req.status)
                      }}
                    >
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '4px' }}>📍 Location</label>
                      <p style={{ margin: 0, color: '#2c3e50', fontWeight: '500' }}>{req.location || 'N/A'}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '4px' }}>⚡ Wattage</label>
                      <p style={{ margin: 0, color: '#2c3e50', fontWeight: '500' }}>{req.wattage || 'N/A'} W</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '4px' }}>🏢 Brand</label>
                      <p style={{ margin: 0, color: '#2c3e50', fontWeight: '500' }}>{req.brand || 'N/A'}</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '4px' }}>📅 Requested</label>
                      <p style={{ margin: 0, color: '#2c3e50', fontWeight: '500' }}>{new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {req.notes && (
                    <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #3498db' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '4px' }}>📝 Notes</label>
                      <p style={{ margin: 0, color: '#2c3e50', fontSize: '0.95rem' }}>{req.notes}</p>
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  {req.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                      {req.notes?.toLowerCase().includes('delete panel') ? (
                        <button
                          onClick={() => handleApprove(req)}
                          style={{
                            padding: '12px 20px',
                            background: '#e74c3c',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#c0392b';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#e74c3c';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(231, 76, 60, 0.3)';
                          }}
                        >
                          ✓ Approve & Delete Panel
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(req)}
                          style={{
                            padding: '12px 20px',
                            background: '#27ae60',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
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
                          ✓ Approve & Create Panel
                        </button>
                      )}
                      <button
                        onClick={() => handleReject(req._id)}
                        style={{
                          padding: '12px 20px',
                          background: '#e74c3c',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 8px rgba(231, 76, 60, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#c0392b';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(231, 76, 60, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#e74c3c';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(231, 76, 60, 0.3)';
                        }}
                      >
                        ✗ Reject Request
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '15px', backgroundColor: '#ecf0f1', borderRadius: '6px', textAlign: 'center' }}>
                      <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>
                        {req.status === 'approved' ? '✓ Already approved' : '✗ Rejected'}
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

export default PanelRequestsTable;
