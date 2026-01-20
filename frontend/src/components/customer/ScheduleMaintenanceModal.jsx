import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const ScheduleMaintenanceModal = ({ maintenanceRequest, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    scheduledDateTime: '',
    estimatedCompletionTime: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.scheduledDateTime) {
      setError('Please select a date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.post('/maintenance/schedule-appointment', {
        id: maintenanceRequest._id,
        scheduledDateTime: formData.scheduledDateTime,
        estimatedCompletionTime: formData.estimatedCompletionTime || null,
        notes: formData.notes
      });

      if (response.data.success) {
        onSuccess?.(response.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar links
  const generateGoogleCalendarLink = () => {
    if (!formData.scheduledDateTime) return '#';
    
    const startDate = new Date(formData.scheduledDateTime);
    const endDate = new Date(formData.estimatedCompletionTime || startDate.getTime() + 3600000); // +1 hour default
    
    const formatDate = (date) => {
      return date.toISOString().replace(/-|:|\\.\\d+/g, '');
    };

    const title = encodeURIComponent(`Solar Panel ${maintenanceRequest.type || 'Maintenance'}`);
    const details = encodeURIComponent(`Maintenance for ${maintenanceRequest.panelId?.name || 'Solar Panel'}\\n${formData.notes || ''}`);
    const location = encodeURIComponent(maintenanceRequest.panelId?.location || '');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${details}&location=${location}`;
  };

  const generateOutlookCalendarLink = () => {
    if (!formData.scheduledDateTime) return '#';
    
    const startDate = new Date(formData.scheduledDateTime);
    const endDate = new Date(formData.estimatedCompletionTime || startDate.getTime() + 3600000);
    
    const formatDate = (date) => {
      return date.toISOString();
    };

    const title = encodeURIComponent(`Solar Panel ${maintenanceRequest.type || 'Maintenance'}`);
    const body = encodeURIComponent(`Maintenance for ${maintenanceRequest.panelId?.name || 'Solar Panel'}\\n${formData.notes || ''}`);
    const location = encodeURIComponent(maintenanceRequest.panelId?.location || '');

    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${body}&startdt=${formatDate(startDate)}&enddt=${formatDate(endDate)}&location=${location}`;
  };

  return (
    <div style={{
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
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '550px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '1.5rem' }}>
          Schedule Appointment
        </h2>

        <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '5px' }}>Maintenance Request</div>
          <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
            {maintenanceRequest.type?.charAt(0).toUpperCase() + maintenanceRequest.type?.slice(1)} - {maintenanceRequest.panelId?.name || 'Panel'}
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            background: '#fee',
            color: '#c33',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
              Appointment Date & Time <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <input
              type="datetime-local"
              name="scheduledDateTime"
              value={formData.scheduledDateTime}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
              Estimated Completion Time
            </label>
            <input
              type="datetime-local"
              name="estimatedCompletionTime"
              value={formData.estimatedCompletionTime}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginTop: '5px' }}>
              Expected end time for the appointment
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2c3e50' }}>
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              placeholder="Add any special instructions or notes..."
            />
          </div>

          {formData.scheduledDateTime && (
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              background: '#e3f2fd',
              borderRadius: '8px',
              border: '1px solid #90caf9'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1976d2', fontSize: '0.95rem' }}>
                📅 Add to Calendar
              </h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a
                  href={generateGoogleCalendarLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 12px',
                    background: '#fff',
                    color: '#1976d2',
                    border: '1px solid #90caf9',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  Google Calendar
                </a>
                <a
                  href={generateOutlookCalendarLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 12px',
                    background: '#fff',
                    color: '#1976d2',
                    border: '1px solid #90caf9',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}
                >
                  Outlook
                </a>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: '#e9ecef',
                color: '#2c3e50',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: loading ? '#95a5a6' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              {loading ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMaintenanceModal;
