import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import InstallerDashboard from './InstallerDashboard';
import AdminDashboardComponent from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuthContext();

  // Route to role-specific dashboard
  if (user?.role === 'Customer') {
    return <CustomerDashboard />;
  }
  
  if (user?.role === 'Installer') {
    return <InstallerDashboard />;
  }
  
  if (user?.role === 'Admin') {
    return <AdminDashboardComponent />;
  }

  // Default fallback to Customer dashboard
  return <CustomerDashboard />;
};

export default Dashboard;

