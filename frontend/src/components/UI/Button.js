import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const StyledButton = styled(motion.button).withConfig({
  shouldForwardProp: (prop) => !['fullWidth', 'loading', 'size', 'variant'].includes(prop)
})`
  padding: ${props => props.size === 'large' ? '16px 32px' : props.size === 'small' ? '8px 16px' : '12px 24px'};
  font-size: ${props => props.size === 'large' ? '18px' : props.size === 'small' ? '14px' : '16px'};
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: ${props => props.fullWidth ? '100%' : 'auto'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: ${props => props.theme.shadows.button};

  /* Variant styles */
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, ${props.theme.colors.primary} 0%, #1e4d72 100%);
          color: white;
          border: none;
          
          &:hover {
            background: linear-gradient(135deg, #1e4d72 0%, ${props.theme.colors.primary} 100%);
            box-shadow: 0 4px 12px rgba(43, 87, 151, 0.3);
            transform: translateY(-2px);
          }
        `;
      case 'secondary':
        return `
          background: linear-gradient(135deg, ${props.theme.colors.secondary} 0%, #d4949a 100%);
          color: white;
          border: none;
          
          &:hover {
            background: linear-gradient(135deg, #d4949a 0%, ${props.theme.colors.secondary} 100%);
            box-shadow: 0 4px 12px rgba(232, 180, 184, 0.3);
            transform: translateY(-2px);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${props.theme.colors.primary};
          border: 2px solid ${props.theme.colors.primary};
          
          &:hover {
            background: ${props.theme.colors.primary};
            color: white;
            transform: translateY(-2px);
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: ${props.theme.colors.text};
          border: none;
          box-shadow: none;
          
          &:hover {
            background: ${props.theme.colors.background};
            transform: translateY(-1px);
          }
        `;
      default:
        return `
          background: ${props.theme.colors.accent};
          color: white;
          border: none;
          
          &:hover {
            background: #e8a847;
            transform: translateY(-2px);
          }
        `;
    }
  }}

  &:active {
    transform: translateY(0);
    box-shadow: ${props => props.theme.shadows.button};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    
    &:hover {
      transform: none !important;
    }
  }

  /* Loading state */
  ${props => props.loading && css`
    position: relative;
    color: transparent;
    
    &::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: ${spin} 1s linear infinite;
      color: white;
    }
  `}
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false, 
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      loading={loading}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
