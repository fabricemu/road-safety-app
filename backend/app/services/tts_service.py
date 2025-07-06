import uuid
import os
import time
from sqlalchemy.orm import Session
from app.models.audio import AudioFile
from app.schemas.tts import TTSRequest, TTSResponse
from app.core.config import settings
from typing import Optional
from TTS.api import TTS

class TTSService:
    def __init__(self):
        self.models = {}
        self._load_models()
    
    def _load_models(self):
        """Pre-load TTS models for better performance"""
        for language, model_name in settings.TTS_MODEL_MAP.items():
            try:
                self.models[language] = TTS(
                    model_name=model_name, 
                    progress_bar=False, 
                    gpu=False
                )
            except Exception as e:
                print(f"Failed to load model for {language}: {e}")
    
    def synthesize(self, request: TTSRequest, db: Session) -> TTSResponse:
        """Generate speech from text and save to database"""
        language = request.language.lower()
        
        if language not in settings.SUPPORTED_LANGUAGES:
            raise ValueError(f"Unsupported language: {language}")
        
        if language not in self.models:
            raise ValueError(f"TTS model not available for {language}")
        
        # Generate unique filename
        filename = f"{uuid.uuid4()}.wav"
        output_path = os.path.join(settings.AUDIO_OUTPUT_DIR, filename)
        
        # Ensure output directory exists
        os.makedirs(settings.AUDIO_OUTPUT_DIR, exist_ok=True)
        
        try:
            # Generate audio
            start_time = time.time()
            self.models[language].tts_to_file(
                text=request.text, 
                file_path=output_path
            )
            generation_time = time.time() - start_time
            
            # Get file info
            file_size = os.path.getsize(output_path) if os.path.exists(output_path) else 0
            
            # Save to database
            audio_file = AudioFile(
                filename=filename,
                original_text=request.text,
                language=language,
                file_path=output_path,
                file_size=file_size,
                duration=int(generation_time)
            )
            db.add(audio_file)
            db.commit()
            db.refresh(audio_file)
            
            return TTSResponse(
                audio_url=f"/static/audio/{filename}",
                filename=filename,
                duration=generation_time,
                file_size=file_size
            )
            
        except Exception as e:
            # Clean up file if it was created
            if os.path.exists(output_path):
                os.remove(output_path)
            raise Exception(f"TTS generation failed: {str(e)}")
    
    def get_audio_file(self, db: Session, filename: str) -> Optional[AudioFile]:
        """Get audio file record from database"""
        return db.query(AudioFile).filter(AudioFile.filename == filename).first()
    
    def cleanup_old_files(self, db: Session, max_age_hours: int = 24) -> int:
        """Clean up old audio files to save space"""
        import datetime
        cutoff_time = datetime.datetime.now() - datetime.timedelta(hours=max_age_hours)
        
        old_files = db.query(AudioFile).filter(
            AudioFile.created_at < cutoff_time
        ).all()
        
        deleted_count = 0
        for audio_file in old_files:
            try:
                if os.path.exists(audio_file.file_path):
                    os.remove(audio_file.file_path)
                db.delete(audio_file)
                deleted_count += 1
            except Exception as e:
                print(f"Failed to delete {audio_file.filename}: {e}")
        
        db.commit()
        return deleted_count
