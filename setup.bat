@echo off
echo 🚀 Setting up Road Safety Learning Platform...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo 📦 Starting services with Docker Compose...
docker-compose up -d postgres redis

echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo 🔧 Setting up backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 🐍 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

echo 📥 Installing Python dependencies...
pip install -r requirements.txt
pip install alembic

echo 🗄️ Running database migrations...
alembic upgrade head

echo 🌱 Seeding database with initial data...
python seed_data.py

echo 🔧 Setting up frontend...
cd ..\frontend

echo 📥 Installing Node.js dependencies...
npm install

echo ✅ Setup complete!
echo.
echo 🎉 Road Safety Learning Platform is ready!
echo.
echo To start the development servers:
echo   Backend:  cd backend ^&^& venv\Scripts\activate ^&^& uvicorn app.main:app --reload
echo   Frontend: cd frontend ^&^& npm run dev
echo.
echo Or use Docker Compose for everything:
echo   docker-compose up
echo.
echo 🌐 Access the application:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs

pause 