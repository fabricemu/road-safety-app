from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.api.auth import get_current_admin_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    return db.query(User).all()

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in user_update.items():
        if hasattr(user, field):
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"detail": "User deleted"} 