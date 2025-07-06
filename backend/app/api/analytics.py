from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc, Integer
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.user import User
from app.models.lesson import Lesson
from app.models.quiz import Quiz, QuizResponse
from app.models.lesson import Course, Module
from app.models.lesson import CourseEnrollment, UserProgress
from app.api.auth import get_current_admin_user

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """Get overall dashboard statistics"""
    try:
        # User statistics
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        admin_users = db.query(User).filter(User.is_admin == True).count()
        
        # Course statistics
        total_courses = db.query(Course).count()
        active_courses = db.query(Course).filter(Course.is_active == True).count()
        
        # Lesson statistics
        total_lessons = db.query(Lesson).count()
        active_lessons = db.query(Lesson).filter(Lesson.is_active == True).count()
        
        # Enrollment statistics
        total_enrollments = db.query(CourseEnrollment).count()
        active_enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.completed_at.is_(None)
        ).count()
        completed_enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.completed_at.is_not(None)
        ).count()
        
        # Quiz statistics
        total_quizzes = db.query(Quiz).count()
        active_quizzes = db.query(Quiz).filter(Quiz.is_active == True).count()
        
        # Recent activity (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_enrollments = db.query(CourseEnrollment).filter(
            CourseEnrollment.enrolled_at >= week_ago
        ).count()
        
        recent_progress = db.query(UserProgress).filter(
            UserProgress.created_at >= week_ago
        ).count()
        
        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "admins": admin_users
            },
            "courses": {
                "total": total_courses,
                "active": active_courses
            },
            "lessons": {
                "total": total_lessons,
                "active": active_lessons
            },
            "enrollments": {
                "total": total_enrollments,
                "active": active_enrollments,
                "completed": completed_enrollments
            },
            "quizzes": {
                "total": total_quizzes,
                "active": active_quizzes
            },
            "recent_activity": {
                "enrollments_7_days": recent_enrollments,
                "progress_updates_7_days": recent_progress
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard stats: {str(e)}")

@router.get("/user-analytics")
def get_user_analytics(
    days: int = 30,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_admin_user)
):
    """Get user analytics over time"""
    try:
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # User registration over time
        user_registrations = db.query(
            func.date(User.created_at).label('date'),
            func.count(User.id).label('count')
        ).filter(
            User.created_at >= start_date
        ).group_by(
            func.date(User.created_at)
        ).order_by(
            func.date(User.created_at)
        ).all()
        
        # User activity (users with progress in last 7 days)
        active_users_7d = db.query(User).join(UserProgress).filter(
            UserProgress.created_at >= end_date - timedelta(days=7)
        ).distinct().count()
        
        # User activity (users with progress in last 30 days)
        active_users_30d = db.query(User).join(UserProgress).filter(
            UserProgress.created_at >= end_date - timedelta(days=30)
        ).distinct().count()
        
        # Language preferences
        language_stats = db.query(
            User.preferred_language,
            func.count(User.id).label('count')
        ).group_by(User.preferred_language).all()
        
        return {
            "registration_trend": [
                {"date": str(reg.date), "count": reg.count} 
                for reg in user_registrations
            ],
            "active_users": {
                "last_7_days": active_users_7d,
                "last_30_days": active_users_30d
            },
            "language_preferences": [
                {"language": lang.preferred_language or "Not set", "count": lang.count}
                for lang in language_stats
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user analytics: {str(e)}")

@router.get("/course-analytics")
def get_course_analytics(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_admin_user)
):
    """Get course analytics"""
    try:
        # Most popular courses
        popular_courses = db.query(
            Course.id,
            Course.title,
            func.count(CourseEnrollment.id).label('enrollment_count')
        ).outerjoin(CourseEnrollment).group_by(
            Course.id, Course.title
        ).order_by(
            desc(func.count(CourseEnrollment.id))
        ).limit(10).all()
        
        # Course completion rates
        course_completion = db.query(
            Course.id,
            Course.title,
            func.count(CourseEnrollment.id).label('total_enrollments'),
            func.count(CourseEnrollment.completed_at).label('completed_enrollments')
        ).outerjoin(CourseEnrollment).group_by(
            Course.id, Course.title
        ).all()
        
        # Language distribution
        language_distribution = db.query(
            Course.language,
            func.count(Course.id).label('course_count')
        ).group_by(Course.language).all()
        
        # Difficulty distribution
        difficulty_distribution = db.query(
            Course.difficulty_level,
            func.count(Course.id).label('course_count')
        ).group_by(Course.difficulty_level).all()
        
        return {
            "popular_courses": [
                {
                    "id": course.id,
                    "title": course.title,
                    "enrollment_count": course.enrollment_count
                }
                for course in popular_courses
            ],
            "completion_rates": [
                {
                    "id": course.id,
                    "title": course.title,
                    "total_enrollments": course.total_enrollments,
                    "completed_enrollments": course.completed_enrollments,
                    "completion_rate": round(
                        (course.completed_enrollments / course.total_enrollments * 100) 
                        if course.total_enrollments > 0 else 0, 2
                    )
                }
                for course in course_completion
            ],
            "language_distribution": [
                {"language": lang.language, "count": lang.course_count}
                for lang in language_distribution
            ],
            "difficulty_distribution": [
                {"difficulty": diff.difficulty_level, "count": diff.course_count}
                for diff in difficulty_distribution
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching course analytics: {str(e)}")

@router.get("/quiz-analytics")
def get_quiz_analytics(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_admin_user)
):
    """Get quiz analytics"""
    try:
        # Quiz performance statistics
        quiz_performance = db.query(
            Quiz.id,
            Quiz.title,
            func.count(QuizResponse.id).label('total_responses'),
            func.avg(QuizResponse.is_correct.cast(Integer)).label('avg_correct_rate')
        ).outerjoin(QuizResponse).group_by(
            Quiz.id, Quiz.title
        ).all()
        
        # Overall quiz statistics
        total_quiz_responses = db.query(QuizResponse).count()
        correct_responses = db.query(QuizResponse).filter(QuizResponse.is_correct == True).count()
        overall_accuracy = (correct_responses / total_quiz_responses * 100) if total_quiz_responses > 0 else 0
        
        # Recent quiz activity (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_responses = db.query(QuizResponse).filter(
            QuizResponse.created_at >= week_ago
        ).count()
        
        return {
            "quiz_performance": [
                {
                    "id": quiz.id,
                    "title": quiz.title,
                    "total_responses": quiz.total_responses,
                    "avg_correct_rate": round(float(quiz.avg_correct_rate or 0) * 100, 2)
                }
                for quiz in quiz_performance
            ],
            "overall_stats": {
                "total_responses": total_quiz_responses,
                "correct_responses": correct_responses,
                "overall_accuracy": round(overall_accuracy, 2),
                "recent_responses_7_days": recent_responses
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching quiz analytics: {str(e)}")

@router.get("/user-count")
def get_user_count(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """Get total user count for dashboard"""
    try:
        total_users = db.query(User).count()
        return {"total_users": total_users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user count: {str(e)}") 