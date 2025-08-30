const mongoose = require('mongoose');

// Generate random alphanumeric coupon code
function generateCouponCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'CAS'; // Start with restaurant prefix
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    minlength: 8,
    maxlength: 12
  },
  offerType: {
    type: String,
    required: true,
    enum: [
      'FREE_BEVERAGE_BREAKFAST',
      'NONVEG_10_PERCENT_OFF',
      'TANDOOR_10_PERCENT_OFF',
      'BOWL_FREE_ADDON',
      'CHINESE_HONEY_CHILI_POTATO',
      'CHINESE_MEAL_HONEY_CHILI',
      'FLAT_20_PERCENT_OFF_2000',
      'FREE_MOCKTAIL_BIRYANI'
    ]
  },
  offerDescription: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  conditions: {
    minBillAmount: {
      type: Number,
      default: 0
    },
    timeRestriction: {
      type: String,
      enum: ['BREAKFAST', 'EVENING', 'ALL_DAY'],
      default: 'ALL_DAY'
    },
    applicableSection: {
      type: String,
      enum: ['BREAKFAST', 'NONVEG', 'TANDOOR', 'BOWL', 'CHINESE', 'ALL'],
      default: 'ALL'
    }
  }
}, {
  timestamps: true
});

// Generate unique coupon code
couponSchema.pre('save', async function(next) {
  console.log('🎫 Pre-save middleware triggered, existing code:', this.code);
  if (!this.code) {
    this.code = generateCouponCode();
    console.log('✅ Generated new coupon code:', this.code);
  }
  next();
});

// Check if coupon is expired
couponSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Check if coupon is valid for use
couponSchema.methods.isValidForUse = function() {
  return !this.isUsed && !this.isExpired() && this.isActive;
};

module.exports = mongoose.model('Coupon', couponSchema);
