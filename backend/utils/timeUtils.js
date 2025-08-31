// Time utility functions for IST conversion (GMT + 5:30)

/**
 * Convert GMT date to IST (GMT + 5:30)
 * Note: Not needed if server is already in IST timezone
 * @param {Date} date - Date to return as-is
 * @returns {Date} Date without conversion
 */
const convertGMTtoIST = (date) => {
  // Return date as-is since server is already in IST
  return date;
};

/**
 * Get current date in IST
 * @returns {Date} Current date (already in IST)
 */
const getCurrentIST = () => {
  // Return current date as-is since server is already in IST
  return new Date();
};

/**
 * Format date to IST string
 * @param {Date} date - Date to format
 * @returns {string} Formatted IST date string
 */
const formatISTDate = (date) => {
  if (!date) return '';
  
  // Format date as-is since server is already in IST
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Add 7 days to current date for coupon expiry
 * @returns {Date} Expiry date (7 days from now)
 */
const getCouponExpiryDate = () => {
  const now = new Date(); // Use current GMT time, not IST
  const expiryDate = new Date(now);
  expiryDate.setDate(expiryDate.getDate() + 7);
  return expiryDate;
};

module.exports = {
  convertGMTtoIST,
  getCurrentIST,
  formatISTDate,
  getCouponExpiryDate
};
