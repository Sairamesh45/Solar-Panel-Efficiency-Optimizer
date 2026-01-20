import React from 'react';
import { PRIORITY_COLORS } from '../../utils/constants';

const MaintenanceAlert = ({ maintenance, maintenanceRequest, onAssign, onSchedule }) => {
  if (!maintenance) return null;

  const { alert, priority, recommended_actions } = maintenance;
  const priorityColor = PRIORITY_COLORS[priority] || PRIORITY_COLORS.Medium;

  const getIcon = (priority) => {
    switch (priority) {
      case 'High':
        return '⚠️';
      case 'Medium':
        return '💡';
      case 'Low':
        return '✓';
      default:
        return 'ℹ️';
    }
  };

  const getUrgencyBadgeStyle = (urgency) => {
    const baseStyle = {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '600',
      marginLeft: '10px',
      textTransform: 'uppercase',
    };

    switch (urgency) {
      case 'high':
        return { ...baseStyle, backgroundColor: '#fdedec', color: '#e74c3c' };
      case 'medium':
        return { ...baseStyle, backgroundColor: '#fef5e7', color: '#f39c12' };
      case 'low':
        return { ...baseStyle, backgroundColor: '#e8f6ef', color: '#27ae60' };
      default:
        return { ...baseStyle, backgroundColor: '#ecf0f1', color: '#7f8c8d' };
    }
  };

  return (
    <div style={{ 
      background: 'white', 
      padding: '30px', 
      borderRadius: '16px', 
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid #e9ecef',
      marginTop: '25px'
    }}>
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '24px', 
        color: '#2c3e50',
        fontSize: '1.4rem',
        fontWeight: '600'
      }}>
        Maintenance & Recommendations
      </h3>
      
      {/* Main Alert */}
      <div style={{
        padding: '18px 22px',
        backgroundColor: priority === 'High' ? '#fef5f5' : '#f0fdf4',
        borderLeft: `4px solid ${priorityColor}`,
        borderRadius: '12px',
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        <span style={{ fontSize: '1.5rem' }}>{getIcon(priority)}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', color: '#2c3e50', marginBottom: '5px' }}>
            {alert}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
            Priority: <span style={{ color: priorityColor, fontWeight: '600' }}>{priority}</span>
          </div>
        </div>
      </div>

      {/* Recommended Actions */}
      {recommended_actions && recommended_actions.length > 0 && (
        <div>
          <h4 style={{ color: '#2c3e50', marginBottom: '16px', fontSize: '1.1rem', fontWeight: '600' }}>
            Action Items
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recommended_actions.map((action, index) => (
              <div
                key={index}
                style={{
                  padding: '16px 18px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #e9ecef',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#2c3e50',
                    flex: 1
                  }}>
                    {index + 1}. {action.action}
                  </span>
                  <span style={getUrgencyBadgeStyle(action.urgency)}>
                    {action.urgency}
                  </span>
                </div>
                <div style={{ 
                  color: '#7f8c8d', 
                  fontSize: '0.9rem',
                  paddingLeft: '20px',
                  lineHeight: '1.5'
                }}>
                  {action.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduling Information */}
      {(maintenanceRequest?.scheduledDateTime || maintenanceRequest?.estimatedCompletionTime) && (
        <div style={{
          marginTop: '20px',
          padding: '18px',
          background: '#fef5e7',
          borderRadius: '12px',
          border: '1px solid #ffeaa7'
        }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#f39c12', fontSize: '1rem', fontWeight: '700' }}>
            📅 Schedule
          </h4>
          {maintenanceRequest.scheduledDateTime && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '3px' }}>Appointment</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#2c3e50' }}>
                {new Date(maintenanceRequest.scheduledDateTime).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
          {maintenanceRequest.estimatedCompletionTime && (
            <div>
              <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '3px' }}>Estimated Completion</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '600', color: '#27ae60' }}>
                {new Date(maintenanceRequest.estimatedCompletionTime).toLocaleString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {(onAssign || onSchedule) && maintenanceRequest && (
        <div style={{
          marginTop: '20px',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {onSchedule && (
            <button
              onClick={() => onSchedule(maintenanceRequest)}
              style={{
                padding: '12px 20px',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#229954'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#27ae60'}
            >
              {maintenanceRequest.scheduledDateTime ? '📅 Reschedule' : '📅 Schedule Appointment'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MaintenanceAlert;
