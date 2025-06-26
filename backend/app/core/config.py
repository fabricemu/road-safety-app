from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:fab@localhost:5432/roadsafety"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # TTS Settings
    TTS_MODELS_DIR: str = "app/static/tts_models"
    AUDIO_OUTPUT_DIR: str = "app/static/audio"
    
    # Supported Languages
    SUPPORTED_LANGUAGES: List[str] = ["english", "french", "kinyarwanda"]
    
    # TTS Model Mapping
    TTS_MODEL_MAP: dict = {
        "english": "tts_models/en/ljspeech/tacotron2-DDC",
        "french": "tts_models/fr/mai/tacotron2-DDC", 
        "kinyarwanda": "tts_models/multilingual/multi-dataset/your_tts"
    }
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
