const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/caspian';
    
    console.log('Attempting to connect to MongoDB...');
    console.log('URI (hidden for security):', mongoURI.replace(/\/\/.*@/, '//***:***@'));
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Ready State: ${conn.connection.readyState}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    // More detailed error information
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Connection Tips:');
      console.log('1. If using MongoDB Atlas, check your connection string');
      console.log('2. Make sure your IP is whitelisted in Atlas');
      console.log('3. Check your username/password');
      console.log('4. If using local MongoDB, make sure it\'s running: brew services start mongodb-community');
    }
    
    // Don't exit the process, continue without database for now
    console.log('⚠️  Continuing without database connection...');
    console.log('🔧 Please set up your MongoDB Atlas connection string in .env file');
  }
};

module.exports = connectDB;
