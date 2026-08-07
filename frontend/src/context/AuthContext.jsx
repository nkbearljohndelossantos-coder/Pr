import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/systemApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('erp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('erp_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authApi.login({ username, password });
      const { user: userData, accessToken } = res.data.data;
      setUser(userData);
      setToken(accessToken);
      localStorage.setItem('erp_user', JSON.stringify(userData));
      localStorage.setItem('erp_token', accessToken);
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_token');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
