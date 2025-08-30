import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import EmailVerification from './components/Auth/EmailVerification';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import Dashboard from './components/Dashboard/Dashboard';
import SpinWheel from './components/SpinWheel/SpinWheel';
import MyCoupons from './components/Coupons/MyCoupons';
import Navbar from './components/Layout/Navbar';

// Enhanced Restaurant Theme
const theme = {
  colors: {
    primary: '#D2691E', // Warm orange-brown (restaurant theme)
    secondary: '#8B4513', // Saddle brown
    accent: '#FF6347', // Tomato red
    background: 'linear-gradient(135deg, #FFF8DC 0%, #F5DEB3 100%)', // Cornsilk to wheat
    surface: 'rgba(255, 255, 255, 0.95)',
    surfaceGlass: 'rgba(255, 255, 255, 0.85)',
    text: '#2F1B14',
    textLight: '#8B7355',
    success: '#228B22',
    warning: '#FF8C00',
    error: '#DC143C',
    border: '#DEB887',
    foodRed: '#CC2936',
    foodGreen: '#2E8B57',
    foodGold: '#FFD700'
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px'
  },
  shadows: {
    card: '0 4px 6px rgba(0, 0, 0, 0.1)',
    button: '0 2px 4px rgba(0, 0, 0, 0.1)',
    modal: '0 10px 25px rgba(0, 0, 0, 0.2)'
  }
};

// Global Styles
const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
    background: ${props => props.theme.colors.background};
    background-attachment: fixed;
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    position: relative;
  }

  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(210, 105, 30, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 99, 71, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(139, 69, 19, 0.05) 0%, transparent 50%);
    z-index: -2;
  }

  body::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="%23D2691E" opacity="0.1"/><circle cx="50" cy="40" r="0.5" fill="%238B4513" opacity="0.1"/><circle cx="80" cy="60" r="1.5" fill="%23FF6347" opacity="0.1"/><circle cx="30" cy="80" r="0.8" fill="%23D2691E" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
    z-index: -1;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
  }

  input, textarea {
    font-family: inherit;
    outline: none;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  .Toastify__toast {
    border-radius: 8px;
  }

  .Toastify__toast--success {
    background: ${props => props.theme.colors.success};
  }

  .Toastify__toast--error {
    background: ${props => props.theme.colors.error};
  }

  .Toastify__toast--warning {
    background: ${props => props.theme.colors.warning};
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main.withConfig({
  shouldForwardProp: (prop) => !['hasNavbar'].includes(prop)
})`
  flex: 1;
  padding-top: ${props => props.hasNavbar ? '80px' : '0'};
`;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <AppContainer>
      {user && <Navbar />}
      <MainContent hasNavbar={!!user}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } />
          <Route path="/verify-email" element={
            <PublicRoute>
              <EmailVerification />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } />
          <Route path="/reset-password/:token" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/spin" element={
            <ProtectedRoute>
              <SpinWheel />
            </ProtectedRoute>
          } />
          <Route path="/my-coupons" element={
            <ProtectedRoute>
              <MyCoupons />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={
            user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
          
          {/* 404 fallback */}
          <Route path="*" element={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100vh',
              flexDirection: 'column'
            }}>
              <h2>404 - Page Not Found</h2>
              <p>The page you're looking for doesn't exist.</p>
            </div>
          } />
        </Routes>
      </MainContent>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AppContainer>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;