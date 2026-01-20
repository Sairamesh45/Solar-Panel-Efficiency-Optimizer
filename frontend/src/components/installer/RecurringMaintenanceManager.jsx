import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';

const RecurringMaintenanceManager = () => {
  const [schedules, setSchedules] = useState([]);
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    panelId: '',
    type: 'cleaning',
    frequency: 'monthly',
    startDate: '',
    notes: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesRes, panelsRes] = await Promise.all([
        axiosInstance.get('/recurring-maintenance'),
        axiosInstance.get('/panel')
      ]);
      setSchedules(schedulesRes.data.data || []);
      setPanels(panelsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/recurring-maintenance', formData);
      setMessage('Schedule created successfully!');
      setShowForm(false);
      setFormData({ panelId: '', type: 'cleaning', frequency: 'monthly', startDate: '', notes: '' });
      fetchData();
    } catch (err) {
      setMessage('Failed to create schedule');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleToggle = async (id) => {
    try {
      await axiosInstance.patch(`/recurring-maintenance/${id}/toggle`);
      fetchData();
    } catch (err) {
      console.error('Failed to toggle schedule:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await axiosInstance.delete(`/recurring-maintenance/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete schedule:', err);
    }
  };

  const handleGenerate = async () => {
    try {
      const res = await axiosInstance.post('/recurring-maintenance/generate');
      setMessage(`Generated ${res.data.data.generated} maintenance request(s)`);
    } catch (err) {
      setMessage('Failed to generate maintenance requests');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const frequencyLabels = {
    weekly: 'Weekly',
    biweekly: 'Every 2 Weeks',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    biannually: 'Every 6 Months',
    annually: 'Annually'
  };

  if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Loading schedules...</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>🔄 Recurring Maintenance Schedules</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleGenerate}
            style={{
              padding: '8px 16px',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ⚡ Generate Due Now
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '8px 16px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {showForm ? '✕ Cancel' : '+ New Schedule'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          background: message.includes('Failed') ? '#ffebee' : '#e8f5e9',
          color: message.includes('Failed') ? '#c62828' : '#2e7d32',
          borderRadius: 8,
          marginBottom: 20,
          fontWeight: 500
        }}>
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: '#f8f9fa',
          padding: 20,
          borderRadius: 12,
          marginBottom: 20,
          border: '1px solid #e9ecef'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#495057' }}>Panel</label>
              <select
                value={formData.panelId}
                onChange={(e) => setFormData({ ...formData, panelId: e.target.value })}
                required
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da' }}
              >
                <option value="">Select Panel</option>
                {panels.map(p => (
                  <option key={p._id} value={p._id}>{p.name} - {p.location}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#495057' }}>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da' }}
              >
                <option value="cleaning">Cleaning</option>
                <option value="inspection">Inspection</option>
                <option value="repair">Repair</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#495057' }}>Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da' }}
              >
                {Object.entries(frequencyLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#495057' }}>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da' }}
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#495057' }}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Optional notes..."
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ced4da', minHeight: 60 }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 16,
              padding: '10px 24px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Create Schedule
          </button>
        </form>
      )}

      {schedules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#7f8c8d' }}>
          <p>No recurring schedules yet. Create one to automate maintenance.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {schedules.map(schedule => (
            <div
              key={schedule._id}
              style={{
                background: 'white',
                padding: 20,
                borderRadius: 12,
                border: `2px solid ${schedule.isActive ? '#27ae60' : '#e9ecef'}`,
                opacity: schedule.isActive ? 1 : 0.7
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#2c3e50' }}>
                    {schedule.panelId?.name || 'Unknown Panel'}
                  </h4>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{
                      padding: '4px 10px',
                      background: '#e3f2fd',
                      color: '#1976d2',
                      borderRadius: 20,
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1)}
                    </span>
                    <span style={{
                      padding: '4px 10px',
                      background: '#fff3e0',
                      color: '#f57c00',
                      borderRadius: 20,
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {frequencyLabels[schedule.frequency]}
                    </span>
                    <span style={{
                      padding: '4px 10px',
                      background: schedule.isActive ? '#e8f5e9' : '#ffebee',
                      color: schedule.isActive ? '#2e7d32' : '#c62828',
                      borderRadius: 20,
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      {schedule.isActive ? '✓ Active' : '⏸ Paused'}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>
                    📅 Next Due: {new Date(schedule.nextDueDate).toLocaleDateString()}
                    {schedule.notes && <span> • {schedule.notes}</span>}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleToggle(schedule._id)}
                    style={{
                      padding: '6px 12px',
                      background: schedule.isActive ? '#fff3e0' : '#e8f5e9',
                      color: schedule.isActive ? '#f57c00' : '#2e7d32',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    {schedule.isActive ? '⏸ Pause' : '▶ Resume'}
                  </button>
                  <button
                    onClick={() => handleDelete(schedule._id)}
                    style={{
                      padding: '6px 12px',
                      background: '#ffebee',
                      color: '#c62828',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringMaintenanceManager;
