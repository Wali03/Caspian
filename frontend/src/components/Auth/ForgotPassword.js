import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';

const ForgotPasswordContainer = styled.div`
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

const ForgotPasswordCard = styled(motion.div)`
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

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [formData, setFormData] = useState({
    email: ''
  });
  // Removed resetData state since we now use link-based reset
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { sendPasswordResetLink } = useAuth();
  const navigate = useNavigate();

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

  const validateEmailForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Removed validateResetForm since we now use link-based reset

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmailForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await sendPasswordResetLink(formData.email.trim());

      if (result.success) {
        setStep(3); // Go directly to success
      }
    } catch (error) {
      console.error('Send reset link error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Removed handleResetSubmit since we now use link-based reset

  // Removed handleBackToEmail since we now use link-based reset

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <WelcomeText>
              <h3 style={{ color: '#D2691E', marginBottom: '8px' }}>🔐 Reset Your Password</h3>
              <p style={{ fontSize: '14px', color: '#8B7355' }}>
                Enter your email address and we'll send you a reset link
              </p>
            </WelcomeText>

            <Form onSubmit={handleEmailSubmit}>
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
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
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </Button>
            </Form>
          </>
        );

      // Removed case 2 since we now use link-based reset

      case 3:
        return (
          <>
            <SuccessMessage>
              <h3>✅ Password Reset Link Sent!</h3>
              <p>Check your email and click the reset link to set a new password.</p>
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

      default:
        return null;
    }
  };

  return (
    <ForgotPasswordContainer>
      <ForgotPasswordCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoContainer>
          <Logo 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCe6TWUm6Vi_r57Huu6BfTzu4M4nkZ72wBBA&s" 
            alt="CASPIAN Restaurant Logo" 
          />
          <Title>
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Reset Password'}
            {step === 3 && 'Success!'}
          </Title>
          <Subtitle>
            {step === 1 && 'Enter your email to receive a reset code'}
            {step === 2 && 'Enter the code and your new password'}
            {step === 3 && 'Your password has been successfully reset'}
          </Subtitle>
        </LogoContainer>

        {renderStepContent()}

        {step !== 3 && (
          <LinkContainer>
            <p style={{ color: '#8B7355', marginBottom: '8px' }}>
              Remember your password?{' '}
              <StyledLink to="/login">Back to Login</StyledLink>
            </p>
          </LinkContainer>
        )}
      </ForgotPasswordCard>
    </ForgotPasswordContainer>
  );
};

export default ForgotPassword;
