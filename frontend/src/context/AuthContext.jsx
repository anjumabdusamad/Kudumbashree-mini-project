import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set API base URL
  const API_URL = 'http://localhost:5000/api';

  // Axios helper configuration
  const configureAxios = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Load user profile on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        configureAxios(token);
        try {
          const res = await axios.get(`${API_URL}/auth/me`);
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      if (res.data.success) {
        setLoading(false);
        return { success: true, message: res.data.message, email: res.data.email };
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Verify OTP code
  const verifyOTP = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/verify-otp`, { email, otp });
      if (res.data.success) {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          configureAxios(res.data.token);
          setUser(res.data.user);
          setLoading(false);
          return { success: true, approved: true, user: res.data.user };
        } else {
          setLoading(false);
          return { success: true, approved: false, message: res.data.message };
        }
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Verification failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Login user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        configureAxios(res.data.token);
        setUser(res.data.user);
        setLoading(false);
        return res.data.user;
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    configureAxios(null);
    setUser(null);
    setError(null);
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.put(`${API_URL}/auth/update-profile`, profileData);
      if (res.data.success) {
        setUser(prev => ({ ...prev, ...res.data.user }));
        setLoading(false);
        return true;
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Profile update failed';
      setError(msg);
      throw new Error(msg);
    }
  };

  const reloadUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await axios.get(`${API_URL}/auth/me`);
        if (res.data.success) {
          setUser(res.data.user);
          return res.data.user;
        }
      } catch (err) {
        console.error('Error reloading user profile:', err);
      }
    }
  };

  const value = {
    user,
    loading,
    error,
    API_URL,
    register,
    verifyOTP,
    login,
    logout,
    updateProfile,
    reloadUserProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
