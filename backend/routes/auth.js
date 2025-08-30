const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { generateOTP, sendSignupOTP, sendPasswordResetLinkEmail, sendWelcomeEmail } = require('../services/emailService');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  });
};

// In-memory storage for temporary signup data (in production, use Redis or similar)
const tempSignupData = new Map();

// Clean up expired temporary data every 10 minutes
setInterval(() => {
  const now = new Date();
  for (const [key, data] of tempSignupData.entries()) {
    if (data.otpExpires < now) {
      tempSignupData.delete(key);
    }
  }
}, 10 * 60 * 1000); // 10 minutes

// @desc    Send OTP for email verification during signup
// @route   POST /api/auth/send-signup-otp
// @access  Public
const sendSignupOTPHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store temporary signup data in memory (not in database yet)
    const tempId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    tempSignupData.set(tempId, {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      otp,
      otpExpires
    });

    // Send OTP email
    const emailResult = await sendSignupOTP(email, name, otp);
    
    if (!emailResult.success) {
      // Remove temporary data if email fails
      tempSignupData.delete(tempId);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email. Please check your inbox.',
      tempUserId: tempId
    });
  } catch (error) {
    console.error('Send signup OTP error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during OTP generation'
    });
  }
};

// @desc    Verify OTP and complete signup
// @route   POST /api/auth/verify-signup-otp
// @access  Public
const verifySignupOTP = async (req, res) => {
  try {
    const { tempUserId, otp } = req.body;

    if (!tempUserId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID and OTP'
      });
    }

    // Get temporary signup data from memory
    const tempData = tempSignupData.get(tempUserId);
    if (!tempData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification request or OTP expired'
      });
    }

    // Check if OTP is expired
    if (tempData.otpExpires < new Date()) {
      tempSignupData.delete(tempUserId);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please try signup again.'
      });
    }

    // Check if OTP matches
    if (tempData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Check if user already exists (double-check in case someone else registered with same email)
    const existingUser = await User.findOne({ email: tempData.email });
    if (existingUser) {
      tempSignupData.delete(tempUserId);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create the user in database only after successful OTP verification
    const user = await User.create({
      name: tempData.name,
      email: tempData.email,
      password: tempData.password,
      isEmailVerified: true
    });

    // Clean up temporary data
    tempSignupData.delete(tempUserId);

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Email verified successfully! Account created.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        coupons: user.coupons
      }
    });
  } catch (error) {
    console.error('Verify signup OTP error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('coupons');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        coupons: user.coupons
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Send password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const sendPasswordResetLink = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // Generate unique reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with reset token
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send reset link email
    const emailResult = await sendPasswordResetLinkEmail(email, user.name, resetUrl);
    
    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email. Please check your inbox.',
      resetUserId: user._id
    });
  } catch (error) {
    console.error('Send password reset link error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reset token and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user by reset token
    const user = await User.findOne({ 
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new one.'
      });
    }

    // Update password and clear reset tokens
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'coupons',
      match: { isActive: true }
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        coupons: user.coupons,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Routes
router.post('/send-signup-otp', sendSignupOTPHandler);
router.post('/verify-signup-otp', verifySignupOTP);
router.post('/login', login);
router.post('/forgot-password', sendPasswordResetLink);
router.post('/reset-password/:token', resetPassword);
router.get('/profile', protect, getProfile);

module.exports = router;
