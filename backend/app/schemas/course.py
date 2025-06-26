from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Course Schemas
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    language: str
    category: Optional[str] = None
    difficulty_level: str = "beginner"
    estimated_duration: Optional[int] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    category: Optional[str] = None
    difficulty_level: Optional[str] = None
    estimated_duration: Optional[int] = None
    is_active: Optional[bool] = None

class CourseResponse(CourseBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Module Schemas
class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int

class ModuleCreate(ModuleBase):
    pass

class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

class ModuleResponse(ModuleBase):
    id: int
    course_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Lesson Schemas
class LessonBase(BaseModel):
    title: str
    content: str
    language: str
    order_index: int
    lesson_type: str = "text"
    media_url: Optional[str] = None
    estimated_duration: Optional[int] = None

class LessonCreate(LessonBase):
    pass

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    language: Optional[str] = None
    order_index: Optional[int] = None
    lesson_type: Optional[str] = None
    media_url: Optional[str] = None
    estimated_duration: Optional[int] = None
    is_active: Optional[bool] = None

class LessonResponse(LessonBase):
    id: int
    module_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# User Progress Schemas
class UserProgressBase(BaseModel):
    completed: bool = False
    time_spent: Optional[int] = None
    score: Optional[float] = None

class UserProgressCreate(UserProgressBase):
    pass

class UserProgressResponse(UserProgressBase):
    id: int
    user_id: int
    lesson_id: int
    completion_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Course Enrollment Schemas
class CourseEnrollmentBase(BaseModel):
    pass

class CourseEnrollmentCreate(CourseEnrollmentBase):
    pass

class CourseEnrollmentResponse(CourseEnrollmentBase):
    id: int
    user_id: int
    course_id: int
    enrolled_at: datetime
    completed_at: Optional[datetime] = None
    progress_percentage: float
    certificate_issued: bool
    certificate_url: Optional[str] = None

    class Config:
        from_attributes = True

# Detailed Course Response with Modules and Lessons
class LessonWithProgress(LessonResponse):
    user_progress: Optional[UserProgressResponse] = None

class ModuleWithLessons(ModuleResponse):
    lessons: List[LessonWithProgress] = []

class CourseWithContent(CourseResponse):
    modules: List[ModuleWithLessons] = []
    enrollment: Optional[CourseEnrollmentResponse] = None
