import React from 'react';
import { PRIORITY_COLORS } from '../../utils/constants';

const MaintenanceAlert = ({ maintenance }) => {
  if (!maintenance) return null;

  const { alert, priority, recommended_actions } = maintenance;
  const priorityColor = PRIORITY_COLORS[priority] || PRIORITY_COLORS.Medium;

  const getIcon = (priority) => {
    switch (priority) {
      case 'High':
        return '⚠️';
      case 'Medium':
        return '⚡';
      case 'Low':
        return '✅';
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
      padding: '25px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
      marginTop: '25px'
    }}>
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '20px', 
        color: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        🔧 Maintenance & Recommendations
      </h3>
      
      {/* Main Alert */}
      <div style={{
        padding: '15px 20px',
        backgroundColor: priority === 'High' ? '#fdecea' : '#e8f8f5',
        borderLeft: `5px solid ${priorityColor}`,
        borderRadius: '8px',
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
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
          <h4 style={{ color: '#34495e', marginBottom: '15px', fontSize: '1rem' }}>
            Action Items:
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recommended_actions.map((action, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  transition: 'all 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
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
                  paddingLeft: '20px'
                }}>
                  💡 {action.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceAlert;
