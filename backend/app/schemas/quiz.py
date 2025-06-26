from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Quiz Schemas
class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    language: str
    difficulty_level: str = "beginner"

class QuizCreate(QuizBase):
    pass

class QuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    difficulty_level: Optional[str] = None
    is_active: Optional[bool] = None

class Quiz(QuizBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Quiz Question Schemas
class QuizQuestionBase(BaseModel):
    question_text: str
    options: List[str]
    correct_answer_index: int
    explanation: Optional[str] = None
    points: int = 1

class QuizQuestionCreate(QuizQuestionBase):
    quiz_id: int

class QuizQuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    options: Optional[List[str]] = None
    correct_answer_index: Optional[int] = None
    explanation: Optional[str] = None
    points: Optional[int] = None
    is_active: Optional[bool] = None

class QuizQuestion(QuizQuestionBase):
    id: int
    quiz_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Quiz Response Schemas
class QuizResponseBase(BaseModel):
    user_answer_index: int
    response_time: Optional[int] = None

class QuizResponseCreate(QuizResponseBase):
    question_id: int

class QuizResponse(QuizResponseBase):
    id: int
    question_id: int
    is_correct: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
