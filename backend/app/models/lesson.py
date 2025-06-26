from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    language = Column(String(50), nullable=False)
    difficulty_level = Column(String(20), default="beginner")  # beginner, intermediate, advanced
    category = Column(String(100), default="general")  # traffic_signs, pedestrian, vehicle, etc.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Lesson(id={self.id}, title='{self.title}', language='{self.language}')>" 