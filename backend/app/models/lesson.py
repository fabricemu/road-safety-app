from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    language = Column(String(50), nullable=False)
    category = Column(String(100))  # e.g., "provisional_license", "road_safety_basics"
    difficulty_level = Column(String(20), default="beginner")
    estimated_duration = Column(Integer)  # in minutes
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    modules = relationship("Module", back_populates="course")
    
    def __repr__(self):
        return f"<Course(id={self.id}, title='{self.title}', language='{self.language}')>"

class Module(Base):
    __tablename__ = "modules"
    
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    order_index = Column(Integer, nullable=False)  # For ordering modules
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module")
    
    def __repr__(self):
        return f"<Module(id={self.id}, title='{self.title}', course_id={self.course_id})>"

class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    language = Column(String(50), nullable=False)
    order_index = Column(Integer, nullable=False)  # For ordering lessons within module
    lesson_type = Column(String(50), default="text")  # text, video, interactive
    media_url = Column(String(500))  # For video or audio content
    estimated_duration = Column(Integer)  # in minutes
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    module = relationship("Module", back_populates="lessons")
    quiz = relationship("Quiz", back_populates="lesson", uselist=False)
    
    def __repr__(self):
        return f"<Lesson(id={self.id}, title='{self.title}', module_id={self.module_id})>"

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    completed = Column(Boolean, default=False)
    completion_date = Column(DateTime(timezone=True))
    time_spent = Column(Integer)  # in seconds
    score = Column(Float)  # for quiz scores
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="progress")
    lesson = relationship("Lesson")
    
    def __repr__(self):
        return f"<UserProgress(user_id={self.user_id}, lesson_id={self.lesson_id}, completed={self.completed})>"

class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
    progress_percentage = Column(Float, default=0.0)
    certificate_issued = Column(Boolean, default=False)
    certificate_url = Column(String(500))
    
    # Relationships
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course")
    
    def __repr__(self):
        return f"<CourseEnrollment(user_id={self.user_id}, course_id={self.course_id})>" 