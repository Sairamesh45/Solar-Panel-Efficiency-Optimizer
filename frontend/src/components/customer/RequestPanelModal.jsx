import React, { useState } from 'react';

const RequestPanelModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    name: '',
    location: '',
    wattage: '',
    brand: '',
    notes: ''
  });

  if (!open) return null;

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(form);
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
          <button type="button" onClick={onClose} style={{padding:'8px 16px'}}>Cancel</button>
          <button type="submit" style={{padding:'8px 16px', background:'#3498db', color:'#fff', border:'none', borderRadius:6}}>Request</button>
        </div>
      </form>
    </div>
  );
};

export default RequestPanelModal;
