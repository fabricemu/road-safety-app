from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from typing import List, Dict
import json
from app.core.database import get_db
from app.services.quiz_service import QuizService

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_sessions: Dict[str, Dict] = {}  # Track user quiz sessions

    async def connect(self, websocket: WebSocket, user_id: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if user_id:
            self.user_sessions[user_id] = {
                "websocket": websocket,
                "current_quiz": None,
                "score": 0,
                "questions_answered": 0
            }

    def disconnect(self, websocket: WebSocket, user_id: str = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id and user_id in self.user_sessions:
            del self.user_sessions[user_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                # Remove disconnected connections
                self.active_connections.remove(connection)

manager = ConnectionManager()

@router.websocket("/ws/quiz")
async def quiz_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "start_quiz":
                await handle_start_quiz(websocket, message)
            elif message.get("type") == "submit_answer":
                await handle_submit_answer(websocket, message)
            elif message.get("type") == "get_question":
                await handle_get_question(websocket, message)
            else:
                await manager.send_personal_message(
                    json.dumps({"type": "error", "message": "Unknown message type"}),
                    websocket
                )
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def handle_start_quiz(websocket: WebSocket, message: dict):
    """Handle quiz start request"""
    quiz_id = message.get("quiz_id")
    if not quiz_id:
        await manager.send_personal_message(
            json.dumps({"type": "error", "message": "Quiz ID required"}),
            websocket
        )
        return
    
    # Send quiz start confirmation
    await manager.send_personal_message(
        json.dumps({
            "type": "quiz_started",
            "quiz_id": quiz_id,
            "message": "Quiz started successfully"
        }),
        websocket
    )

async def handle_submit_answer(websocket: WebSocket, message: dict):
    """Handle answer submission"""
    question_id = message.get("question_id")
    answer_index = message.get("answer_index")
    response_time = message.get("response_time", 0)
    
    if question_id is None or answer_index is None:
        await manager.send_personal_message(
            json.dumps({"type": "error", "message": "Question ID and answer required"}),
            websocket
        )
        return
    
    # Here you would typically save to database
    # For now, just send back a mock response
    is_correct = answer_index == 1  # Mock correct answer
    
    await manager.send_personal_message(
        json.dumps({
            "type": "answer_result",
            "question_id": question_id,
            "is_correct": is_correct,
            "correct_answer": 1,  # Mock correct answer
            "explanation": "This is the correct answer because..."
        }),
        websocket
    )

async def handle_get_question(websocket: WebSocket, message: dict):
    """Handle get question request"""
    question_id = message.get("question_id")
    
    if not question_id:
        await manager.send_personal_message(
            json.dumps({"type": "error", "message": "Question ID required"}),
            websocket
        )
        return
    
    # Mock question data
    question_data = {
        "type": "question",
        "question_id": question_id,
        "question_text": "What should you do at a red light?",
        "options": ["Go", "Stop", "Slow down", "Honk"],
        "time_limit": 30
    }
    
    await manager.send_personal_message(
        json.dumps(question_data),
        websocket
    )
