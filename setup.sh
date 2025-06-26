#!/bin/bash

echo "🚀 Setting up Road Safety Learning Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "📦 Starting services with Docker Compose..."
docker-compose up -d postgres redis

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🔧 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

echo "🗄️ Running database migrations..."
alembic upgrade head

echo "🌱 Seeding database with initial data..."
python seed_data.py

echo "🔧 Setting up frontend..."
cd ../frontend

echo "📥 Installing Node.js dependencies..."
npm install

echo "✅ Setup complete!"
echo ""
echo "🎉 Road Safety Learning Platform is ready!"
echo ""
echo "To start the development servers:"
echo "  Backend:  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Or use Docker Compose for everything:"
echo "  docker-compose up"
echo ""
echo "🌐 Access the application:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs" 