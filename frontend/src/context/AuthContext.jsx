import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMe, login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/auth.api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadUser = async () => {
      if (token && !user) {
        try {
          const res = await getMe();
          setUser(res.data.data);
          localStorage.setItem('user', JSON.stringify(res.data.data));
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token, user]);

  const login = async (credentials) => {
    const res = await apiLogin(credentials);
    const { token, ...userData } = res.data.data;
    
    setToken(token);
    setUser(userData);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    return res.data;
  };

  const register = async (userData) => {
    const res = await apiRegister(userData);
    const { token, ...data } = res.data.data;
    
    setToken(token);
    setUser(data);
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(data));
    
    return res.data;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);

