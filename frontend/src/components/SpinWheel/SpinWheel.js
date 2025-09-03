import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';

const SpinContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  text-align: center;
  margin-bottom: 20px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 36px;
  }
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: ${props => props.theme.colors.textLight};
  text-align: center;
  margin-bottom: 40px;
  max-width: 600px;
`;

const WheelContainer = styled.div`
  position: relative;
  margin: 40px 0;
`;

const WheelWrapper = styled.div`
  position: relative;
  width: 400px;
  height: 400px;
  margin: 0 auto;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 320px;
    height: 320px;
  }
`;

const spinAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(var(--final-rotation));
  }
`;

const WheelSVG = styled.svg.withConfig({
  shouldForwardProp: (prop) => !['isSpinning', 'duration', 'finalRotation'].includes(prop)
})`
  width: 100%;
  height: 100%;
  transform-origin: center;
  transition: transform 0.1s ease;
  
  ${props => props.isSpinning && css`
    animation: ${spinAnimation} ${props.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    --final-rotation: ${props.finalRotation}deg;
  `}
`;

const Pointer = styled.div`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;
  border-top: 40px solid ${props => props.theme.colors.accent};
  z-index: 10;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
`;

const CenterCircle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translate(-50%, -50%) scale(1.05);
  }

  &:active {
    transform: translate(-50%, -50%) scale(0.95);
  }
`;

const CenterLogo = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid white;
`;

const ControlsSection = styled.div`
  text-align: center;
  margin-top: 40px;
`;

const SpinButton = styled(Button)`
  font-size: 20px;
  padding: 16px 40px;
  margin-bottom: 20px;
`;

const InfoSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 16px;
  padding: 24px;
  margin-top: 40px;
  box-shadow: ${props => props.theme.shadows.card};
  max-width: 600px;
  width: 100%;
`;

const InfoTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: 16px;
  font-size: 20px;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InfoItem = styled.li`
  padding: 8px 0;
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  &:before {
    content: '✓';
    color: ${props => props.theme.colors.success};
    font-weight: bold;
    font-size: 16px;
  }
`;

const WinModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const WinContent = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: ${props => props.theme.shadows.modal};
`;

const WinTitle = styled.h2`
  font-size: 32px;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 20px;
`;

const WinDescription = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  margin-bottom: 20px;
  line-height: 1.6;
`;

const CouponCode = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: white;
  padding: 16px;
  border-radius: 12px;
  font-size: 24px;
  font-weight: 700;
  margin: 20px 0;
  letter-spacing: 2px;
`;

const SpinWheel = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [finalRotation, setFinalRotation] = useState(0);
  const [spinDuration, setSpinDuration] = useState(3);
  const [wonCoupon, setWonCoupon] = useState(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const wheelRef = useRef(null);
  const { spinWheel: apiSpinWheel } = useAuth();
  const navigate = useNavigate();

  // Define the 8 offers as wheel segments (must match backend OFFERS array order)
  const offers = [
    { 
      id: 0, 
      text: 'Free Beverage with Breakfast', 
      color: '#FF6B6B',
      icon: '☕'
    },
    { 
      id: 1, 
      text: '10% Off Non-Veg', 
      color: '#4ECDC4',
      icon: '🍖'
    },
    { 
      id: 2, 
      text: '10% Off Tandoor (Evening)', 
      color: '#45B7D1',
      icon: '🔥'
    },
    { 
      id: 3, 
      text: 'Free Add-on with Bowl', 
      color: '#96CEB4',
      icon: '🥗'
    },
    { 
      id: 4, 
      text: 'Honey Chili Potato with Chinese', 
      color: '#FFEAA7',
      icon: '🥔'
    },
    { 
      id: 5, 
      text: 'Thai Curry + Beverage', 
      color: '#DDA0DD',
      icon: '🥡'
    },
    { 
      id: 6, 
      text: '20% Off Bill (Min ₹2000)', 
      color: '#FFD93D',
      icon: '💰'
    },
    { 
      id: 7, 
      text: 'Free Mocktail with Biryani', 
      color: '#FF9FF3',
      icon: '🍹'
    }
  ];

  const segmentAngle = 360 / offers.length; // 45 degrees per segment

  const handleSpin = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    
    // Start infinite suspense spin - continuous spinning until backend responds
    const suspenseRotations = 3600; // 10 full rotations (enough to last during API call)
    const suspenseDuration = 10; // 10 seconds (longer than any reasonable API call)
    const suspenseAngle = Math.random() * 360;
    
    setFinalRotation(suspenseRotations + suspenseAngle);
    setSpinDuration(suspenseDuration);
    
    console.log('🎡 Starting infinite suspense spin...');
    
    // Call API to get the winning offer from backend (in parallel)
    try {
      const result = await apiSpinWheel();
      
      if (result.success) {
        // Get the winning segment index from backend response
        const winningSegmentIndex = result.winningSegmentIndex;
        const selectedOffer = offers[winningSegmentIndex];
        
        console.log('🎯 Backend responded! Selected segment:', winningSegmentIndex, 'offer:', selectedOffer.text);
        
        // Calculate the exact angle to land on the winning segment
        const segmentAngleSize = 360 / offers.length; // 45 degrees per segment
        
        // Since segments are drawn starting from 12 o'clock (top), segment 0 is at the top
        // We need to calculate how much to rotate to bring the winning segment to the top
        const segmentCenterAngle = (winningSegmentIndex * segmentAngleSize) + (segmentAngleSize / 2);
        
        // To bring the winning segment to the top (12 o'clock), we need to rotate by:
        // 360° - segmentCenterAngle (to bring it to the top)
        const targetAngle = 360 - segmentCenterAngle;
        
        // Calculate current approximate position (estimate based on time elapsed)
        const timeElapsed = Date.now() - (Date.now() - 1000); // Rough estimate
        const currentApproxRotation = (timeElapsed / (suspenseDuration * 1000)) * suspenseRotations;
        
        // Add exactly 2 more full rotations as requested, then land on correct segment
        const finalRotations = 720; // Exactly 2 full rotations
        const finalRotation = currentApproxRotation + finalRotations + targetAngle;
        
        // Set final animation duration
        const finalDuration = 2.5; // 2.5 seconds for the final spin
        
        console.log('📐 Angle calculations:');
        console.log('   - Segment angle size:', segmentAngleSize, 'degrees');
        console.log('   - Winning segment center angle:', segmentCenterAngle, 'degrees');
        console.log('   - Target rotation to bring to top:', targetAngle, 'degrees');
        console.log('   - Estimated current rotation:', currentApproxRotation, 'degrees');
        console.log('   - Final rotation (current + 2 rotations + target):', finalRotation, 'degrees');
        console.log('   - Final animation duration:', finalDuration, 'seconds');
        
        // Immediately start the final spin to correct position
        console.log('🎯 Backend responded! Now spinning to winning segment...');
        setFinalRotation(finalRotation);
        setSpinDuration(finalDuration);
        
        // Stop spinning after final animation completes and show result
        setTimeout(() => {
          setIsSpinning(false);
          
          setWonCoupon({
            ...result.coupon,
            selectedOffer
          });
          setShowWinModal(true);
        }, (finalDuration + 0.5) * 1000);
        
      } else {
        // If API fails, stop spinning
        setIsSpinning(false);
      }
      
    } catch (error) {
      console.error('Spin wheel error:', error);
      // If API fails, stop spinning
      setIsSpinning(false);
    }
  };

  const closeWinModal = () => {
    setShowWinModal(false);
    setWonCoupon(null);
  };

  const viewMyCoupons = () => {
    navigate('/my-coupons');
  };

  // Generate SVG segments
  const generateSegments = () => {
    return offers.map((offer, index) => {
      // SVG coordinate system: 0° is at 3 o'clock, we need to start from 12 o'clock (top)
      // So we need to offset by -90° to start from the top
      const startAngle = (index * segmentAngle) - 90;
      const endAngle = ((index + 1) * segmentAngle) - 90;
      
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      
      const radius = 180;
      const center = 200;
      
      const x1 = center + radius * Math.cos(startAngleRad);
      const y1 = center + radius * Math.sin(startAngleRad);
      const x2 = center + radius * Math.cos(endAngleRad);
      const y2 = center + radius * Math.sin(endAngleRad);
      
      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
      
      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      // Calculate text position
      const textAngle = startAngle + segmentAngle / 2;
      const textAngleRad = (textAngle * Math.PI) / 180;
      const textRadius = radius * 0.7;
      const textX = center + textRadius * Math.cos(textAngleRad);
      const textY = center + textRadius * Math.sin(textAngleRad);

      // Debug log for segment positions
      if (index === 0 || index === 1) {
        console.log(`🎯 Segment ${index} (${offer.text}): start=${startAngle}°, end=${endAngle}°, center=${textAngle}°`);
      }

      return (
        <g key={offer.id}>
          <path
            d={pathData}
            fill={offer.color}
            stroke="#fff"
            strokeWidth="3"
          />
          <text
            x={textX}
            y={textY}
            fill="#fff"
            fontSize="14"
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${textAngle}, ${textX}, ${textY})`}
          >
            <tspan x={textX} dy="-8">{offer.icon}</tspan>
            {(() => {
              // Smart word wrapping - split by words, not characters
              const words = offer.text.split(' ');
              const lines = [];
              let currentLine = '';
              
              words.forEach(word => {
                if ((currentLine + word).length <= 16) {
                  currentLine += (currentLine ? ' ' : '') + word;
                } else {
                  if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                  } else {
                    lines.push(word);
                  }
                }
              });
              
              if (currentLine) {
                lines.push(currentLine);
              }
              
              return lines.map((line, lineIndex) => (
                <tspan 
                  key={lineIndex}
                  x={textX} 
                  dy={lineIndex === 0 ? "16" : "12"} 
                  fontSize="11"
                >
                  {line}
                </tspan>
              ));
            })()}
          </text>
        </g>
      );
    });
  };

  return (
    <SpinContainer>
      <Title>🎡 Spin the Wheel of Fortune!</Title>
      <Subtitle>
        Test your luck and win amazing offers and discounts on delicious CASPIAN dishes. 
        Each spin could unlock a special treat just for you!
      </Subtitle>

      <WheelContainer>
        <WheelWrapper>
          <Pointer />
          <WheelSVG
            viewBox="0 0 400 400"
            ref={wheelRef}
            isSpinning={isSpinning}
            finalRotation={finalRotation}
            duration={spinDuration}
          >
            {generateSegments()}
          </WheelSVG>
          <CenterCircle onClick={handleSpin}>
            <CenterLogo 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCe6TWUm6Vi_r57Huu6BfTzu4M4nkZ72wBBA&s" 
              alt="CASPIAN Logo" 
            />
          </CenterCircle>
        </WheelWrapper>
      </WheelContainer>

      <ControlsSection>
        <SpinButton
          onClick={handleSpin}
          disabled={isSpinning}
          loading={isSpinning}
          size="large"
          variant="primary"
        >
          {isSpinning ? 'Spinning...' : '🎡 SPIN THE WHEEL'}
        </SpinButton>
        
        <p style={{ color: '#7F8C8D', fontSize: '14px' }}>
          {isSpinning ? 'Good luck! 🍀' : 'Click the wheel or button to spin!'}
        </p>
      </ControlsSection>

      <InfoSection>
        <InfoTitle>📋 Terms & Conditions</InfoTitle>
        <InfoList>
          <InfoItem>One code can be used against one bill</InfoItem>
          <InfoItem>Only one bill can be generated per table</InfoItem>
          <InfoItem>Offer applicable on the total bill</InfoItem>
          <InfoItem>Code valid for 7 days after issuance</InfoItem>
          <InfoItem>Code will only be accepted once on one email</InfoItem>
          <InfoItem>Breakfast item code applicable only at breakfast time</InfoItem>
          <InfoItem>Maximum 1 spin allowed per day</InfoItem>
        </InfoList>
      </InfoSection>

      <AnimatePresence>
        {showWinModal && wonCoupon && (
          <WinModal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWinModal}
          >
            <WinContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <WinTitle>🎉 Congratulations!</WinTitle>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                {wonCoupon.selectedOffer?.icon || '🎁'}
              </div>
              <WinDescription>
                You've won: <strong>{wonCoupon.offerDescription}</strong>
              </WinDescription>
              <CouponCode>
                {wonCoupon.code}
              </CouponCode>
              <p style={{ fontSize: '14px', color: '#7F8C8D', marginBottom: '20px' }}>
                Show this code at CASPIAN to redeem your offer. Valid for 7 days.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Button variant="primary" onClick={viewMyCoupons}>
                  View My Coupons
                </Button>
                <Button variant="outline" onClick={closeWinModal}>
                  Spin Again
                </Button>
              </div>
            </WinContent>
          </WinModal>
        )}
      </AnimatePresence>
    </SpinContainer>
  );
};

export default SpinWheel;
