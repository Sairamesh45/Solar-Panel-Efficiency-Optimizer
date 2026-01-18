import React, { useState } from 'react';

const ScheduleMaintenanceModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    panelId: '',
    scheduledDate: '',
    type: 'cleaning',
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
        <h2>Schedule Maintenance</h2>
        <div style={{marginBottom:12}}>
          <label>Panel ID<br/>
            <input name="panelId" value={form.panelId} onChange={handleChange} required style={{width:'100%'}} />
          </label>
        </div>
        <div style={{marginBottom:12}}>
          <label>Date<br/>
            <input type="date" name="scheduledDate" value={form.scheduledDate} onChange={handleChange} required style={{width:'100%'}} />
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
          <button type="submit" style={{padding:'8px 16px', background:'#27ae60', color:'#fff', border:'none', borderRadius:6}}>Schedule</button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleMaintenanceModal;
