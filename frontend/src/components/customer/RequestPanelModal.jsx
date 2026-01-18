import React, { useState } from 'react';

const RequestPanelModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    location: '',
    wattage: '',
    brand: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double submission
    
    setSubmitting(true);
    await onSubmit(form);
    setForm({ name: '', location: '', wattage: '', brand: '', notes: '' });
    setSubmitting(false);
  };

  return (
    <div style={{ position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.3)', zIndex:10000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <form onSubmit={handleSubmit} style={{ background:'white', padding:32, borderRadius:12, minWidth:320, boxShadow:'0 2px 16px rgba(0,0,0,0.2)' }}>
        <h2>Request New Panel</h2>
        <div style={{marginBottom:12}}>
          <label>Name<br/>
            <input name="name" value={form.name} onChange={handleChange} required style={{width:'100%'}} />
          </label>
        </div>
        <div style={{marginBottom:12}}>
          <label>Location<br/>
            <input name="location" value={form.location} onChange={handleChange} style={{width:'100%'}} />
          </label>
        </div>
        <div style={{marginBottom:12}}>
          <label>Wattage<br/>
            <input name="wattage" value={form.wattage} onChange={handleChange} style={{width:'100%'}} />
          </label>
        </div>
        <div style={{marginBottom:12}}>
          <label>Brand<br/>
            <input name="brand" value={form.brand} onChange={handleChange} style={{width:'100%'}} />
          </label>
        </div>
        <div style={{marginBottom:12}}>
          <label>Notes<br/>
            <textarea name="notes" value={form.notes} onChange={handleChange} style={{width:'100%'}} />
          </label>
        </div>
        <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
          <button type="button" onClick={onClose} style={{padding:'8px 16px'}} disabled={submitting}>Cancel</button>
          <button 
            type="submit" 
            disabled={submitting}
            style={{
              padding:'8px 16px', 
              background: submitting ? '#95a5a6' : '#3498db', 
              color:'#fff', 
              border:'none', 
              borderRadius:6,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Requesting...' : 'Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestPanelModal;
