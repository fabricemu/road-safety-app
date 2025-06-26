from sqlalchemy.orm import Session
from app.models.quiz import Quiz, QuizQuestion, QuizResponse
from app.schemas.quiz import QuizCreate, QuizUpdate, QuizQuestionCreate, QuizResponseCreate
from typing import List, Optional

class QuizService:
    @staticmethod
    def get_quizzes(db: Session, skip: int = 0, limit: int = 100, language: Optional[str] = None) -> List[Quiz]:
        query = db.query(Quiz).filter(Quiz.is_active == True)
        if language:
            query = query.filter(Quiz.language == language)
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_quiz(db: Session, quiz_id: int) -> Optional[Quiz]:
        return db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_active == True).first()
    
    @staticmethod
    def get_quiz_questions(db: Session, quiz_id: int) -> List[QuizQuestion]:
        return db.query(QuizQuestion).filter(
            QuizQuestion.quiz_id == quiz_id, 
            QuizQuestion.is_active == True
        ).all()
    
    @staticmethod
    def get_question(db: Session, question_id: int) -> Optional[QuizQuestion]:
        return db.query(QuizQuestion).filter(
            QuizQuestion.id == question_id, 
            QuizQuestion.is_active == True
        ).first()
    
    @staticmethod
    def submit_answer(db: Session, response: QuizResponseCreate) -> QuizResponse:
        # Get the question to check the answer
        question = db.query(QuizQuestion).filter(QuizQuestion.id == response.question_id).first()
        if not question:
            raise ValueError("Question not found")
        
        # Check if answer is correct
        is_correct = response.user_answer_index == question.correct_answer_index
        
        # Create response record
        db_response = QuizResponse(
            question_id=response.question_id,
            user_answer_index=response.user_answer_index,
            is_correct=is_correct,
            response_time=response.response_time
        )
        db.add(db_response)
        db.commit()
        db.refresh(db_response)
        return db_response
    
    @staticmethod
    def create_quiz(db: Session, quiz: QuizCreate) -> Quiz:
        db_quiz = Quiz(**quiz.dict())
        db.add(db_quiz)
        db.commit()
        db.refresh(db_quiz)
        return db_quiz
    
    @staticmethod
    def add_question(db: Session, question: QuizQuestionCreate) -> QuizQuestion:
        db_question = QuizQuestion(**question.dict())
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        return db_question
