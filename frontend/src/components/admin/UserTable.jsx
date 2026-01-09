import React from 'react';
import { formatDateTime } from '../../utils/formatters';

const UserTable = ({ users, onRoleChange, onDelete, loading }) => {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading users...</div>;
  }

  if (!users || users.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px' }}>
        <p style={{ color: '#7f8c8d' }}>No users found</p>
      </div>
    );
  }

  const getRoleBadgeColor = (role) => {
    if (role === 'Admin') return '#e74c3c';
    if (role === 'Installer') return '#f39c12';
    return '#3498db'; // Customer
  };

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '12px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
      overflow: 'hidden'
    }}>
      <div style={{ 
        overflowX: 'auto'
      }}>
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
              <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '15px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Role</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Joined</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr 
                key={user._id}
                style={{ 
                  borderBottom: '1px solid #ecf0f1',
                  backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e8f8f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa'}
              >
                <td style={{ padding: '15px' }}>
                  <strong>{user.name}</strong>
                </td>
                <td style={{ padding: '15px', color: '#7f8c8d' }}>
                  {user.email}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <span style={{
                    padding: '5px 12px',
                    borderRadius: '12px',
                    backgroundColor: getRoleBadgeColor(user.role),
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '15px', textAlign: 'center', color: '#7f8c8d', fontSize: '0.85rem' }}>
                  {formatDateTime(user.createdAt)}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <select
                    value={user.role}
                    onChange={(e) => onRoleChange(user._id, e.target.value)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      marginRight: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                    <option value="Installer">Installer</option>
                  </select>
                  <button
                    onClick={() => onDelete(user._id)}
                    style={{
                      padding: '5px 12px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
