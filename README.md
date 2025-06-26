# 🛣️ Road Safety Learning Platform

A multilingual web platform that teaches road safety rules and regulations using interactive lessons, quizzes, and real-time voice features in **English**, **French**, and **Kinyarwanda**.

## 🌍 Features

- 📚 **Multilingual Lessons** with voice support (TTS)
- ❓ **Interactive Quizzes** with real-time feedback via WebSockets
- 🔊 **Text-to-Speech** using Coqui TTS (Kinyarwanda, French, English)
- 💬 **Live Interaction** (quiz responses and real-time scoring)
- 🧠 **Modular and Scalable** architecture
- 🗄️ **PostgreSQL** with Alembic migrations
- 🧩 **React + TypeScript** frontend with WebSocket support

## 🧱 Tech Stack

### Frontend
- **React 19** + **Vite** + **TypeScript**
- **React Router v6** for navigation
- **WebSocket API** for real-time features
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Zustand** for state management
- **Axios** for API calls

### Backend
- **FastAPI** for REST API
- **PostgreSQL** for database
- **SQLAlchemy** + **Alembic** for ORM and migrations
- **Coqui TTS** for text-to-speech
- **Pydantic** for data validation
- **WebSocket** support for real-time features
- **Redis** for caching (optional)

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)

### Option 1: Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd road-safety-app
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Local Development

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/roadsafety
   REDIS_URL=redis://localhost:6379
   SECRET_KEY=your-secret-key-here
   ```

5. **Start PostgreSQL and Redis**
   ```bash
   docker-compose up postgres redis -d
   ```

6. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

7. **Seed the database**
   ```bash
   python seed_data.py
   ```

8. **Start the backend server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173

## 📁 Project Structure

```
road-safety-app/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/             # API Routes (REST & WebSocket)
│   │   │   ├── lessons.py   # Lesson endpoints
│   │   │   ├── quiz.py      # Quiz endpoints
│   │   │   ├── tts.py       # TTS endpoints
│   │   │   └── websocket.py # WebSocket handlers
│   │   ├── core/            # Core configuration
│   │   │   ├── config.py    # App settings
│   │   │   ├── database.py  # Database connection
│   │   │   └── cache.py     # Redis cache
│   │   ├── models/          # SQLAlchemy Models
│   │   │   ├── lesson.py    # Lesson model
│   │   │   ├── quiz.py      # Quiz models
│   │   │   ├── user.py      # User model
│   │   │   └── audio.py     # Audio file model
│   │   ├── schemas/         # Pydantic Schemas
│   │   ├── services/        # Business Logic
│   │   ├── static/          # Static files (audio)
│   │   └── main.py          # FastAPI app
│   ├── alembic/             # Database migrations
│   ├── requirements.txt     # Python dependencies
│   └── seed_data.py         # Database seeding
│
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/      # UI Components
│   │   │   └── ui/          # Reusable UI components
│   │   ├── pages/           # Page Components
│   │   │   ├── HomePage.tsx
│   │   │   ├── LessonsPage.tsx
│   │   │   ├── LessonDetailPage.tsx
│   │   │   ├── QuizPage.tsx
│   │   │   └── QuizDetailPage.tsx
│   │   ├── layouts/         # Layout Components
│   │   ├── services/        # API & WebSocket services
│   │   ├── contexts/        # React Contexts
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── App.tsx          # Main App component
│   ├── package.json         # Node dependencies
│   └── vite.config.ts       # Vite configuration
│
├── docker-compose.yml       # Docker services
└── README.md               # This file
```

## 🔧 API Endpoints

### Lessons
- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/{id}` - Get lesson by ID
- `POST /api/lessons` - Create new lesson
- `PUT /api/lessons/{id}` - Update lesson
- `DELETE /api/lessons/{id}` - Delete lesson

### Quiz
- `GET /api/quiz` - Get all quizzes
- `GET /api/quiz/{id}` - Get quiz by ID
- `GET /api/quiz/{id}/questions` - Get quiz questions
- `POST /api/quiz/submit` - Submit quiz answer
- `POST /api/quiz` - Create new quiz

### TTS (Text-to-Speech)
- `POST /api/tts` - Generate speech from text
- `GET /api/tts/cleanup` - Clean up old audio files

### WebSocket
- `WS /ws/quiz` - Real-time quiz interaction

## 🔊 TTS Language Support

| Language    | Model                                            | Status |
| ----------- | ------------------------------------------------ | ------ |
| English     | `tts_models/en/ljspeech/tacotron2-DDC`           | ✅     |
| French      | `tts_models/fr/mai/tacotron2-DDC`                | ✅     |
| Kinyarwanda | `tts_models/multilingual/multi-dataset/your_tts` | ✅     |

## 🗄️ Database Schema

### Tables
- **lessons** - Road safety lessons
- **quizzes** - Quiz collections
- **quiz_questions** - Individual quiz questions
- **quiz_responses** - User quiz responses
- **users** - User accounts (future feature)
- **audio_files** - Generated TTS audio files

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Database Migrations
```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Code Formatting
```bash
# Backend
cd backend
black .
isort .

# Frontend
cd frontend
npm run lint
npm run format
```

## 🌐 Deployment

### Production Setup
1. Set up PostgreSQL and Redis servers
2. Configure environment variables
3. Build and deploy containers
4. Set up reverse proxy (nginx)
5. Configure SSL certificates

### Environment Variables
```env
# Production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
SECRET_KEY=your-production-secret-key
ALLOWED_ORIGINS=["https://yourdomain.com"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License © 2024 Road Safety Learning Platform

## 🙏 Acknowledgments

- Coqui TTS for multilingual text-to-speech
- FastAPI for the excellent web framework
- React team for the amazing frontend library
- All contributors and supporters

---

**Built with ❤️ for safer roads worldwide**
