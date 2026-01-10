import React from 'react';

const PanelRequestTimeline = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '1.1rem' }}>Request Timeline</h3>
      <div style={{ position: 'relative', paddingLeft: '30px' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: '9px',
          top: '10px',
          bottom: '10px',
          width: '2px',
          backgroundColor: '#3498db'
        }} />
        
        {timeline.map((entry, index) => (
          <div key={index} style={{ position: 'relative', marginBottom: '20px' }}>
            {/* Timeline dot */}
            <div style={{
              position: 'absolute',
              left: '-30px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: entry.status === 'approved' ? '#27ae60' : entry.status === 'rejected' ? '#e74c3c' : '#3498db',
              border: '3px solid white',
              boxShadow: '0 0 0 2px #3498db'
            }} />
            
            {/* Timeline content */}
            <div style={{
              backgroundColor: 'white',
              padding: '12px 15px',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  textTransform: 'capitalize'
                }}>
                  {entry.status}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              <p style={{ margin: 0, color: '#34495e', fontSize: '0.95rem' }}>
                {entry.message}
              </p>
              {entry.userId?.name && (
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#95a5a6' }}>
                  By: {entry.userId.name} ({entry.userId.role})
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanelRequestTimeline;
