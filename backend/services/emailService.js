const nodemailer = require('nodemailer');

// Configure nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email for signup verification
const sendSignupOTP = async (email, name, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"CASPIAN Restaurant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - CASPIAN Restaurant',
      text: `
Hello ${name},

Welcome to CASPIAN Restaurant!

Your email verification code is: ${otp}

This code will expire in 10 minutes. Please enter this code to complete your account registration.

If you didn't request this verification, please ignore this email.

Best regards,
CASPIAN Restaurant Team
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Signup OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending signup OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset link email
const sendPasswordResetLinkEmail = async (email, name, resetUrl) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"CASPIAN Restaurant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Link - CASPIAN Restaurant',
      text: `
Hello ${name},

You requested to reset your password for your CASPIAN Restaurant account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 15 minutes. Please click the link to reset your password.

If you didn't request this password reset, please ignore this email or contact our support team.

Best regards,
CASPIAN Restaurant Team
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset link email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset link email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after successful signup
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"CASPIAN Restaurant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to CASPIAN Restaurant!',
      text: `
Hello ${name},

Welcome to CASPIAN Restaurant! 🎉

Your account has been successfully created and verified. You can now enjoy our delicious food and exciting offers!

Features you can explore:
- Spin the wheel to get amazing offers
- View and redeem your coupons
- Enjoy our special discounts and deals

Visit us at CASPIAN Restaurant for the best dining experience!

Best regards,
CASPIAN Restaurant Team
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Test email configuration
const testEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    const result = await transporter.verify();
    
    if (result) {
      console.log('✅ Email configuration is valid');
      return { success: true, message: 'Email configuration is valid' };
    }
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendSignupOTP,
  sendPasswordResetLinkEmail,
  sendWelcomeEmail,
  testEmailConfig
};
