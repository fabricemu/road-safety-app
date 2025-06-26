from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.services.quiz_service import QuizService
from app.schemas.quiz import Quiz, QuizCreate, QuizQuestion, QuizResponse, QuizResponseCreate

router = APIRouter()

@router.get("/quiz", response_model=List[Quiz])
def get_quizzes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    language: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all quizzes with optional filtering"""
    quizzes = QuizService.get_quizzes(db, skip=skip, limit=limit, language=language)
    return quizzes

@router.get("/quiz/{quiz_id}", response_model=Quiz)
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Get a specific quiz by ID"""
    quiz = QuizService.get_quiz(db, quiz_id=quiz_id)
    if quiz is None:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.get("/quiz/{quiz_id}/questions", response_model=List[QuizQuestion])
def get_quiz_questions(quiz_id: int, db: Session = Depends(get_db)):
    """Get all questions for a specific quiz"""
    questions = QuizService.get_quiz_questions(db, quiz_id=quiz_id)
    return questions

@router.get("/quiz/question/{question_id}", response_model=QuizQuestion)
def get_question(question_id: int, db: Session = Depends(get_db)):
    """Get a specific question by ID"""
    question = QuizService.get_question(db, question_id=question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@router.post("/quiz/submit", response_model=QuizResponse)
def submit_answer(response: QuizResponseCreate, db: Session = Depends(get_db)):
    """Submit an answer to a quiz question"""
    try:
        result = QuizService.submit_answer(db=db, response=response)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/quiz", response_model=Quiz)
def create_quiz(quiz: QuizCreate, db: Session = Depends(get_db)):
    """Create a new quiz"""
    return QuizService.create_quiz(db=db, quiz=quiz)
