#!/bin/bash

echo "🎡 Setting up CASPIAN Restaurant Spinning Wheel Application..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

# Check if MongoDB is running (optional check)
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB is not found. Please make sure MongoDB is installed and running."
    echo "   You can also use MongoDB Atlas (cloud) by updating the MONGODB_URI in backend/.env"
fi

echo "📦 Installing dependencies..."

# Install root dependencies
npm install

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd ../frontend
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   1. Make sure MongoDB is running (mongod)"
echo "   2. Run: npm run dev"
echo ""
echo "📊 Access points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   Health:   http://localhost:5000/api/health"
echo ""
echo "📖 Read README.md for detailed instructions and features."
echo ""
echo "🎡 Happy spinning! ✨"
