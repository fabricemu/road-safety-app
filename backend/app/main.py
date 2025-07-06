from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import tts, lessons, quiz, websocket, auth, courses, users, analytics, pdf_upload
from app.core.config import settings
from app.core.database import engine
from app.models import lesson, quiz as quiz_models, user, audio

# Create database tables
lesson.Base.metadata.create_all(bind=engine)
quiz_models.Base.metadata.create_all(bind=engine)
user.Base.metadata.create_all(bind=engine)
audio.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Road Safety Learning Platform",
    description="A multilingual platform for learning road safety rules and regulations",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include routers
app.include_router(auth.router, tags=["Authentication"])
app.include_router(courses.router, tags=["Courses"])
app.include_router(tts.router, prefix="/api", tags=["TTS"])
app.include_router(lessons.router, prefix="/api", tags=["Lessons"])
app.include_router(quiz.router, prefix="/api", tags=["Quiz"])
app.include_router(websocket.router, tags=["WebSocket"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(pdf_upload.router, prefix="/api", tags=["PDF Upload"])

@app.get("/")
async def root():
    return {
        "message": "Road Safety Learning Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}