// Time utility functions for IST conversion (GMT + 5:30)

/**
 * Convert GMT date to IST (GMT + 5:30)
 * @param {Date} gmtDate - Date in GMT
 * @returns {Date} Date in IST
 */
const convertGMTtoIST = (gmtDate) => {
  if (!gmtDate) return gmtDate;
  
  const istDate = new Date(gmtDate);
  istDate.setHours(istDate.getHours() + 5);
  istDate.setMinutes(istDate.getMinutes() + 30);
  
  return istDate;
};

/**
 * Get current date in IST
 * @returns {Date} Current date in IST
 */
const getCurrentIST = () => {
  const now = new Date();
  return convertGMTtoIST(now);
};

/**
 * Format date to IST string
 * @param {Date} date - Date to format
 * @returns {string} Formatted IST date string
 */
const formatISTDate = (date) => {
  if (!date) return '';
  
  const istDate = convertGMTtoIST(date);
  return istDate.toLocaleString('en-IN', {
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
