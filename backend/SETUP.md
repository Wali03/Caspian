# 🔧 CASPIAN Backend Setup Guide

## Environment Variables Setup

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5002
NODE_ENV=development

# Database
MONGODB_URI="your_mongodb_connection_string"

# Authentication
JWT_SECRET="your_jwt_secret_key"

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL for password reset links
FRONTEND_URL=http://localhost:3000

# Google Sheets API (Optional - for restaurant manager integration)
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
GOOGLE_SHEETS_SHEET_ID=your_google_sheet_id
```

## Setup Instructions

### 1. MongoDB Setup
- Create a MongoDB Atlas account
- Create a new cluster
- Get your connection string
- Replace `your_mongodb_connection_string` with your actual connection string

### 2. Email Setup
- Enable 2-factor authentication on your Gmail account
- Generate an App Password
- Use the App Password in `EMAIL_PASS`

### 3. JWT Secret
- Generate a random string for `JWT_SECRET`
- Example: `JWT_SECRET="my-super-secret-jwt-key-2024"`

### 4. Google Sheets (Optional)
- Create a Google Cloud Project
- Enable Google Sheets API
- Create service account credentials
- Share your Google Sheet with the service account email

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with your configuration

3. Start the server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5002`
