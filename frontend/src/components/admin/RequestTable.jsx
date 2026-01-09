import React from 'react';
import { formatDateTime, formatKw } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

const RequestTable = ({ requests, loading }) => {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading requests...</div>;
  }

  if (!requests || requests.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px' }}>
        <p style={{ color: '#7f8c8d' }}>No analysis requests found</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '12px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
      overflow: 'hidden'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: '#34495e', 
              color: 'white'
            }}>
              <th style={{ padding: '15px', textAlign: 'left' }}>User</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Location</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>System Size</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, index) => (
              <tr 
                key={request._id}
                style={{ 
                  borderBottom: '1px solid #ecf0f1',
                  backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e8f8f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa'}
              >
                <td style={{ padding: '15px' }}>
                  <strong>{request.userId?.name || 'Unknown'}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                    {request.userId?.email || 'N/A'}
                  </div>
                </td>
                <td style={{ padding: '15px' }}>
                  {request.inputData?.location?.city || 'N/A'}, {request.inputData?.location?.state || 'N/A'}
                </td>
                <td style={{ padding: '15px', textAlign: 'center', fontWeight: '600' }}>
                  {request.inputData?.roof?.area ? `${request.inputData.roof.area} m²` : 'N/A'}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <span style={{
                    padding: '5px 12px',
                    borderRadius: '12px',
                    backgroundColor: STATUS_COLORS[request.status] || STATUS_COLORS.pending,
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {request.status}
                  </span>
                </td>
                <td style={{ padding: '15px', textAlign: 'center', color: '#7f8c8d', fontSize: '0.85rem' }}>
                  {formatDateTime(request.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestTable;
