import React, { useEffect, useState } from 'react';
import UserTable from '../components/admin/UserTable';
import RequestTable from '../components/admin/RequestTable';
import { getAllUsers, getAllRequests, updateUserRole, deleteUser } from '../api/admin.api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    processedRequests: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const res = await getAllUsers();
      if (res.data.success) {
        setUsers(res.data.data);
        setStats(prev => ({ ...prev, totalUsers: res.data.data.length }));
      } else {
        setError('Failed to fetch users: ' + res.data.message);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch users';
      setError(errorMsg);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await getAllRequests();
      if (res.data.success) {
        const requestsData = res.data.data;
        setRequests(requestsData);
        setStats(prev => ({
          ...prev,
          totalRequests: requestsData.length,
          processedRequests: requestsData.filter(r => r.status === 'processed').length,
          pendingRequests: requestsData.filter(r => r.status === 'pending' || r.status === 'processing').length
        }));
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      alert('User role updated successfully!');
    } catch (err) {
      alert('Failed to update user role. You may not have permission.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      alert('User deleted successfully!');
    } catch (err) {
      alert('Failed to delete user. You may not have permission.');
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div style={{
      background: 'white',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      flex: 1,
      minWidth: '200px'
    }}>
      <div style={{
        fontSize: '2.5rem',
        opacity: 0.8
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: color || '#2c3e50' }}>
          {value}
        </div>
        <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
          {title}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', marginBottom: '10px' }}>
          🛡️ Admin Dashboard
        </h1>
        <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
          Manage users, monitor analysis requests, and system overview
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '40px',
        flexWrap: 'wrap'
      }}>
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon="👥" 
          color="#3498db"
        />
        <StatCard 
          title="Total Requests" 
          value={stats.totalRequests} 
          icon="📊" 
          color="#9b59b6"
        />
        <StatCard 
          title="Processed" 
          value={stats.processedRequests} 
          icon="✅" 
          color="#27ae60"
        />
        <StatCard 
          title="Pending" 
          value={stats.pendingRequests} 
          icon="⏳" 
          color="#f39c12"
        />
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', borderBottom: '2px solid #ecf0f1' }}>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'users' ? '#3498db' : 'transparent',
            color: activeTab === 'users' ? 'white' : '#7f8c8d',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid #2980b9' : 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          👥 Users Management
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'requests' ? '#3498db' : 'transparent',
            color: activeTab === 'requests' ? 'white' : '#7f8c8d',
            border: 'none',
            borderBottom: activeTab === 'requests' ? '3px solid #2980b9' : 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          📋 Analysis Requests
        </button>
      </div>

      {/* Content */}
      {error && (
        <div style={{
          padding: '15px',
          background: '#ffe6e6',
          border: '1px solid #ff4444',
          borderRadius: '8px',
          color: '#cc0000',
          marginBottom: '20px'
        }}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {activeTab === 'users' ? (
        <UserTable 
          users={users} 
          onRoleChange={handleRoleChange}
          onDelete={handleDeleteUser}
          loading={loadingUsers}
        />
      ) : (
        <RequestTable 
          requests={requests}
          loading={loadingRequests}
        />
      )}

      {/* Info Box */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#e8f5e9',
        border: '1px solid #a5d6a7',
        borderRadius: '8px',
        color: '#2e7d32'
      }}>
        <strong>✅ Admin Dashboard:</strong> You can view all registered users, manage their roles, and monitor analysis requests.
        {users.length > 0 && <div style={{ marginTop: '10px' }}>Currently showing {users.length} user(s).</div>}
      </div>
    </div>
  );
};

export default AdminDashboard;
