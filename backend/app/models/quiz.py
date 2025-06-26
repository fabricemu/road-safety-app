from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    language = Column(String(50), nullable=False)
    difficulty_level = Column(String(20), default="beginner")
    passing_score = Column(Integer, default=70)  # Percentage required to pass
    time_limit = Column(Integer)  # Time limit in minutes
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    lesson = relationship("Lesson", back_populates="quiz")
    questions = relationship("QuizQuestion", back_populates="quiz")
    
    def __repr__(self):
        return f"<Quiz(id={self.id}, title='{self.title}', language='{self.language}')>"

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # List of answer options
    correct_answer_index = Column(Integer, nullable=False)
    explanation = Column(Text)  # Explanation for the correct answer
    points = Column(Integer, default=1)
    question_type = Column(String(50), default="multiple_choice")  # multiple_choice, true_false, etc.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    quiz = relationship("Quiz", back_populates="questions")
    responses = relationship("QuizResponse", back_populates="question")
    
    def __repr__(self):
        return f"<QuizQuestion(id={self.id}, quiz_id={self.quiz_id})>"

class QuizResponse(Base):
    __tablename__ = "quiz_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("quiz_questions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_answer_index = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    response_time = Column(Integer)  # Time taken to answer in seconds
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    question = relationship("QuizQuestion", back_populates="responses")
    user = relationship("User")
    
    def __repr__(self):
        return f"<QuizResponse(id={self.id}, question_id={self.question_id}, is_correct={self.is_correct})>" 