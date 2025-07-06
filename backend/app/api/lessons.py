from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.services.lesson_service import LessonService
from app.schemas.lesson import Lesson, LessonCreate, LessonUpdate

router = APIRouter()

@router.get("/lessons", response_model=List[Lesson])
def get_lessons(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    language: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all lessons with optional filtering"""
    lessons = LessonService.get_lessons(db, skip=skip, limit=limit, language=language)
    return lessons 

@router.get("/lessons/{lesson_id}", response_model=Lesson)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    """Get a specific lesson by ID"""
    lesson = LessonService.get_lesson(db, lesson_id=lesson_id)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@router.post("/lessons", response_model=Lesson)
def create_lesson(lesson: LessonCreate, db: Session = Depends(get_db)):
    """Create a new lesson"""
    return LessonService.create_lesson(db=db, lesson=lesson)

@router.put("/lessons/{lesson_id}", response_model=Lesson)
def update_lesson(lesson_id: int, lesson: LessonUpdate, db: Session = Depends(get_db)):
    """Update an existing lesson"""
    updated_lesson = LessonService.update_lesson(db=db, lesson_id=lesson_id, lesson=lesson)
    if updated_lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return updated_lesson

@router.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    """Delete a lesson (soft delete)"""
    success = LessonService.delete_lesson(db=db, lesson_id=lesson_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"message": "Lesson deleted successfully"}