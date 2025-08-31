import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';

const CouponsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 16px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 36px;
  }
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: ${props => props.theme.colors.textLight};
  margin-bottom: 40px;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Tab = styled.button.withConfig({
  shouldForwardProp: (prop) => !['active'].includes(prop)
})`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  background: none;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textLight};
  border-bottom: 3px solid ${props => props.active ? props.theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const CouponsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const CouponCard = styled(motion.div).withConfig({
  shouldForwardProp: (prop) => !['isExpired', 'isUsed'].includes(prop)
})`
  background: ${props => props.theme.colors.surface};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${props => props.theme.shadows.card};
  border: 1px solid ${props => props.theme.colors.border};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.isExpired ? 
      props.theme.colors.error : 
      props.isUsed ? 
        props.theme.colors.textLight : 
        `linear-gradient(90deg, ${props.theme.colors.primary}, ${props.theme.colors.secondary})`
    };
  }

  ${props => (props.isExpired || props.isUsed) && css`
    opacity: 0.7;
    filter: grayscale(30%);
  `}
`;

const CouponHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const CouponCode = styled.div.withConfig({
  shouldForwardProp: (prop) => !['isExpired', 'isUsed'].includes(prop)
})`
  background: ${props => props.isExpired ? 
    props.theme.colors.error : 
    props.isUsed ? 
      props.theme.colors.textLight : 
      `linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.secondary})`
  };
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
`;

const CouponStatus = styled.span.withConfig({
  shouldForwardProp: (prop) => !['isExpired', 'isUsed'].includes(prop)
})`
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => {
    if (props.isExpired) return props.theme.colors.error;
    if (props.isUsed) return props.theme.colors.textLight;
    return props.theme.colors.success;
  }};
  color: white;
  text-transform: uppercase;
`;

const CouponDescription = styled.p`
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  margin-bottom: 16px;
  line-height: 1.5;
`;

const CouponDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${props => props.theme.colors.textLight};
`;

const CouponActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.textLight};
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 12px;
  color: ${props => props.theme.colors.text};
`;

const EmptyDescription = styled.p`
  font-size: 16px;
  margin-bottom: 30px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: ${props => props.theme.colors.textLight};
`;

const ConfirmModal = styled(motion.div)`
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

const ConfirmContent = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: ${props => props.theme.shadows.modal};
`;

const MyCoupons = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [coupons, setCoupons] = useState({ activeCoupons: [], usedExpiredCoupons: [] });
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ show: false, coupon: null });
  const { getMyCoupons, redeemCoupon } = useAuth();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const result = await getMyCoupons();
      if (result.success) {
        setCoupons(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCoupon = (coupon) => {
    setConfirmModal({ show: true, coupon });
  };

  const confirmUseCoupon = async () => {
    if (!confirmModal.coupon) return;

    try {
      const result = await redeemCoupon(confirmModal.coupon._id);
      if (result.success) {
        await fetchCoupons(); // Refresh coupons
      }
    } catch (error) {
      console.error('Failed to use coupon:', error);
    } finally {
      setConfirmModal({ show: false, coupon: null });
    }
  };

  const cancelUseCoupon = () => {
    setConfirmModal({ show: false, coupon: null });
  };

  const isExpired = (coupon) => {
    return new Date() > new Date(coupon.expiresAt);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // No need to convert to IST since backend already stores IST times
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  const getStatusInfo = (coupon) => {
    if (coupon.isUsed) {
      return { text: 'Used', isUsed: true, isExpired: false };
    }
    if (isExpired(coupon)) {
      return { text: 'Expired', isUsed: false, isExpired: true };
    }
    return { text: 'Active', isUsed: false, isExpired: false };
  };

  const displayCoupons = activeTab === 'active' ? coupons.activeCoupons : coupons.usedExpiredCoupons;

  if (loading) {
    return (
      <CouponsContainer>
        <LoadingSpinner>Loading your coupons... 🎫</LoadingSpinner>
      </CouponsContainer>
    );
  }

  return (
    <CouponsContainer>
      <Header>
        <Title>🎫 My Coupons</Title>
        <Subtitle>
          Manage and redeem your earned coupons from CASPIAN spinning wheel
        </Subtitle>
      </Header>

      <TabContainer>
        <Tab 
          active={activeTab === 'active'} 
          onClick={() => setActiveTab('active')}
        >
          Active Coupons ({coupons.activeCoupons.length})
        </Tab>
        <Tab 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')}
        >
          History ({coupons.usedExpiredCoupons.length})
        </Tab>
      </TabContainer>

      {displayCoupons.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            {activeTab === 'active' ? '🎡' : '📝'}
          </EmptyIcon>
          <EmptyTitle>
            {activeTab === 'active' ? 'No Active Coupons' : 'No Coupon History'}
          </EmptyTitle>
          <EmptyDescription>
            {activeTab === 'active' 
              ? 'You don\'t have any active coupons yet. Spin the wheel to win amazing offers!'
              : 'You haven\'t used any coupons yet. Your used and expired coupons will appear here.'
            }
          </EmptyDescription>
          {activeTab === 'active' && (
            <Link to="/spin">
              <Button variant="primary" size="large">
                🎡 Spin the Wheel
              </Button>
            </Link>
          )}
        </EmptyState>
      ) : (
        <CouponsGrid>
          <AnimatePresence>
            {displayCoupons.map((coupon, index) => {
              const status = getStatusInfo(coupon);
              return (
                <CouponCard
                  key={coupon._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  isUsed={status.isUsed}
                  isExpired={status.isExpired}
                  whileHover={{ scale: 1.02 }}
                >
                  <CouponHeader>
                    <CouponCode 
                      isUsed={status.isUsed} 
                      isExpired={status.isExpired}
                    >
                      {coupon.code}
                    </CouponCode>
                    <CouponStatus 
                      isUsed={status.isUsed} 
                      isExpired={status.isExpired}
                    >
                      {status.text}
                    </CouponStatus>
                  </CouponHeader>

                  <CouponDescription>
                    {coupon.offerDescription}
                  </CouponDescription>

                  <CouponDetails>
                    <DetailItem>
                      📅 <strong>Created:</strong> {formatDate(coupon.createdAt)}
                    </DetailItem>
                    <DetailItem>
                      ⏰ <strong>Expires:</strong> {formatDate(coupon.expiresAt)}
                    </DetailItem>
                    {coupon.isUsed && coupon.usedAt && (
                      <DetailItem>
                        ✅ <strong>Used:</strong> {formatDate(coupon.usedAt)}
                      </DetailItem>
                    )}
                    {coupon.conditions?.minBillAmount > 0 && (
                      <DetailItem>
                        💰 <strong>Min Bill:</strong> ₹{coupon.conditions.minBillAmount}
                      </DetailItem>
                    )}
                    {coupon.conditions?.timeRestriction && coupon.conditions.timeRestriction !== 'ALL_DAY' && (
                      <DetailItem>
                        🕐 <strong>Time:</strong> {coupon.conditions.timeRestriction}
                      </DetailItem>
                    )}
                  </CouponDetails>

                  {activeTab === 'active' && !status.isUsed && !status.isExpired && (
                    <CouponActions>
                      <Button 
                        variant="primary" 
                        size="small"
                        fullWidth
                        onClick={() => handleUseCoupon(coupon)}
                      >
                        🎯 Use Coupon
                      </Button>
                    </CouponActions>
                  )}
                </CouponCard>
              );
            })}
          </AnimatePresence>
        </CouponsGrid>
      )}

      {displayCoupons.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/spin">
            <Button variant="secondary" size="large">
              🎡 Spin for More Coupons
            </Button>
          </Link>
        </div>
      )}

      <AnimatePresence>
        {confirmModal.show && (
          <ConfirmModal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelUseCoupon}
          >
            <ConfirmContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: '16px', color: '#2B5797' }}>
                🎯 Use Coupon?
              </h3>
              <p style={{ marginBottom: '20px', color: '#7F8C8D' }}>
                Are you sure you want to use this coupon? This action cannot be undone.
              </p>
              <div style={{ fontWeight: 'bold', marginBottom: '20px' }}>
                {confirmModal.coupon?.code}
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Button variant="primary" onClick={confirmUseCoupon}>
                  Yes, Use It
                </Button>
                <Button variant="outline" onClick={cancelUseCoupon}>
                  Cancel
                </Button>
              </div>
            </ConfirmContent>
          </ConfirmModal>
        )}
      </AnimatePresence>
    </CouponsContainer>
  );
};

export default MyCoupons;
