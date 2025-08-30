import styled from 'styled-components';
import { motion } from 'framer-motion';

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const StyledInput = styled(motion.input).withConfig({
  shouldForwardProp: (prop) => !['error'].includes(prop)
})`
  width: 100%;
  padding: 16px 20px;
  font-size: 16px;
  border: 2px solid ${props => props.error ? props.theme.colors.error : props.theme.colors.border};
  border-radius: 12px;
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  transition: all 0.3s ease;
  outline: none;

  &:focus {
    border-color: ${props => props.error ? props.theme.colors.error : props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.error ? 
      `${props.theme.colors.error}20` : 
      `${props.theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }

  &:disabled {
    background: ${props => props.theme.colors.background};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const ErrorMessage = styled(motion.div)`
  color: ${props => props.theme.colors.error};
  font-size: 14px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HelperText = styled.div`
  color: ${props => props.theme.colors.textLight};
  font-size: 12px;
  margin-top: 4px;
`;

const Input = ({ 
  label, 
  error, 
  helperText, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  disabled = false,
  required = false,
  ...props 
}) => {
  return (
    <InputContainer>
      {label && (
        <Label>
          {label}
          {required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
        </Label>
      )}
      <StyledInput
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        error={error}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      />
      {error && (
        <ErrorMessage
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          ⚠️ {error}
        </ErrorMessage>
      )}
      {helperText && !error && (
        <HelperText>{helperText}</HelperText>
      )}
    </InputContainer>
  );
};

export default Input;
