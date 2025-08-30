import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';

const VerificationContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: 
    linear-gradient(rgba(139, 69, 19, 0.85), rgba(210, 105, 30, 0.85)),
    url('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
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
    background: radial-gradient(circle at center, transparent 30%, rgba(210, 105, 30, 0.3) 100%);
    pointer-events: none;
  }
`;

const VerificationCard = styled(motion.div)`
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

const ResendContainer = styled.div`
  text-align: center;
  margin-top: 16px;
  padding: 16px;
  background: ${props => props.theme.colors.surfaceGlass};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.colors.accent};
  }

  &:disabled {
    color: ${props => props.theme.colors.textLight};
    cursor: not-allowed;
    text-decoration: none;
  }
`;

const EmailVerification = () => {
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { verifySignupOTP, sendSignupOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get signup data from location state
  const signupData = location.state?.signupData;
  const tempUserId = location.state?.tempUserId;

  useEffect(() => {
    // Redirect if no signup data
    if (!signupData || !tempUserId) {
      navigate('/signup');
      return;
    }

    // Start countdown for resend button
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [signupData, tempUserId, navigate]);

  const handleChange = (e) => {
    const { value } = e.target;
    setOtp(value);
    
    // Clear error when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  const validateOTP = () => {
    const newErrors = {};

    if (!otp.trim()) {
      newErrors.otp = 'OTP is required';
    } else if (!/^[0-9]{6}$/.test(otp.trim())) {
      newErrors.otp = 'Please enter a valid 6-digit OTP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateOTP()) {
      return;
    }

    setLoading(true);
    try {
      const result = await verifySignupOTP(tempUserId, otp.trim());

      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setResendDisabled(true);
    setCountdown(60);

    try {
      const result = await sendSignupOTP(signupData);

      if (result.success) {
        // Update tempUserId if it changed
        if (result.tempUserId && result.tempUserId !== tempUserId) {
          window.history.replaceState(
            { ...location.state, tempUserId: result.tempUserId },
            ''
          );
        }
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToSignup = () => {
    navigate('/signup');
  };

  if (!signupData || !tempUserId) {
    return null; // Will redirect in useEffect
  }

  return (
    <VerificationContainer>
      <VerificationCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoContainer>
          <Logo 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCe6TWUm6Vi_r57Huu6BfTzu4M4nkZ72wBBA&s" 
            alt="CASPIAN Restaurant Logo" 
          />
          <Title>Verify Your Email</Title>
          <Subtitle>Enter the verification code sent to your email</Subtitle>
        </LogoContainer>

        <WelcomeText>
          <h3 style={{ color: '#D2691E', marginBottom: '8px' }}>📧 Check Your Email!</h3>
          <p style={{ fontSize: '14px', color: '#8B7355' }}>
            We've sent a 6-digit verification code to <strong>{signupData.email}</strong>
          </p>
        </WelcomeText>

        <Form onSubmit={handleSubmit}>
          <Input
            label="Verification Code"
            type="text"
            name="otp"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={handleChange}
            error={errors.otp}
            required
            maxLength={6}
            helperText="Check your email for the verification code"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button
              type="submit"
              variant="primary"
              size="large"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              size="large"
              fullWidth
              onClick={handleBackToSignup}
              disabled={loading}
            >
              Back to Signup
            </Button>
          </div>
        </Form>

        <ResendContainer>
          <p style={{ fontSize: '14px', color: '#8B7355', marginBottom: '8px' }}>
            Didn't receive the code?
          </p>
          <ResendButton
            type="button"
            onClick={handleResendOTP}
            disabled={resendDisabled || resendLoading}
          >
            {resendLoading 
              ? 'Sending...' 
              : resendDisabled 
                ? `Resend in ${countdown}s` 
                : 'Resend Code'
            }
          </ResendButton>
        </ResendContainer>

        <LinkContainer>
          <p style={{ color: '#8B7355', marginBottom: '8px' }}>
            Already have an account?{' '}
            <StyledLink to="/login">Sign In</StyledLink>
          </p>
        </LinkContainer>
      </VerificationCard>
    </VerificationContainer>
  );
};

export default EmailVerification;
