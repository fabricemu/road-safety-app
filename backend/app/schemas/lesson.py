from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LessonBase(BaseModel):
    title: str
    content: str
    language: str
    difficulty_level: str = "beginner"
    category: str = "general"

class LessonCreate(LessonBase):
    pass

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    language: Optional[str] = None
    difficulty_level: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

class Lesson(LessonBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True