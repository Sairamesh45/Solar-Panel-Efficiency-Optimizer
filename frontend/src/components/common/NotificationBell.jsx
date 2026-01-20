import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { getUnresolvedAlerts, markAlertAsRead, resolveAlert } from '../../api/alert.api';

const NotificationBell = () => {
  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchAlerts = async () => {
    try {
      const response = await getUnresolvedAlerts();
      if (response.data.success) {
        const alertsData = response.data.data || [];
        setAlerts(alertsData.slice(0, 5)); // Show only latest 5
        setUnreadCount(alertsData.filter(a => !a.readAt).length);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleBellClick = async () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      // Mark all as read when opening dropdown
      for (const alert of alerts.filter(a => !a.readAt)) {
        try {
          await markAlertAsRead(alert._id);
        } catch (error) {
          console.error('Error marking alert as read:', error);
        }
      }
      setUnreadCount(0);
    }
  };

  const handleResolve = async (e, alertId) => {
    e.stopPropagation();
    try {
      await resolveAlert(alertId);
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle size={16} color="#e74c3c" />;
      case 'warning':
        return <AlertTriangle size={16} color="#f39c12" />;
      default:
        return <Info size={16} color="#3498db" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return '#e74c3c';
      case 'warning':
        return '#f39c12';
      default:
        return '#3498db';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleBellClick}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(52, 152, 219, 0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <Bell size={24} color="#2c3e50" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: '#e74c3c',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            onClick={() => setShowDropdown(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '360px',
            maxHeight: '500px',
            overflowY: 'auto',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              background: 'white',
              borderRadius: '12px 12px 0 0'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>
                🔔 Notifications
              </h3>
              <button
                onClick={() => setShowDropdown(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} color="#7f8c8d" />
              </button>
            </div>

            {alerts.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#95a5a6' }}>
                <Bell size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                <p style={{ margin: 0 }}>No alerts</p>
              </div>
            ) : (
              <>
                {alerts.map((alert, index) => (
                  <div
                    key={alert._id}
                    style={{
                      padding: '16px',
                      borderBottom: index < alerts.length - 1 ? '1px solid #f5f5f5' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderLeft: `4px solid ${getSeverityColor(alert.severity)}`
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ marginTop: '2px' }}>
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', color: '#2c3e50', marginBottom: '6px', fontWeight: '500' }}>
                          {alert.message}
                        </div>
                        <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '8px' }}>
                          {alert.panelId?.name && `🔆 ${alert.panelId.name}`}
                          {' • '}
                          {new Date(alert.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <button
                          onClick={(e) => handleResolve(e, alert._id)}
                          style={{
                            background: '#27ae60',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          ✓ Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <Link
                  to="/alerts"
                  style={{
                    display: 'block',
                    padding: '12px',
                    textAlign: 'center',
                    color: '#3498db',
                    fontWeight: '500',
                    fontSize: '14px',
                    textDecoration: 'none',
                    borderTop: '1px solid #f0f0f0',
                    background: '#f8f9fa'
                  }}
                  onClick={() => setShowDropdown(false)}
                >
                  View All Alerts →
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
