import React, { useState, useEffect } from 'react';
import { getPanels } from '../../api/panel.api';


const RequestMaintenanceModal = ({ open, onClose, onSubmit, userId }) => {
  const [form, setForm] = useState({
    panelId: '',
    type: 'cleaning',
    notes: ''
  });
  const [panels, setPanels] = useState([]);

  useEffect(() => {
    if (open && userId) {
      getPanels(userId).then(res => setPanels(res.data.data || []));
    }
  }, [open, userId]);

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
        <h2>Request Maintenance</h2>
        <div style={{marginBottom:12}}>
          <label>Panel<br/>
            <select name="panelId" value={form.panelId} onChange={handleChange} required style={{width:'100%'}}>
              <option value="">Select a panel</option>
              {panels.map(panel => (
                <option key={panel._id} value={panel._id}>{panel.name || panel._id}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={{marginBottom:12}}>
          <label>Type<br/>
            <select name="type" value={form.type} onChange={handleChange} style={{width:'100%'}}>
              <option value="cleaning">Cleaning</option>
              <option value="inspection">Inspection</option>
              <option value="repair">Repair</option>
            </select>
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

export default RequestMaintenanceModal;
