import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
          // Verify token is still valid by fetching user profile
          const response = await api.get('/auth/profile');
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid session
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const sendSignupOTP = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/send-signup-otp', userData);
      
      if (response.data.success) {
        toast.success(response.data.message);
        return { success: true, tempUserId: response.data.tempUserId };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send verification code';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const verifySignupOTP = async (tempUserId, otp) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/verify-signup-otp', { tempUserId, otp });
      
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        toast.success(response.data.message);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        toast.success('Login successful!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  // Coupon related functions
  const spinWheel = async (selectedOfferIndex = null) => {
    try {
      const response = await api.post('/coupons/spin', {
        selectedOfferIndex
      });
      if (response.data.success) {
        // Refresh user profile to get updated coupons
        await refreshUserProfile();
        toast.success(response.data.message);
        return { success: true, coupon: response.data.coupon };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Spin failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const getMyCoupons = async () => {
    try {
      const response = await api.get('/coupons/my-coupons');
      if (response.data.success) {
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch coupons';
      toast.error(message);
      return { success: false, message };
    }
  };

  const redeemCoupon = async (couponId) => {
    try {
      const response = await api.put(`/coupons/${couponId}/use`);
      if (response.data.success) {
        // Refresh user profile to get updated coupons
        await refreshUserProfile();
        toast.success(response.data.message);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to use coupon';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Password reset functions
  const sendPasswordResetLink = async (email) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        toast.success(response.data.message);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset link';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      const response = await api.post(`/auth/reset-password/${token}`, { newPassword });
      
      if (response.data.success) {
        toast.success(response.data.message);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    sendSignupOTP,
    verifySignupOTP,
    login,
    logout,
    updateUser,
    sendPasswordResetLink,
    resetPassword,
    refreshUserProfile,
    spinWheel,
    getMyCoupons,
    redeemCoupon,
    api // Export api instance for custom requests
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
