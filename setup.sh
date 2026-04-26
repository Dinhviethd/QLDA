#!/bin/bash

# Setup script for AI Virtual Assistant
# This script sets up the project for development

set -e

echo "🚀 Setting up AI Virtual Assistant for eOffice"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Backend setup
echo ""
echo "📦 Setting up backend..."
cd backend
npm install
echo "✅ Backend dependencies installed"

# Copy .env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Created .env file. Please update with your credentials!"
fi

cd ..

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"

# Copy .env file
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Created .env file. Please update with your credentials!"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env files in backend/ and frontend/ folders"
echo "2. Set up PostgreSQL database"
echo "3. Run migrations: npm run migrate"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend: cd frontend && npm start"
echo ""
echo "Happy coding! 🎉"
