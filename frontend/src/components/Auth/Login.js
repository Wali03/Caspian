import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Input from '../UI/Input';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: 
    linear-gradient(rgba(139, 69, 19, 0.85), rgba(210, 105, 30, 0.85)),
    url('https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80');
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

const LoginCard = styled(motion.div)`
  background: ${props => props.theme.colors.surfaceGlass};
  backdrop-filter: blur(20px);
  padding: 40px;
  border-radius: 20px;
  box-shadow: 
    ${props => props.theme.shadows.modal},
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  width: 100%;
  max-width: 400px;
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
  border-radius: 50%;
  margin-bottom: 16px;
  border: 3px solid ${props => props.theme.colors.primary};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.primary};
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.textLight};
  font-size: 16px;
  text-align: center;
  margin-bottom: 30px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const StyledLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  transition: color 0.3s ease;

  &:hover {
    color: ${props => props.theme.colors.secondary};
  }
`;

const WelcomeText = styled.div`
  text-align: center;
  margin-bottom: 20px;
  padding: 16px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}10, ${props => props.theme.colors.secondary}10);
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      const result = await login({
        email: formData.email.trim(),
        password: formData.password
      });

      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LogoContainer>
          <Logo 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCe6TWUm6Vi_r57Huu6BfTzu4M4nkZ72wBBA&s" 
            alt="CASPIAN Restaurant Logo" 
          />
          <Title>Welcome Back</Title>
          <Subtitle>Sign in to your CASPIAN account</Subtitle>
        </LogoContainer>

        <WelcomeText>
          <h3 style={{ color: '#2B5797', marginBottom: '8px' }}>🎡 Spin & Win Amazing Offers!</h3>
          <p style={{ fontSize: '14px', color: '#7F8C8D' }}>
            Login to access the spinning wheel and unlock exclusive restaurant coupons
          </p>
        </WelcomeText>

        <Form onSubmit={handleSubmit}>
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

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
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
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Form>

        <LinkContainer>
          <p style={{ color: '#8B7355', marginBottom: '8px' }}>
            <StyledLink to="/forgot-password">Forgot Password?</StyledLink>
          </p>
          <p style={{ color: '#8B7355', marginBottom: '8px' }}>
            Don't have an account?{' '}
            <StyledLink to="/signup">Create Account</StyledLink>
          </p>
        </LinkContainer>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
