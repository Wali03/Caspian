# 🍴 CASPIAN Restaurant - MERN Stack Application

A full-stack web application for CASPIAN restaurant featuring user authentication, spinning wheel for offers, and coupon management with Google Sheets integration.

## 🚀 Features

- **User Authentication**: Email-based signup/login with OTP verification
- **Spinning Wheel**: Interactive wheel to win restaurant offers
- **Coupon Management**: Track and redeem coupons
- **Google Sheets Integration**: Automatic coupon tracking for restaurant managers
- **Password Reset**: Secure email-based password reset
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Nodemailer** for email services
- **Google Sheets API** for coupon management

### Frontend
- **React.js** with hooks
- **Styled-components** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls

## 📁 Project Structure

```
caspian/
├── backend/                 # Node.js/Express server
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic & external services
│   └── server.js          # Server entry point
├── frontend/              # React application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── App.js         # Main app component
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Gmail account for email services
- Google Sheets API credentials (optional)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   # Create .env file in backend directory
   PORT=5002
   MONGODB_URI="your_mongodb_connection_string"
   JWT_SECRET="your_jwt_secret"
   NODE_ENV=development
   
   # Email Configuration (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Frontend URL for password reset links
   FRONTEND_URL=http://localhost:3000
   
   # Google Sheets API (Optional)
   GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
   GOOGLE_SHEETS_SHEET_ID=your_google_sheet_id
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Email Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in EMAIL_PASS

### Google Sheets Setup (Optional)
1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create service account credentials
4. Share your Google Sheet with the service account email

## 📱 Features Overview

### Authentication
- Email-based signup with OTP verification
- Secure login with JWT tokens
- Password reset via email links
- Protected routes

### Spinning Wheel
- Interactive wheel with 8 different offers
- Daily spin limit (1 spin per day)
- Synchronized frontend/backend offer generation
- Real-time coupon creation

### Coupon Management
- View all earned coupons
- Redeem coupons at restaurant
- Automatic Google Sheets integration
- Coupon status tracking

### Admin Features
- Google Sheets dashboard for restaurant managers
- Real-time coupon tracking
- User and offer analytics

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Email verification for new accounts
- Secure password reset flow
- CORS configuration
- Input validation and sanitization

## 🎨 UI/UX Features

- Responsive design for all devices
- Smooth animations with Framer Motion
- Glass morphism design elements
- Restaurant-themed color palette
- Loading states and error handling

## 📊 API Endpoints

### Authentication
- `POST /api/auth/send-signup-otp` - Send signup OTP
- `POST /api/auth/verify-signup-otp` - Verify signup OTP
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Send password reset link
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/profile` - Get user profile

### Coupons
- `POST /api/coupons/spin` - Spin the wheel
- `GET /api/coupons/my-coupons` - Get user coupons
- `PUT /api/coupons/:couponId/use` - Use a coupon
- `GET /api/coupons/verify/:code` - Verify coupon (for staff)
- `GET /api/coupons/sheets-url` - Get Google Sheets URL

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables on your hosting platform
2. Deploy to platforms like Heroku, Railway, or DigitalOcean
3. Update FRONTEND_URL to your production frontend URL

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or GitHub Pages
3. Update API base URL to your production backend URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions, please contact the development team.

---

**CASPIAN Restaurant** - Bringing delicious food and amazing offers to your table! 🍽️✨
