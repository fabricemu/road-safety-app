from sqlalchemy.orm import Session
from app.models.lesson import Lesson
from app.schemas.lesson import LessonCreate, LessonUpdate
from typing import List, Optional

class LessonService:
    @staticmethod
    def get_lessons(db: Session, skip: int = 0, limit: int = 100, language: Optional[str] = None) -> List[Lesson]:
        query = db.query(Lesson).filter(Lesson.is_active == True)
        if language:
            query = query.filter(Lesson.language == language)
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_lesson(db: Session, lesson_id: int) -> Optional[Lesson]:
        return db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.is_active == True).first()
    
    @staticmethod
    def create_lesson(db: Session, lesson: LessonCreate) -> Lesson:
        db_lesson = Lesson(**lesson.dict())
        db.add(db_lesson)
        db.commit()
        db.refresh(db_lesson)
        return db_lesson
    
    @staticmethod
    def update_lesson(db: Session, lesson_id: int, lesson: LessonUpdate) -> Optional[Lesson]:
        db_lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if db_lesson:
            update_data = lesson.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_lesson, field, value)
            db.commit()
            db.refresh(db_lesson)
        return db_lesson
    
    @staticmethod
    def delete_lesson(db: Session, lesson_id: int) -> bool:
        db_lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
        if db_lesson:
            db_lesson.is_active = False
            db.commit()
            return True
        return False
