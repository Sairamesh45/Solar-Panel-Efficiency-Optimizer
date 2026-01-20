import React, { useState, useEffect } from 'react';
import { getPanels } from '../../api/panel.api';

const RequestMaintenanceModal = ({ open, onClose, onSubmit, userId }) => {
  const [form, setForm] = useState({
    panelId: '',
    type: 'cleaning',
    notes: ''
  });
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      getPanels(userId)
        .then(res => setPanels(res.data.data || []))
        .catch(err => console.error('Failed to load panels:', err))
        .finally(() => setLoading(false));
    }
  }, [open, userId]);

  useEffect(() => {
    if (!open) {
      setForm({ panelId: '', type: 'cleaning', notes: '' });
    }
  }, [open]);

  if (!open) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        background: 'rgba(0,0,0,0.4)', 
        zIndex: 10000, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form 
        onSubmit={handleSubmit} 
        style={{ 
          background: 'white', 
          padding: '28px', 
          borderRadius: '12px', 
          minWidth: '400px',
          maxWidth: '90vw',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}
      >
        <h2 style={{ margin: '0 0 20px 0' }}>Request Maintenance</h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Panel</label>
          <select 
            name="panelId" 
            value={form.panelId} 
            onChange={handleChange} 
            required 
            disabled={loading}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
          >
            <option value="">Select a panel</option>
            {panels.map(panel => (
              <option key={panel._id} value={panel._id}>
                {panel.name || panel._id}
              </option>
            ))}
          </select>
          {loading && <span style={{ fontSize: '0.85rem', color: '#999', marginTop: '4px', display: 'block' }}>Loading...</span>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Type</label>
          <select 
            name="type" 
            value={form.type} 
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
          >
            <option value="cleaning">Cleaning</option>
            <option value="inspection">Inspection</option>
            <option value="repair">Repair</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Notes</label>
          <textarea 
            name="notes" 
            value={form.notes} 
            onChange={handleChange}
            placeholder="Any additional details..."
            rows="3"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ padding: '10px 20px', background: '#f5f5f5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            style={{ padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestMaintenanceModal;
