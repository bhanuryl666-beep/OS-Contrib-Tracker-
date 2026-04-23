#!/bin/bash

# Open Source Contribution Tracker - Deployment Script
# This script helps prepare your app for deployment

echo "🚀 Open Source Contribution Tracker - Deployment Preparation"
echo "=========================================================="

# Check if required files exist
echo "📋 Checking required files..."

if [ ! -f "backend/.env.production" ]; then
    echo "❌ backend/.env.production not found!"
    echo "   Please copy backend/.env.example to backend/.env.production and fill in your values"
    exit 1
fi

if [ ! -f "frontend/.env.production" ]; then
    echo "ℹ️  Creating frontend/.env.production..."
    echo "VITE_API_URL=https://your-backend-domain.com" > frontend/.env.production
    echo "✅ Created frontend/.env.production (update VITE_API_URL with your backend URL)"
fi

echo "✅ File checks complete"

# Build frontend for production
echo "🔨 Building frontend for production..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
cd ..
echo "✅ Frontend built successfully"

# Check backend dependencies
echo "📦 Checking backend dependencies..."
cd backend
npm install --production
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed!"
    exit 1
fi
cd ..
echo "✅ Backend dependencies installed"

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set up your deployment platform (Render, Vercel, Railway, etc.)"
echo "2. Configure environment variables from backend/.env.production"
echo "3. Set VITE_API_URL in frontend/.env.production to your backend URL"
echo "4. Deploy both frontend and backend"
echo "5. Update GitHub OAuth callback URL to production backend URL"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"