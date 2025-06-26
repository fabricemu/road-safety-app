#!/usr/bin/env python3
"""
Seed data script for Road Safety Learning Platform
Populates the database with initial lessons and quiz content
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import lesson, quiz as quiz_models, user, audio
from app.schemas.lesson import LessonCreate
from app.schemas.quiz import QuizCreate, QuizQuestionCreate

def create_lessons(db: Session):
    """Create initial lessons"""
    lessons_data = [
        # English Lessons
        {
            "title": "Introduction to Road Safety",
            "content": "Road safety is everyone's responsibility. Whether you're a pedestrian, cyclist, or driver, understanding and following traffic rules helps keep everyone safe. Always be aware of your surroundings and follow traffic signals.",
            "language": "english",
            "difficulty_level": "beginner",
            "category": "general"
        },
        {
            "title": "Traffic Signals and Signs",
            "content": "Traffic signals control the flow of traffic. Red means stop, yellow means prepare to stop, and green means go. Traffic signs provide important information about road conditions, speed limits, and directions.",
            "language": "english",
            "difficulty_level": "beginner",
            "category": "traffic_signs"
        },
        {
            "title": "Pedestrian Safety",
            "content": "As a pedestrian, always use designated crosswalks and wait for the walk signal. Look both ways before crossing, even at intersections with traffic lights. Make eye contact with drivers to ensure they see you.",
            "language": "english",
            "difficulty_level": "beginner",
            "category": "pedestrian"
        },
        
        # French Lessons
        {
            "title": "Introduction à la Sécurité Routière",
            "content": "La sécurité routière est la responsabilité de tous. Que vous soyez piéton, cycliste ou conducteur, comprendre et respecter les règles de circulation aide à garder tout le monde en sécurité.",
            "language": "french",
            "difficulty_level": "beginner",
            "category": "general"
        },
        {
            "title": "Signaux et Panneaux de Circulation",
            "content": "Les signaux de circulation contrôlent le flux du trafic. Rouge signifie arrêt, jaune signifie préparez-vous à arrêter, et vert signifie allez-y. Les panneaux de signalisation fournissent des informations importantes.",
            "language": "french",
            "difficulty_level": "beginner",
            "category": "traffic_signs"
        },
        
        # Kinyarwanda Lessons
        {
            "title": "Intangiriro ku Mutekano w'Umuhanda",
            "content": "Umutekano w'umuhanda ni umwishingizi wa buri muntu. Niba uri umuntu uhaguruka, ukugeza ibisikile cyangwa ukugendera moto, gusobanukirwa no gukurikiza amategeko y'umuhanda bifasha kurinda buri muntu.",
            "language": "kinyarwanda",
            "difficulty_level": "beginner",
            "category": "general"
        },
        {
            "title": "Ibimenyetso n'Ibendera by'Umuhanda",
            "content": "Ibimenyetso by'umuhanda bigenzura uko abantu bagenda. Itara ritukura bisobanura hagarara, itara rigiye bisobanura tegereza guhagarara, itara kigori bisobanura komeza.",
            "language": "kinyarwanda",
            "difficulty_level": "beginner",
            "category": "traffic_signs"
        }
    ]
    
    for lesson_data in lessons_data:
        lesson_create = LessonCreate(**lesson_data)
        db_lesson = lesson.Lesson(**lesson_create.dict())
        db.add(db_lesson)
    
    db.commit()
    print(f"Created {len(lessons_data)} lessons")

def create_quizzes(db: Session):
    """Create initial quizzes"""
    quizzes_data = [
        {
            "title": "Basic Road Safety Quiz",
            "description": "Test your knowledge of basic road safety rules",
            "language": "english",
            "difficulty_level": "beginner"
        },
        {
            "title": "Quiz de Sécurité Routière de Base",
            "description": "Testez vos connaissances des règles de sécurité routière de base",
            "language": "french",
            "difficulty_level": "beginner"
        },
        {
            "title": "Quiz y'Umutekano w'Umuhanda",
            "description": "Gerageza ubumenyi bwawe ku mategeko y'umutekano w'umuhanda",
            "language": "kinyarwanda",
            "difficulty_level": "beginner"
        }
    ]
    
    for quiz_data in quizzes_data:
        quiz_create = QuizCreate(**quiz_data)
        db_quiz = quiz_models.Quiz(**quiz_create.dict())
        db.add(db_quiz)
    
    db.commit()
    print(f"Created {len(quizzes_data)} quizzes")
    
    # Get the created quizzes to add questions
    quizzes = db.query(quiz_models.Quiz).all()
    
    # Add questions for each quiz
    questions_data = {
        "english": [
            {
                "question_text": "What should you do at a red traffic light?",
                "options": ["Go", "Stop", "Slow down", "Honk"],
                "correct_answer_index": 1,
                "explanation": "Red light means stop. You must stop and wait for the light to turn green."
            },
            {
                "question_text": "What does a yellow traffic light mean?",
                "options": ["Go faster", "Stop if safe", "Turn right only", "Ignore it"],
                "correct_answer_index": 1,
                "explanation": "Yellow light means prepare to stop if it's safe to do so."
            },
            {
                "question_text": "Where should pedestrians cross the road?",
                "options": ["Anywhere", "At designated crosswalks", "In the middle of the road", "Behind vehicles"],
                "correct_answer_index": 1,
                "explanation": "Pedestrians should always use designated crosswalks for safety."
            }
        ],
        "french": [
            {
                "question_text": "Que devez-vous faire à un feu rouge?",
                "options": ["Passer", "Arrêter", "Ralentir", "Klaxonner"],
                "correct_answer_index": 1,
                "explanation": "Le feu rouge signifie arrêt. Vous devez vous arrêter et attendre que le feu devienne vert."
            },
            {
                "question_text": "Que signifie un feu jaune?",
                "options": ["Accélérer", "S'arrêter si possible", "Tourner à droite seulement", "L'ignorer"],
                "correct_answer_index": 1,
                "explanation": "Le feu jaune signifie se préparer à s'arrêter si c'est sûr de le faire."
            }
        ],
        "kinyarwanda": [
            {
                "question_text": "Ni iki ukora igihe uri imbere y'itara ritukura?",
                "options": ["Ukomereza imbere", "Urahagarara", "Utegereza gato", "Urasakuza"],
                "correct_answer_index": 1,
                "explanation": "Itara ritukura bisobanura hagarara. Ugomba guhagarara kugeza itara kigori."
            },
            {
                "question_text": "Itara rigiye bisobanura iki?",
                "options": ["Komeza vuba", "Hagarara niba byemewe", "Vugurura iburyo gusa", "Kirengagize"],
                "correct_answer_index": 1,
                "explanation": "Itara rigiye bisobanura tegereza guhagarara niba byemewe."
            }
        ]
    }
    
    for quiz in quizzes:
        language = quiz.language
        if language in questions_data:
            for question_data in questions_data[language]:
                question_data["quiz_id"] = quiz.id
                question_create = QuizQuestionCreate(**question_data)
                db_question = quiz_models.QuizQuestion(**question_create.dict())
                db.add(db_question)
    
    db.commit()
    print("Created quiz questions")

def main():
    """Main function to seed the database"""
    db = SessionLocal()
    try:
        print("Starting database seeding...")
        
        # Create lessons
        create_lessons(db)
        
        # Create quizzes and questions
        create_quizzes(db)
        
        print("Database seeding completed successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main() 