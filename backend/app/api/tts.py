from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.tts_service import TTSService
from app.schemas.tts import TTSRequest, TTSResponse

router = APIRouter()
tts_service = TTSService()

@router.post("/tts", response_model=TTSResponse)
def synthesize(request: TTSRequest, db: Session = Depends(get_db)):
    """Generate speech from text"""
    try:
        result = tts_service.synthesize(request=request, db=db)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")

@router.get("/tts/cleanup")
def cleanup_old_files(max_age_hours: int = 24, db: Session = Depends(get_db)):
    """Clean up old audio files"""
    try:
        deleted_count = tts_service.cleanup_old_files(db=db, max_age_hours=max_age_hours)
        return {"message": f"Cleaned up {deleted_count} old audio files"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")