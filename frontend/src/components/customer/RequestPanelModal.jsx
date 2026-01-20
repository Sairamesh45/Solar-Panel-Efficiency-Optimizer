import React, { useState, useEffect } from 'react';

const RequestPanelModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    location: '',
    wattage: '',
    brand: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({ name: '', location: '', wattage: '', brand: '', notes: '' });
    }
  }, [open]);

  if (!open) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);
    try {
      await onSubmit(form);
    } finally {
      setSubmitting(false);
    }
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
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
    >
      <form 
        onSubmit={handleSubmit} 
        style={{ 
          background: 'white', 
          padding: '28px', 
          borderRadius: '12px', 
          minWidth: '420px',
          maxWidth: '90vw',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}
      >
        <h2 style={{ margin: '0 0 20px 0' }}>Request New Panel</h2>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Name</label>
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required
            disabled={submitting}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Location</label>
          <input 
            name="location" 
            value={form.location} 
            onChange={handleChange}
            disabled={submitting}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Wattage</label>
          <input 
            name="wattage" 
            value={form.wattage} 
            onChange={handleChange}
            disabled={submitting}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Brand</label>
          <input 
            name="brand" 
            value={form.brand} 
            onChange={handleChange}
            disabled={submitting}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600' }}>Notes</label>
          <textarea 
            name="notes" 
            value={form.notes} 
            onChange={handleChange}
            placeholder="Any additional details..."
            rows="3"
            disabled={submitting}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={submitting}
            style={{ padding: '10px 20px', background: '#f5f5f5', border: 'none', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '600' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            style={{ padding: '10px 20px', background: submitting ? '#95a5a6' : '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '600' }}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestPanelModal;
