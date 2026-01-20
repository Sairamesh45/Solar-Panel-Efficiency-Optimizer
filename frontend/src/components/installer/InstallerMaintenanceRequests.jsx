import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import ScheduleMaintenanceModal from '../customer/ScheduleMaintenanceModal';
import CostEstimationModal from './CostEstimationModal';

const InstallerMaintenanceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateMsg, setUpdateMsg] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);

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

  if (loading) return (
    <div style={{ 
      padding: '60px 40px', 
      textAlign: 'center', 
      color: '#7f8c8d', 
      fontSize: '1.1rem' 
    }}>
      Loading assigned maintenance requests...
    </div>
  );

  return (
    <div>
      {updateMsg && (
        <div style={{ 
          background: 'linear-gradient(135deg, #27ae60, #1e8449)',
          color: 'white',
          padding: '14px 20px',
          borderRadius: '10px',
          marginBottom: 20,
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(39,174,96,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          ✓ {updateMsg}
        </div>
      )}
      
      {requests.length === 0 ? (
        <div style={{ 
          padding: '80px 40px', 
          textAlign: 'center', 
          background: '#fbfdff', 
          borderRadius: '16px',
          border: '2px dashed #d1dce5',
          color: '#7f8c8d'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔧</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#2c3e50' }}>No Assigned Requests</h3>
          <p style={{ margin: 0, fontSize: '1rem' }}>You don't have any assigned maintenance requests at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {requests.map(req => (
            <div 
              key={req._id} 
              style={{ 
                background: '#ffffff',
                padding: 0,
                borderRadius: 16,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #eef3f6',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
              }}
            >
              {/* Header Section */}
              <div style={{ 
                background: req.type === 'cleaning' 
                  ? 'linear-gradient(135deg, #3aa0ff, #2d6fb6)' 
                  : req.type === 'inspection' 
                  ? 'linear-gradient(135deg, #b08be6, #7b5fb3)' 
                  : 'linear-gradient(135deg, #ffb577, #e07a2f)',
                padding: '20px 24px',
                color: 'white'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      fontSize: '1.8rem',
                      background: 'rgba(255,255,255,0.2)',
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {req.type === 'cleaning' ? '🧹' : req.type === 'inspection' ? '🔍' : '🔧'}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
                        {req.type.charAt(0).toUpperCase() + req.type.slice(1)}
                      </h3>
                      <div style={{ fontSize: '0.9rem', opacity: 0.95, marginTop: 4 }}>
                        Panel: {req.panelId?.name || req.panelId}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.25)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    {req.status.replace('_', ' ')}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                  📅 Requested: {new Date(req.createdAt).toLocaleString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>

              {/* Content Section */}
              <div style={{ padding: 24 }}>
                {req.notes && req.notes !== 'N/A' && (
                  <div style={{ 
                    marginBottom: 20,
                    padding: 16,
                    background: '#f8f9fa',
                    borderRadius: 10,
                    borderLeft: '4px solid #3aa0ff'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#7f8c8d', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
                      📝 Notes
                    </div>
                    <div style={{ color: '#2c3e50', fontSize: '0.95rem', lineHeight: 1.5 }}>
                      {req.notes}
                    </div>
                  </div>
                )}

                {/* Scheduling Info */}
                {(req.scheduledDateTime || req.estimatedCompletionTime) && (
                  <div style={{ 
                    marginBottom: 20,
                    padding: 18,
                    background: 'linear-gradient(135deg, #fff5e6, #ffe9cc)',
                    borderRadius: 12,
                    border: '1px solid #ffd699'
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#d68910', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      📅 Scheduled Appointment
                    </h4>
                    {req.scheduledDateTime && (
                      <div style={{ fontSize: '0.9rem', marginBottom: 8, color: '#2c3e50' }}>
                        <strong>Date & Time:</strong> {new Date(req.scheduledDateTime).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                    {req.estimatedCompletionTime && (
                      <div style={{ fontSize: '0.9rem', color: '#2c3e50' }}>
                        <strong>Estimated Completion:</strong> {new Date(req.estimatedCompletionTime).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Cost Estimate Info */}
                {req.costEstimate && req.costEstimate.totalCost > 0 && (
                  <div style={{ 
                    marginBottom: 20,
                    padding: 18,
                    background: 'linear-gradient(135deg, #e8f5e9, #d4edda)',
                    borderRadius: 12,
                    border: '1px solid #a5d6a7'
                  }}>
                    <h4 style={{ margin: '0 0 14px 0', color: '#2e7d32', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      💰 Cost Estimate
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                      <div style={{ 
                        background: 'white',
                        padding: '12px',
                        borderRadius: 8,
                        border: '1px solid #c3e6cb'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: 4 }}>Parts</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2e7d32' }}>
                          ₹{req.costEstimate.partsCost?.toLocaleString()}
                        </div>
                      </div>
                      <div style={{ 
                        background: 'white',
                        padding: '12px',
                        borderRadius: 8,
                        border: '1px solid #c3e6cb'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: 4 }}>Labor</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2e7d32' }}>
                          ₹{req.costEstimate.laborCost?.toLocaleString()}
                        </div>
                      </div>
                      <div style={{ 
                        background: 'white',
                        padding: '12px',
                        borderRadius: 8,
                        border: '2px solid #2e7d32'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: 4 }}>Total</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#2e7d32' }}>
                          ₹{req.costEstimate.totalCost?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                {req.status !== 'completed' && (
                  <div style={{ 
                    marginBottom: 20,
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setShowScheduleModal(true);
                      }}
                      style={{
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #27ae60, #1e8449)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 4px 12px rgba(39,174,96,0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(39,174,96,0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(39,174,96,0.3)';
                      }}
                    >
                      {req.scheduledDateTime ? '📅 Reschedule' : '📅 Schedule'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setShowCostModal(true);
                      }}
                      style={{
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg, #8e44ad, #6c3483)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 4px 12px rgba(142,68,173,0.3)',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(142,68,173,0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(142,68,173,0.3)';
                      }}
                    >
                      {req.costEstimate?.totalCost > 0 ? '💰 Update Cost' : '💰 Add Cost'}
                    </button>
                  </div>
                )}
              
                {/* Timeline */}
                {req.statusTimeline && req.statusTimeline.length > 0 && (
                  <div style={{ 
                    marginTop: 20,
                    padding: 18,
                    background: '#f8f9fa',
                    borderRadius: 12,
                    border: '1px solid #e9ecef'
                  }}>
                    <h4 style={{ 
                      margin: '0 0 16px 0', 
                      color: '#495057',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      ⏱️ Activity Timeline
                    </h4>
                    <div style={{ position: 'relative', paddingLeft: 24 }}>
                      {/* Timeline line */}
                      <div style={{
                        position: 'absolute',
                        left: 8,
                        top: 8,
                        bottom: 8,
                        width: 2,
                        background: 'linear-gradient(to bottom, #3aa0ff, #e9ecef)'
                      }} />
                      
                      {req.statusTimeline.map((event, idx) => (
                        <div key={idx} style={{ 
                          marginBottom: idx === req.statusTimeline.length - 1 ? 0 : 16,
                          position: 'relative',
                          paddingLeft: 16,
                          paddingBottom: 12
                        }}>
                          {/* Timeline dot */}
                          <div style={{
                            position: 'absolute',
                            left: 0,
                            top: 4,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: idx === 0 ? 'linear-gradient(135deg, #3aa0ff, #2d6fb6)' : '#ced4da',
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }} />
                          
                          <div style={{ 
                            background: 'white',
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: '1px solid #e9ecef'
                          }}>
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: '#6c757d',
                              marginBottom: 4
                            }}>
                              {new Date(event.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div style={{ 
                              fontSize: '0.9rem',
                              fontWeight: 700,
                              color: '#2c3e50',
                              marginBottom: event.notes ? 4 : 0
                            }}>
                              {event.status}
                            </div>
                            {event.notes && (
                              <div style={{ 
                                fontSize: '0.85rem',
                                color: '#495057',
                                lineHeight: 1.4
                              }}>
                                {event.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Only show update form if not completed */}
                {req.status !== 'completed' && (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      const status = e.target.status.value;
                      const notes = e.target.notes.value;
                      handleUpdate(req._id, status, notes);
                    }}
                    style={{ 
                      marginTop: 20,
                      padding: 20,
                      background: 'linear-gradient(135deg, #f0f4f8, #e4eaf0)',
                      borderRadius: 12,
                      border: '1px solid #d1dce5'
                    }}
                  >
                    <h4 style={{ 
                      margin: '0 0 16px 0', 
                      color: '#2c3e50',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      🔄 Update Status
                    </h4>
                    
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ 
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#495057',
                        marginBottom: 6
                      }}>
                        Status
                      </label>
                      <select 
                        name="status" 
                        defaultValue={req.status}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: 8,
                          fontSize: '0.9rem',
                          background: 'white',
                          cursor: 'pointer',
                          color: '#2c3e50'
                        }}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="in_progress">⚙️ In Progress</option>
                        <option value="completed">✅ Completed</option>
                      </select>
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ 
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#495057',
                        marginBottom: 6
                      }}>
                        Update Notes
                      </label>
                      <input 
                        name="notes" 
                        type="text" 
                        defaultValue={req.notes}
                        placeholder="Add notes about the update..."
                        style={{ 
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid #ced4da',
                          borderRadius: 8,
                          fontSize: '0.9rem',
                          background: 'white',
                          color: '#2c3e50',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      style={{ 
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #3aa0ff, #2d6fb6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 10,
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(58,160,255,0.3)',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 16px rgba(58,160,255,0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(58,160,255,0.3)';
                      }}
                    >
                      💾 Update Request
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showScheduleModal && selectedRequest && (
        <ScheduleMaintenanceModal
          maintenanceRequest={selectedRequest}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedRequest(null);
          }}
          onSuccess={(updatedRequest) => {
            setRequests(prev => prev.map(req => 
              req._id === updatedRequest._id ? updatedRequest : req
            ));
            setUpdateMsg('Appointment scheduled successfully!');
            setTimeout(() => setUpdateMsg(''), 2000);
          }}
        />
      )}

      {showCostModal && selectedRequest ? (
        <CostEstimationModal
          key={selectedRequest._id}
          maintenanceRequest={selectedRequest}
          onClose={() => {
            setShowCostModal(false);
            setSelectedRequest(null);
            fetchRequests();
          }}
          onSuccess={(updatedRequest) => {
            setRequests(prev => prev.map(req => 
              req._id === updatedRequest._id ? updatedRequest : req
            ));
            setUpdateMsg('Cost estimate saved successfully!');
            setTimeout(() => setUpdateMsg(''), 2000);
          }}
        />
      ) : null}
    </div>
  );
};

export default InstallerMaintenanceRequests;
