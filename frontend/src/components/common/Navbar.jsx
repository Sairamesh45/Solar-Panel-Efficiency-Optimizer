import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, onClick }) => (
    <Link 
      to={to} 
      onClick={() => {
        setMobileMenuOpen(false);
        onClick && onClick();
      }}
      style={{ 
        color: 'white', 
        textDecoration: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        backgroundColor: isActive(to) ? 'rgba(255,255,255,0.2)' : 'transparent',
        transition: 'all 0.2s',
        fontWeight: isActive(to) ? '600' : 'normal',
        display: 'inline-block'
      }}
      onMouseEnter={e => {
        if (!isActive(to)) {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
        }
      }}
      onMouseLeave={e => {
        if (!isActive(to)) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {children}
    </Link>
  );

  return (
    <nav style={{ 
      padding: '1rem 2rem', 
      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      color: 'white', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <Link 
          to="/" 
          style={{ 
            color: 'white', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: '2rem' }}>☀️</span>
          <span>SolarOptimizer</span>
        </Link>

        {/* Desktop Menu */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
        }} className="desktop-menu">
          {user ? (
            <>
              <NavLink to="/analyze">🔍 Analyze</NavLink>
              <NavLink to="/dashboard">📊 Dashboard</NavLink>
              <NavLink to="/trends">📈 Trends</NavLink>
              <NavLink to="/ml-metrics">🤖 ML Model</NavLink>
              {user.role === 'Admin' && <NavLink to="/admin">🛡️ Admin</NavLink>}
              
              <div style={{
                marginLeft: '15px',
                padding: '8px 16px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{ fontSize: '1.2rem' }}>👤</span>
                <span style={{ fontWeight: '600' }}>{user.name}</span>
                {user.role === 'Admin' && (
                  <span style={{
                    padding: '2px 8px',
                    backgroundColor: '#e74c3c',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>ADMIN</span>
                )}
              </div>
              
              <button 
                onClick={handleLogout}
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  marginLeft: '10px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#c0392b';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#e74c3c';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">🔑 Login</NavLink>
              <Link 
                to="/register"
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#27ae60',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  marginLeft: '10px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#229954';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#27ae60';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                📝 Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          className="mobile-menu-button"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: '#2c3e50',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }} className="mobile-menu">
          {user ? (
            <>
              <div style={{
                padding: '15px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>👤</span>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>{user.email}</div>
                  </div>
                </div>
              </div>
              <NavLink to="/analyze">🔍 Analyze</NavLink>
              <NavLink to="/dashboard">📊 Dashboard</NavLink>
              <NavLink to="/trends">📈 Trends</NavLink>
              {user.role === 'Admin' && <NavLink to="/admin">🛡️ Admin Panel</NavLink>}
              <button 
                onClick={handleLogout}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginTop: '10px'
                }}
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">🔑 Login</NavLink>
              <NavLink to="/register">📝 Register</NavLink>
            </>
          )}
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-menu-button {
            display: block !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;

