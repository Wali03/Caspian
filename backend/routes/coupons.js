const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/auth');
const googleSheets = require('../services/googleSheets');

const router = express.Router();

// Define offer types and their descriptions
const OFFERS = [
  {
    type: 'FREE_BEVERAGE_BREAKFAST',
    description: 'Order anything from our breakfast section and get a hot beverage free of your choice.',
    conditions: {
      applicableSection: 'BREAKFAST',
      timeRestriction: 'BREAKFAST'
    }
  },
  {
    type: 'NONVEG_10_PERCENT_OFF',
    description: 'Order any item from our non-veg section and get a 10% off.',
    conditions: {
      applicableSection: 'NONVEG'
    }
  },
  {
    type: 'TANDOOR_10_PERCENT_OFF',
    description: 'Flat 10% off on any one item from our tandoor section. (Active in evening).',
    conditions: {
      applicableSection: 'TANDOOR',
      timeRestriction: 'EVENING'
    }
  },
  {
    type: 'BOWL_FREE_ADDON',
    description: 'Order from our \'Bowl\' section and get average add on the house.',
    conditions: {
      applicableSection: 'BOWL'
    }
  },
  {
    type: 'CHINESE_HONEY_CHILI_POTATO',
    description: 'Order one full course Chinese meal and get honey chili potato from us.',
    conditions: {
      applicableSection: 'CHINESE'
    }
  },
  {
    type: 'CHINESE_MEAL_HONEY_CHILI',
    description: 'Have a full course Chinese meal and get honey chili potato from us.',
    conditions: {
      applicableSection: 'CHINESE'
    }
  },
  {
    type: 'FLAT_20_PERCENT_OFF_2000',
    description: 'Wow! A flat 20% off on your total bill. Minimum bill value should be Rupees 2000.',
    conditions: {
      minBillAmount: 2000
    }
  },
  {
    type: 'FREE_MOCKTAIL_BIRYANI',
    description: 'A mocktail free to quench your thirst after having our delicious Hyderabad Biryani!',
    conditions: {
      applicableSection: 'ALL'
    }
  }
];

// @desc    Spin the wheel and generate a coupon
// @route   POST /api/coupons/spin
// @access  Private
const spinWheel = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🎡 Spin wheel request from user:', userId);

    // Check if database is connected
    if (!mongoose.connection.readyState) {
      console.error('❌ Database not connected');
      return res.status(503).json({
        success: false,
        message: 'Database connection not available. Please check MongoDB connection.',
        error: 'SERVICE_UNAVAILABLE'
      });
    }

    console.log('✅ Database connected, checking daily limits...');

    // Check if user has spun recently (optional: implement daily limit)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySpins = await Coupon.countDocuments({
      user: userId,
      createdAt: { $gte: today }
    });

    console.log('📊 Today\'s spins for user:', todaySpins);

    // Limit to 1 spin per day
    if (todaySpins >= 1) {
      return res.status(400).json({
        success: false,
        message: 'You have already spun the wheel today. Come back tomorrow for another chance!'
      });
    }

    // Get the selected offer index from frontend (or generate random if not provided)
    const selectedOfferIndex = req.body.selectedOfferIndex !== undefined 
      ? req.body.selectedOfferIndex 
      : Math.floor(Math.random() * OFFERS.length);
    
    const randomOffer = OFFERS[selectedOfferIndex];
    console.log('🎲 Selected offer index:', selectedOfferIndex, 'offer:', randomOffer.type);

    // Generate unique coupon code
    function generateCouponCode() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'CAS'; // Start with restaurant prefix
      for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    // Create coupon
    console.log('💾 Creating coupon...');
    const couponCode = generateCouponCode();
    console.log('🎫 Generated coupon code:', couponCode);
    
    const coupon = new Coupon({
      code: couponCode, // Explicitly set the code
      offerType: randomOffer.type,
      offerDescription: randomOffer.description,
      user: userId,
      conditions: randomOffer.conditions
    });
    await coupon.save();
    console.log('✅ Coupon created with code:', coupon.code);

    // Add coupon to user's coupons array
    console.log('👤 Updating user coupons...');
    await User.findByIdAndUpdate(userId, {
      $push: { coupons: coupon._id }
    });

    // Update Google Sheets
    console.log('📊 Updating Google Sheets...');
    try {
      await googleSheets.addCoupon(coupon, req.user);
    } catch (sheetsError) {
      console.warn('⚠️ Google Sheets update failed (non-critical):', sheetsError.message);
    }

    // Populate user data for response
    console.log('📝 Populating user data...');
    await coupon.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Congratulations! You won a coupon!',
      coupon: {
        id: coupon._id,
        code: coupon.code,
        offerType: coupon.offerType,
        offerDescription: coupon.offerDescription,
        expiresAt: coupon.expiresAt,
        conditions: coupon.conditions,
        isUsed: coupon.isUsed
      }
    });
  } catch (error) {
    console.error('❌ Spin wheel error:', error);
    console.error('Error stack:', error.stack);
    
    // More specific error handling
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ')
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while spinning the wheel',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user's coupons
// @route   GET /api/coupons/my-coupons
// @access  Private
const getMyCoupons = async (req, res) => {
  try {
    const userId = req.user.id;

    const coupons = await Coupon.find({
      user: userId,
      isActive: true
    }).sort({ createdAt: -1 });

    // Separate active and used/expired coupons
    const activeCoupons = coupons.filter(coupon => coupon.isValidForUse());
    const usedExpiredCoupons = coupons.filter(coupon => !coupon.isValidForUse());

    res.json({
      success: true,
      data: {
        activeCoupons,
        usedExpiredCoupons,
        totalCoupons: coupons.length
      }
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching coupons'
    });
  }
};

// @desc    Use/Avail a coupon
// @route   PUT /api/coupons/:couponId/use
// @access  Private
const useCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const userId = req.user.id;

    const coupon = await Coupon.findOne({
      _id: couponId,
      user: userId,
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    if (!coupon.isValidForUse()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is already used or expired'
      });
    }

    // Mark coupon as used
    coupon.isUsed = true;
    coupon.usedAt = new Date();
    await coupon.save();

    // Update Google Sheets
    try {
      await googleSheets.updateCouponStatus(coupon.code, 'Used');
    } catch (sheetsError) {
      console.warn('⚠️ Google Sheets update failed (non-critical):', sheetsError.message);
    }

    res.json({
      success: true,
      message: 'Coupon used successfully!',
      coupon: {
        id: coupon._id,
        code: coupon.code,
        offerDescription: coupon.offerDescription,
        usedAt: coupon.usedAt
      }
    });
  } catch (error) {
    console.error('Use coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while using coupon'
    });
  }
};

// @desc    Get coupon details by code (for restaurant staff)
// @route   GET /api/coupons/verify/:code
// @access  Public (for restaurant staff use)
const verifyCoupon = async (req, res) => {
  try {
    const { code } = req.params;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true
    }).populate('user', 'name email');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    if (!coupon.isValidForUse()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is already used or expired'
      });
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        offerDescription: coupon.offerDescription,
        user: coupon.user,
        expiresAt: coupon.expiresAt,
        conditions: coupon.conditions,
        createdAt: coupon.createdAt
      }
    });
  } catch (error) {
    console.error('Verify coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying coupon'
    });
  }
};

// @desc    Get Google Sheets URL for restaurant managers
// @route   GET /api/coupons/sheets-url
// @access  Public (for restaurant staff use)
const getSheetsUrl = async (req, res) => {
  try {
    const url = googleSheets.getSheetUrl();
    if (url) {
      res.json({
        success: true,
        url,
        message: 'Google Sheets URL for coupon management'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Google Sheets not configured. Please set GOOGLE_SHEETS_ID in environment variables.'
      });
    }
  } catch (error) {
    console.error('Get sheets URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting Google Sheets URL'
    });
  }
};

// Routes
router.post('/spin', protect, spinWheel);
router.get('/my-coupons', protect, getMyCoupons);
router.put('/:couponId/use', protect, useCoupon);
router.get('/verify/:code', verifyCoupon);
router.get('/sheets-url', getSheetsUrl);

module.exports = router;
