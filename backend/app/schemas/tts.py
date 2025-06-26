from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TTSRequest(BaseModel):
    text: str
    language: str
    voice_speed: Optional[float] = 1.0
    voice_pitch: Optional[float] = 1.0

class TTSResponse(BaseModel):
    audio_url: str
    filename: str
    duration: Optional[float] = None
    file_size: Optional[int] = None

class AudioFileBase(BaseModel):
    filename: str
    original_text: str
    language: str
    file_path: str

class AudioFile(AudioFileBase):
    id: int
    file_size: Optional[int] = None
    duration: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
