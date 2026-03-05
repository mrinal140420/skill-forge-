#!/bin/bash

# SkillForge Portal - Quick Start Script

echo "🚀 SkillForge Portal - Quick Start"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.9+"
    exit 1
fi

echo "✓ Node.js version: $(node -v)"
echo "✓ Python version: $(python --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
npm install
echo "✓ Backend dependencies installed"
echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
cd ../frontend
npm install
echo "✓ Frontend dependencies installed"
echo ""

# Setup ML Service
echo "📦 Setting up ML Service..."
cd ../ml-service

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    python -m venv venv
    venv\Scripts\activate
else
    # macOS/Linux
    python -m venv venv
    source venv/bin/activate
fi

pip install -r requirements.txt
echo "✓ ML Service dependencies installed"
echo ""

echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Create .env files in backend/ and ml-service/ (see .env.example)"
echo "2. Set up MongoDB Atlas and add connection string to backend/.env"
echo "3. Run services:"
echo "   - Backend:    cd backend && npm run dev"
echo "   - ML Service: cd ml-service && python -m uvicorn main:app --reload"
echo "   - Frontend:   cd frontend && npm run dev"
echo ""
echo "4. Seed the database: cd backend && npm run seed"
echo "5. Access the portal at http://localhost:5173"
echo ""
