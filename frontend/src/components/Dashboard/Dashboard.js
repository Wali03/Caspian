import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
`;

const WelcomeSection = styled(motion.div)`
  text-align: center;
  margin-bottom: 60px;
`;

const WelcomeTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 16px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 36px;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 20px;
  color: ${props => props.theme.colors.textLight};
  margin-bottom: 40px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 18px;
  }
`;

const HeroImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 4px solid ${props => props.theme.colors.primary};
  margin-bottom: 30px;
  object-fit: cover;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
`;

const FeatureCard = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: ${props => props.theme.shadows.card};
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.theme.shadows.modal};
  }
`;

const FeatureIcon = styled.div`
  font-size: 60px;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 12px;
`;

const FeatureDescription = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.textLight};
  margin-bottom: 20px;
  line-height: 1.6;
`;

const StatsSection = styled(motion.div)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}10, ${props => props.theme.colors.secondary}10);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  margin-bottom: 40px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  margin-top: 30px;
`;

const StatCard = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CTASection = styled.div`
  text-align: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: white;
  padding: 60px 40px;
  border-radius: 20px;
  margin-top: 40px;
`;

const CTATitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const CTADescription = styled.p`
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.9;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Dashboard = () => {
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const features = [
    {
      icon: '🎡',
      title: 'Spinning Wheel',
      description: 'Spin our exciting wheel and unlock amazing offers and discounts on your favorite dishes!',
      link: '/spin',
      buttonText: 'Spin Now',
      buttonVariant: 'primary'
    },
    {
      icon: '🎫',
      title: 'My Coupons',
      description: 'View all your earned coupons and redeem them during your next visit to CASPIAN.',
      link: '/my-coupons',
      buttonText: 'View Coupons',
      buttonVariant: 'secondary'
    },
    {
      icon: '📸',
      title: 'Follow Us on Instagram',
      description: 'Visit our Instagram for more offers, reels, new menu additions, and behind-the-scenes content!',
      link: 'https://www.instagram.com/caspian.restaurant/',
      buttonText: 'Visit Instagram',
      buttonVariant: 'outline'
    }
  ];

  return (
    <DashboardContainer>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <WelcomeSection variants={itemVariants}>
          <HeroImage 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCe6TWUm6Vi_r57Huu6BfTzu4M4nkZ72wBBA&s" 
            alt="CASPIAN Restaurant" 
          />
          <WelcomeTitle>Welcome to CASPIAN! 🍴</WelcomeTitle>
          <WelcomeSubtitle>
            Hey {user?.name}! Ready to spin the wheel and discover amazing offers?
          </WelcomeSubtitle>
        </WelcomeSection>

        <motion.div variants={itemVariants}>
          <StatsSection>
            <h2 style={{ color: '#2B5797', marginBottom: '10px' }}>Your CASPIAN Journey</h2>
            <p style={{ color: '#7F8C8D' }}>Track your progress and achievements</p>
            <StatsGrid>
              <StatCard>
                <StatNumber>{user?.coupons?.length || 0}</StatNumber>
                <StatLabel>Total Coupons Earned</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>
                  {user?.coupons?.filter(coupon => !coupon.isUsed).length || 0}
                </StatNumber>
                <StatLabel>Active Coupons</StatLabel>
              </StatCard>
              <StatCard>
                <StatNumber>
                  {user?.coupons?.filter(coupon => coupon.isUsed).length || 0}
                </StatNumber>
                <StatLabel>Coupons Used</StatLabel>
              </StatCard>
            </StatsGrid>
          </StatsSection>
        </motion.div>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              {feature.link.startsWith('http') ? (
                <a href={feature.link} target="_blank" rel="noopener noreferrer">
                  <Button variant={feature.buttonVariant} size="medium">
                    {feature.buttonText}
                  </Button>
                </a>
              ) : feature.link !== '#' ? (
                <Link to={feature.link}>
                  <Button variant={feature.buttonVariant} size="medium">
                    {feature.buttonText}
                  </Button>
                </Link>
              ) : (
                <Button variant={feature.buttonVariant} size="medium" disabled>
                  {feature.buttonText}
                </Button>
              )}
            </FeatureCard>
          ))}
        </FeaturesGrid>

        <motion.div variants={itemVariants}>
          <CTASection>
            <CTATitle>🎉 Ready for Some Fun?</CTATitle>
            <CTADescription>
              Spin our wheel now and unlock exclusive offers that make your dining experience even more delightful!
            </CTADescription>
            <ButtonGroup>
              <Link to="/spin">
                <Button variant="secondary" size="large">
                  🎡 Spin the Wheel
                </Button>
              </Link>
              <Link to="/my-coupons">
                <Button variant="outline" size="large" style={{ borderColor: 'white', color: 'white' }}>
                  🎫 View My Coupons
                </Button>
              </Link>
            </ButtonGroup>
          </CTASection>
        </motion.div>
      </motion.div>
    </DashboardContainer>
  );
};

export default Dashboard;
