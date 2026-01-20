import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import UserTable from '../components/admin/UserTable';
import RequestTable from '../components/admin/RequestTable';
import PanelRequestsTable from '../components/admin/PanelRequestsTable';
import AdminMaintenanceRequests from '../components/admin/AdminMaintenanceRequests';
import TrendsAnalysis from './TrendsAnalysis';
import { getAllUsers, getAllRequests, updateUserRole, deleteUser } from '../api/admin.api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [activeSection, setActiveSection] = useState('overview');
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    processedRequests: 0,
    pendingRequests: 0
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, []);

  useEffect(() => {
    if (activeSection === 'panel-requests') {
      navigate('/admin/panel-requests'); // Corrected the route to '/admin/panel-requests'
    }
  }, [activeSection, navigate]);

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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <div style={{ 
        width: '280px', 
        backgroundColor: '#2c3e50', 
        color: 'white',
        padding: '30px 20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Logo/Brand */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'white' }}>☀️ Solar Panel</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#95a5a6' }}>Admin Portal</p>
        </div>

        {/* User Info */}
        <div style={{ 
          backgroundColor: 'rgba(255,255,255,0.1)', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛡️</div>
          <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{user?.name || 'Admin'}</div>
          <div style={{ fontSize: '0.85rem', color: '#95a5a6' }}>{user?.email}</div>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'users', icon: '👥', label: 'User Management' },
            { id: 'requests', icon: '📋', label: 'Analysis Requests' },
            { id: 'panels', icon: '☀️', label: 'Panel Requests' },
            { id: 'maintenance', icon: '🔧', label: 'Maintenance' },
            { id: 'trends', icon: '📉', label: 'System Trends' },
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              style={{
                padding: '12px 16px',
                backgroundColor: activeSection === section.id ? '#3498db' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: activeSection === section.id ? 'bold' : 'normal',
                fontSize: '1rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== section.id) {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.id) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <h4 style={{ margin: '0 0 15px 0', color: 'white', fontSize: '0.9rem', opacity: 0.7 }}>QUICK ACTIONS</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/compare-panels" style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '10px 14px',
                background: 'rgba(155, 89, 182, 0.2)',
                color: 'white',
                border: '1px solid rgba(155, 89, 182, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                width: '100%',
                textAlign: 'left'
              }}>
                📊 Compare Panels
              </button>
            </Link>
          </div>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} style={{
          padding: '12px 16px',
          background: 'rgba(231, 76, 60, 0.2)',
          color: 'white',
          border: '1px solid rgba(231, 76, 60, 0.3)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.95rem',
          fontWeight: '500',
          marginTop: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.2rem' }}>🚪</span>
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ marginLeft: '280px', flex: 1, padding: '30px', minHeight: '100vh' }}>
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div>
            <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>Overview</h2>
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

            {/* Quick Insights */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              {/* System Status */}
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '30px',
                borderRadius: '16px',
                color: 'white',
                boxShadow: '0 8px 24px rgba(102,126,234,0.25)'
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', fontWeight: '600' }}>System Status</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ fontSize: '2rem' }}>🟢</div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>All Systems Operational</div>
                    <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>Platform running smoothly</div>
                  </div>
                </div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  padding: '15px', 
                  borderRadius: '10px',
                  marginTop: '20px'
                }}>
                  <div style={{ fontSize: '0.85rem', marginBottom: '8px', opacity: 0.9 }}>Request Processing Rate</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                    {stats.totalRequests > 0 ? Math.round((stats.processedRequests / stats.totalRequests) * 100) : 0}%
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ 
                background: '#ffffff',
                padding: '30px',
                borderRadius: '16px',
                border: '1px solid #e8ecf1',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
              }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '1.4rem' }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={() => setActiveSection('users')}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '14px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(102,126,234,0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)';
                    }}
                  >
                    <span>👥</span> Manage Users
                  </button>
                  <button
                    onClick={() => setActiveSection('requests')}
                    style={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      padding: '14px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 4px 12px rgba(245,87,108,0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(245,87,108,0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(245,87,108,0.3)';
                    }}
                  >
                    <span>📊</span> View Solar Requests
                  </button>
                  <button
                    onClick={() => setActiveSection('panel-requests')}
                    style={{
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white',
                      padding: '14px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 4px 12px rgba(79,172,254,0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(79,172,254,0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(79,172,254,0.3)';
                    }}
                  >
                    <span>🛠️</span> Panel Requests
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div style={{
              background: '#ffffff',
              padding: '30px',
              borderRadius: '16px',
              border: '1px solid #e8ecf1',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '1.4rem' }}>Platform Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px' }}>
                <div style={{ 
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  borderLeft: '4px solid #3498db'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                    User Distribution
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                    {users.filter(u => u.role === 'customer').length} Customers
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '5px' }}>
                    {users.filter(u => u.role === 'installer').length} Installers, {users.filter(u => u.role === 'admin').length} Admins
                  </div>
                </div>
                <div style={{ 
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  borderLeft: '4px solid #27ae60'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                    Completion Rate
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>
                    {stats.totalRequests > 0 ? Math.round((stats.processedRequests / stats.totalRequests) * 100) : 0}%
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '5px' }}>
                    {stats.processedRequests} of {stats.totalRequests} requests
                  </div>
                </div>
                <div style={{ 
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  borderLeft: '4px solid #f39c12'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
                    Pending Items
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f39c12' }}>
                    {stats.pendingRequests}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '5px' }}>
                    Awaiting processing
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Section */}
        {activeSection === 'users' && (
          <div>
            <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>👥 User Management</h2>
            {error && (
              <div style={{ backgroundColor: '#ffebee', padding: '20px', borderRadius: '8px', color: '#c62828', marginBottom: '20px' }}>
                <strong>Error:</strong> {error}
              </div>
            )}
            <UserTable 
              users={users} 
              loading={loadingUsers} 
              onRoleChange={handleRoleChange} 
              onDelete={handleDeleteUser} 
            />
          </div>
        )}

        {/* Analysis Requests Section */}
        {activeSection === 'requests' && (
          <div>
            <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>📋 Analysis Requests</h2>
            <RequestTable requests={requests} loading={loadingRequests} />
          </div>
        )}

        {/* Panel Requests Section */}
        {activeSection === 'panels' && (
          <div>
            <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>🔋 Panel Requests</h2>
            <PanelRequestsTable />
          </div>
        )}

        {/* Maintenance Section */}
        {activeSection === 'maintenance' && (
          <div>
            <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>🔧 Maintenance Requests</h2>
            <AdminMaintenanceRequests />
          </div>
        )}

        {/* System Trends Section */}
        {activeSection === 'trends' && (
          <div>
            <h2 style={{ fontSize: '2rem', color: '#2c3e50', marginBottom: '20px' }}>📉 System Trends</h2>
            <TrendsAnalysis />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
