import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';

const NavbarContainer = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: ${props => props.theme.colors.surface};
  box-shadow: ${props => props.theme.shadows.card};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const NavbarContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 0 16px;
  }
`;

const LogoSection = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
`;

const LogoImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${props => props.theme.colors.primary};
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const BrandName = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin: 0;
  line-height: 1;
`;

const BrandTagline = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const NavLinks = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isOpen'].includes(prop)
})`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: ${props => props.isOpen ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: ${props => props.theme.colors.surface};
    border-top: 1px solid ${props => props.theme.colors.border};
    flex-direction: column;
    padding: 20px;
    box-shadow: ${props => props.theme.shadows.card};
  }
`;

const NavLink = styled(Link).withConfig({
  shouldForwardProp: (prop) => !['isActive'].includes(prop)
})`
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  color: ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.text};
  background: ${props => props.isActive ? `${props.theme.colors.primary}10` : 'transparent'};
  text-decoration: none;
  
  &:hover {
    background: ${props => props.theme.colors.primary}10;
    color: ${props => props.theme.colors.primary};
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
    text-align: center;
    padding: 12px;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    order: -1;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const UserMobile = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.textLight};
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: ${props => props.theme.colors.text};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: block;
  }
`;

const CouponCount = styled.div`
  background: ${props => props.theme.colors.accent};
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  if (!user) return null;

  return (
    <NavbarContainer
      initial={{ y: -70 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <NavbarContent>
        <LogoSection to="/dashboard" onClick={closeMenu}>
          <LogoImage 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCe6TWUm6Vi_r57Huu6BfTzu4M4nkZ72wBBA&s" 
            alt="CASPIAN Logo" 
          />
          <LogoText>
            <BrandName>CASPIAN</BrandName>
            <BrandTagline>Restaurant</BrandTagline>
          </LogoText>
        </LogoSection>

        <NavLinks isOpen={isMenuOpen}>
          <NavLink 
            to="/dashboard" 
            isActive={isActive('/dashboard')}
            onClick={closeMenu}
          >
            🏠 Dashboard
          </NavLink>
          <NavLink 
            to="/spin" 
            isActive={isActive('/spin')}
            onClick={closeMenu}
          >
            🎡 Spin Wheel
          </NavLink>
          <NavLink 
            to="/my-coupons" 
            isActive={isActive('/my-coupons')}
            onClick={closeMenu}
          >
            🎫 My Coupons
            {user.coupons && user.coupons.length > 0 && (
              <CouponCount>{user.coupons.length}</CouponCount>
            )}
          </NavLink>
        </NavLinks>

        <UserSection>
          <UserInfo>
            <UserName>👋 {user.name}</UserName>
          </UserInfo>
          
          <Button 
            variant="outline" 
            size="small"
            onClick={handleLogout}
          >
            Logout
          </Button>

          <MobileMenuButton onClick={toggleMenu}>
            {isMenuOpen ? '✕' : '☰'}
          </MobileMenuButton>
        </UserSection>
      </NavbarContent>
    </NavbarContainer>
  );
};

export default Navbar;
