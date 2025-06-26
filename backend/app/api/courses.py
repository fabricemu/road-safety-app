from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.lesson import Course, Module, Lesson, UserProgress, CourseEnrollment
from app.api.auth import get_current_active_user, get_current_admin_user
from app.schemas.course import (
    CourseCreate, CourseUpdate, CourseResponse,
    ModuleCreate, ModuleUpdate, ModuleResponse,
    LessonCreate, LessonUpdate, LessonResponse,
    UserProgressCreate, UserProgressResponse,
    CourseEnrollmentCreate, CourseEnrollmentResponse
)

router = APIRouter(prefix="/courses", tags=["courses"])

# Course Management (Admin only)
@router.post("/", response_model=CourseResponse)
async def create_course(
    course: CourseCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    db_course = Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.get("/", response_model=List[CourseResponse])
async def get_courses(
    language: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Course).filter(Course.is_active == True)
    
    if language:
        query = query.filter(Course.language == language)
    if category:
        query = query.filter(Course.category == category)
    
    return query.all()

@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: int,
    course_update: CourseUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    for field, value in course_update.dict(exclude_unset=True).items():
        setattr(db_course, field, value)
    
    db.commit()
    db.refresh(db_course)
    return db_course

@router.delete("/{course_id}")
async def delete_course(
    course_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db.delete(db_course)
    db.commit()
    return {"message": "Course deleted successfully"}

# Module Management (Admin only)
@router.post("/{course_id}/modules", response_model=ModuleResponse)
async def create_module(
    course_id: int,
    module: ModuleCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    # Verify course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    db_module = Module(**module.dict(), course_id=course_id)
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module

@router.get("/{course_id}/modules", response_model=List[ModuleResponse])
async def get_modules(
    course_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    modules = db.query(Module).filter(
        Module.course_id == course_id,
        Module.is_active == True
    ).order_by(Module.order_index).all()
    return modules

@router.put("/modules/{module_id}", response_model=ModuleResponse)
async def update_module(
    module_id: int,
    module_update: ModuleUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    db_module = db.query(Module).filter(Module.id == module_id).first()
    if not db_module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    for field, value in module_update.dict(exclude_unset=True).items():
        setattr(db_module, field, value)
    
    db.commit()
    db.refresh(db_module)
    return db_module

# Lesson Management (Admin only)
@router.post("/modules/{module_id}/lessons", response_model=LessonResponse)
async def create_lesson(
    module_id: int,
    lesson: LessonCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    # Verify module exists
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    db_lesson = Lesson(**lesson.dict(), module_id=module_id)
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.get("/modules/{module_id}/lessons", response_model=List[LessonResponse])
async def get_lessons(
    module_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    lessons = db.query(Lesson).filter(
        Lesson.module_id == module_id,
        Lesson.is_active == True
    ).order_by(Lesson.order_index).all()
    return lessons

@router.put("/lessons/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: int,
    lesson_update: LessonUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    db_lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    for field, value in lesson_update.dict(exclude_unset=True).items():
        setattr(db_lesson, field, value)
    
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

# User Progress Tracking
@router.post("/lessons/{lesson_id}/progress", response_model=UserProgressResponse)
async def update_lesson_progress(
    lesson_id: int,
    progress: UserProgressCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify lesson exists
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check if progress already exists
    existing_progress = db.query(UserProgress).filter(
        UserProgress.user_id == current_user.id,
        UserProgress.lesson_id == lesson_id
    ).first()
    
    if existing_progress:
        # Update existing progress
        for field, value in progress.dict(exclude_unset=True).items():
            setattr(existing_progress, field, value)
        db.commit()
        db.refresh(existing_progress)
        return existing_progress
    else:
        # Create new progress
        db_progress = UserProgress(**progress.dict(), user_id=current_user.id, lesson_id=lesson_id)
        db.add(db_progress)
        db.commit()
        db.refresh(db_progress)
        return db_progress

@router.get("/progress", response_model=List[UserProgressResponse])
async def get_user_progress(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    progress = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).all()
    return progress

# Course Enrollment
@router.post("/{course_id}/enroll", response_model=CourseEnrollmentResponse)
async def enroll_in_course(
    course_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify course exists
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if already enrolled
    existing_enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id,
        CourseEnrollment.course_id == course_id
    ).first()
    
    if existing_enrollment:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")
    
    db_enrollment = CourseEnrollment(user_id=current_user.id, course_id=course_id)
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

@router.get("/enrollments", response_model=List[CourseEnrollmentResponse])
async def get_user_enrollments(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.user_id == current_user.id).all()
    return enrollments

# Course completion tracking
@router.get("/{course_id}/progress")
async def get_course_progress(
    course_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get enrollment
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == current_user.id,
        CourseEnrollment.course_id == course_id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="Not enrolled in this course")
    
    # Get all lessons in the course
    total_lessons = db.query(Lesson).join(Module).filter(Module.course_id == course_id).count()
    
    # Get completed lessons
    completed_lessons = db.query(UserProgress).join(Lesson).join(Module).filter(
        UserProgress.user_id == current_user.id,
        Module.course_id == course_id,
        UserProgress.completed == True
    ).count()
    
    progress_percentage = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
    
    return {
        "course_id": course_id,
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "progress_percentage": progress_percentage,
        "enrolled_at": enrollment.enrolled_at
    }
