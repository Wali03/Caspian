import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';

const ResetPasswordContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: 
    linear-gradient(rgba(139, 69, 19, 0.85), rgba(210, 105, 30, 0.85)),
    url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 20px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, transparent 30%, rgba(139, 69, 19, 0.3) 100%);
    pointer-events: none;
  }
`;

const ResetPasswordCard = styled(motion.div)`
  background: ${props => props.theme.colors.surfaceGlass};
  backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 
    ${props => props.theme.shadows.modal},
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  width: 100%;
  max-width: 450px;
  position: relative;
  overflow: hidden;
  z-index: 2;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.accent});
  }
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Logo = styled.img`
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${props => props.theme.colors.primary};
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.textLight};
  line-height: 1.4;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
`;

const WelcomeText = styled.div`
  text-align: center;
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}10, ${props => props.theme.colors.accent}10);
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const LinkContainer = styled.div`
  text-align: center;
`;

const StyledLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.accent};
    text-decoration: underline;
  }
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, ${props => props.theme.colors.success}20, ${props => props.theme.colors.success}10);
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.success}30;
  color: ${props => props.theme.colors.success};
  margin-bottom: 20px;

  h3 {
    margin-bottom: 8px;
    color: ${props => props.theme.colors.success};
  }

  p {
    color: ${props => props.theme.colors.textLight};
    font-size: 14px;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, ${props => props.theme.colors.error}20, ${props => props.theme.colors.error}10);
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.error}30;
  color: ${props => props.theme.colors.error};
  margin-bottom: 20px;

  h3 {
    margin-bottom: 8px;
    color: ${props => props.theme.colors.error};
  }

  p {
    color: ${props => props.theme.colors.textLight};
    font-size: 14px;
  }
`;

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('form'); // 'form', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token, formData.newPassword);

      if (result.success) {
        setStatus('success');
        // Navigate to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage(result.message || 'Password reset failed');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'success':
        return (
          <>
            <SuccessMessage>
              <h3>✅ Password Reset Successful!</h3>
              <p>Your password has been updated. You can now login with your new password.</p>
            </SuccessMessage>

            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </>
        );

      case 'error':
        return (
          <>
            <ErrorMessage>
              <h3>❌ Reset Failed</h3>
              <p>{errorMessage}</p>
            </ErrorMessage>

            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={() => navigate('/forgot-password')}
            >
              Request New Reset Link
            </Button>
          </>
        );

      default:
        return (
          <>
            <WelcomeText>
              <h3 style={{ color: '#D2691E', marginBottom: '8px' }}>🔐 Reset Your Password</h3>
              <p style={{ fontSize: '14px', color: '#8B7355' }}>
                Enter your new password below
              </p>
            </WelcomeText>

            <Form onSubmit={handleSubmit}>
              <Input
                label="New Password"
                type="password"
                name="newPassword"
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                required
                helperText="Minimum 6 characters"
              />

              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Form>
          </>
        );
    }
  };

  return (
    <ResetPasswordContainer>
      <ResetPasswordCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoContainer>
          <Logo 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCe6TWUm6Vi_r57Huu6BfTzu4M4nkZ72wBBA&s" 
            alt="CASPIAN Restaurant Logo" 
          />
          <Title>Reset Password</Title>
          <Subtitle>Enter your new password</Subtitle>
        </LogoContainer>

        {renderContent()}

        {status === 'form' && (
          <LinkContainer>
            <p style={{ color: '#8B7355', marginBottom: '8px' }}>
              Remember your password?{' '}
              <StyledLink to="/login">Back to Login</StyledLink>
            </p>
          </LinkContainer>
        )}
      </ResetPasswordCard>
    </ResetPasswordContainer>
  );
};

export default ResetPassword;
