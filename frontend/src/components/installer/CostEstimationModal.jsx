import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const CostEstimationModal = ({ maintenanceRequest, onClose, onSuccess }) => {
  const [parts, setParts] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]);
  const [laborCost, setLaborCost] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchParts();
    // Pre-fill if there's existing cost estimate
    if (maintenanceRequest?.costEstimate) {
      setLaborCost(maintenanceRequest.costEstimate.laborCost || 0);
      setNotes(maintenanceRequest.costEstimate.notes || '');
      if (maintenanceRequest.costEstimate.parts) {
        setSelectedParts(maintenanceRequest.costEstimate.parts.map(p => ({
          ...p,
          _id: p.partId
        })));
      }
    }
  }, [maintenanceRequest]);

  const fetchParts = async () => {
    try {
      const res = await axiosInstance.get('/parts-catalog');
      setParts(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch parts:', err);
    }
  };

  const addPart = (part) => {
    const existing = selectedParts.find(p => p._id === part._id);
    if (existing) {
      setSelectedParts(selectedParts.map(p => 
        p._id === part._id ? { ...p, quantity: p.quantity + 1 } : p
      ));
    } else {
      setSelectedParts([...selectedParts, {
        _id: part._id,
        partId: part._id,
        name: part.name,
        quantity: 1,
        unitPrice: part.price
      }]);
    }
    setSearchTerm('');
  };

  const updateQuantity = (partId, quantity) => {
    if (quantity <= 0) {
      setSelectedParts(selectedParts.filter(p => p._id !== partId));
    } else {
      setSelectedParts(selectedParts.map(p => 
        p._id === partId ? { ...p, quantity } : p
      ));
    }
  };

  const removePart = (partId) => {
    setSelectedParts(selectedParts.filter(p => p._id !== partId));
  };

  const calculatePartsCost = () => {
    return selectedParts.reduce((total, part) => total + (part.quantity * part.unitPrice), 0);
  };

  const calculateTotal = () => {
    return laborCost + calculatePartsCost();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    
    try {
      const response = await axiosInstance.post('/maintenance/cost-estimate', {
        id: maintenanceRequest._id,
        laborCost,
        parts: selectedParts.map(p => ({
          partId: p._id,
          name: p.name,
          quantity: p.quantity,
          unitPrice: p.unitPrice
        })),
        notes
      });
      
      if (response.data.success) {
        // Update parent state first
        if (onSuccess) {
          onSuccess(response.data.data);
        }
        // Close immediately
        onClose();
      }
    } catch (err) {
      console.error('Failed to save cost estimate:', err);
      alert('Failed to save cost estimate. Please try again.');
      setLoading(false);
    }
  };

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.partNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={(e) => {
        // Only close if clicking the backdrop, not the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 30,
          maxWidth: 700,
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>💰 Cost Estimation</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#7f8c8d'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ 
          background: '#f8f9fa', 
          padding: 14, 
          borderRadius: 10, 
          marginBottom: 20 
        }}>
          <strong>{maintenanceRequest?.type}</strong> for {maintenanceRequest?.panelId?.name || 'Panel'}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Parts Selection */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#495057' }}>
              🧰 Parts
            </label>
            
            <input
              type="text"
              placeholder="Search parts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #ced4da',
                marginBottom: 12
              }}
            />
            
            {searchTerm && (
              <div style={{
                maxHeight: 200,
                overflowY: 'auto',
                border: '1px solid #e9ecef',
                borderRadius: 8,
                marginBottom: 12
              }}>
                {filteredParts.length === 0 ? (
                  <div style={{ padding: 12, color: '#7f8c8d', textAlign: 'center' }}>
                    No parts found
                  </div>
                ) : (
                  filteredParts.map(part => (
                    <div
                      key={part._id}
                      onClick={() => addPart(part)}
                      style={{
                        padding: 12,
                        cursor: 'pointer',
                        borderBottom: '1px solid #e9ecef',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{part.name}</div>
                        {part.partNumber && (
                          <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>{part.partNumber}</div>
                        )}
                      </div>
                      <div style={{ fontWeight: 600, color: '#27ae60' }}>
                        ₹{part.price.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Selected Parts */}
            {selectedParts.length > 0 && (
              <div style={{ border: '1px solid #e9ecef', borderRadius: 8 }}>
                {selectedParts.map(part => (
                  <div
                    key={part._id}
                    style={{
                      padding: 12,
                      borderBottom: '1px solid #e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{part.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                        ₹{part.unitPrice.toLocaleString()} × {part.quantity} = ₹{(part.unitPrice * part.quantity).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(part._id, part.quantity - 1)}
                        style={{
                          width: 28,
                          height: 28,
                          border: '1px solid #ced4da',
                          borderRadius: 4,
                          background: 'white',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 600, minWidth: 20, textAlign: 'center' }}>
                        {part.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(part._id, part.quantity + 1)}
                        style={{
                          width: 28,
                          height: 28,
                          border: '1px solid #ced4da',
                          borderRadius: 4,
                          background: 'white',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removePart(part._id)}
                        style={{
                          padding: '4px 8px',
                          background: '#ffebee',
                          color: '#c62828',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Labor Cost */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#495057' }}>
              👷 Labor Cost (₹)
            </label>
            <input
              type="number"
              value={laborCost}
              onChange={(e) => {
                const value = e.target.value.replace(/^0+/, ''); // Remove leading zeros
                setLaborCost(parseFloat(value) || 0);
              }}
              min="0"
              step="1"
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #ced4da',
                fontSize: '1.1rem'
              }}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#495057' }}>
              📝 Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about the estimate..."
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid #ced4da',
                minHeight: 80
              }}
            />
          </div>

          {/* Cost Summary */}
          <div style={{
            background: '#e8f5e9',
            padding: 20,
            borderRadius: 12,
            marginBottom: 24
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#2e7d32' }}>Cost Summary</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Parts Cost:</span>
              <span style={{ fontWeight: 600 }}>₹{calculatePartsCost().toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span>Labor Cost:</span>
              <span style={{ fontWeight: 600 }}>₹{laborCost.toLocaleString()}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              paddingTop: 12,
              borderTop: '2px solid #a5d6a7',
              fontSize: '1.2rem',
              fontWeight: 700
            }}>
              <span>Total:</span>
              <span style={{ color: '#2e7d32' }}>₹{calculateTotal().toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: '#e9ecef',
                color: '#495057',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {loading ? 'Saving...' : 'Save Estimate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CostEstimationModal;
